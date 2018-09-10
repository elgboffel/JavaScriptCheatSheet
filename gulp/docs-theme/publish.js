"use strict";

/**
 * @module template/publish
 * @type {*}
 */
/*global env: true */

let data,
    view,
    outdir = env.opts.destination;

const utilsName = 'Utils',
    utilsNameLC = utilsName.toLocaleLowerCase(),
    template = require('jsdoc/template'),
    doop = require('jsdoc/util/doop'),
    fs = require('jsdoc/fs'),
    path = require('jsdoc/path'),
    taffy = require('taffydb').taffy,
    helper = require('jsdoc/util/templateHelper'),
    parseMarkdown = require('jsdoc/util/markdown').getParser(),
    htmlsafe = helper.htmlsafe,
    linkto = helper.linkto,
    resolveAuthorLinks = helper.resolveAuthorLinks,
    hasOwnProp = Object.prototype.hasOwnProperty,
    conf = env.conf.templates || {},
    sassDoc = env.conf.sassDoc,
    sortedSassDoc = {},
    listGlobalsAsIncomplete = env.conf.listGlobalsAsIncomplete,
    buildNav = require('./utils/buildNav'),
    searchableDocuments = {};


function sortSassDoc() {
    const paths = {};
    sassDoc.forEach(doc => {
        if (typeof paths[doc.context.type] === "undefined") {
            paths[doc.context.type] = {};
        }

        paths[doc.context.type][doc.context.name] = `scss-${doc.group[0].replace(/\s/g, '-')}.html#${doc.context.type}-${doc.context.name}`;
    });

    sassDoc.forEach(doc => {
        const name = doc.context.name;
        const type = doc.context.type;
        const category = type === "css" ? "CSS" : type.charAt(0).toUpperCase() + type.slice(1) + (type.slice(-1) === "s" ? "" : "s");
        const directive = type === "placeholder" ? "@extend" : type === "mixin" ? "@include" : '';
        const groupTitle = doc.group[0];
        const groupName = groupTitle.replace(/\s/g, '-');
        const description = parseMarkdown(doc.description);
        const author = doc.author;
        const params = doc.parameter;
        const props = doc.properties;
        const returns = doc.return || (type === "variable" && doc.type ? ({type: doc.type}) : "");
        const output = doc.output;
        const access = doc.access;
        const todo = doc.todo;
        const code = type === "css" ? doc.context.value ? `${name} {\n    ${doc.context.value}\n}` : "" : doc.code;
        const seeOther = !doc.see ? [] : doc.see.map(item => ({...item, docsPath: paths[item.context.type][item.context.name]}));
        const usedBy = !doc.usedBy ? [] : doc.usedBy.map(item => ({...item, docsPath: paths[item.context.type][item.context.name]}));
        const requiresOther = !doc.require ? [] : doc.require.map(item => ({...item, docsPath: paths[item.type][item.name]}));
        const mixinContent = typeof doc.content === "undefined" ? false : doc.content ? doc.content : true;
        const deprecated = doc.deprecated === "" ? true : doc.deprecated;
        const examples = doc.example;

        if (groupName === "undefined" || access === "private") {
            return;
        }

        if (typeof sortedSassDoc[groupName] === "undefined") {
            sortedSassDoc[groupName] = [{
                kind: "scss",
                name: groupTitle,
                modules: {},
                longname: `scss:${groupName}`
            }];
        }

        if (typeof sortedSassDoc[groupName][0].modules[category] === "undefined") {
            sortedSassDoc[groupName][0].modules[category] = [];
        }

        sortedSassDoc[groupName][0].modules[category].push({
            name: (type === 'placeholder' ? '%' : '') + name,
            kind: "scss",
            id: `${type}-${name}`,
            directive,
            groupName,
            groupTitle,
            type,
            seeOther,
            todo,
            code,
            usedBy,
            requiresOther,
            description,
            mixinContent,
            author,
            params,
            props,
            returns,
            output,
            examples,
            deprecated,
            longname: `scss:${groupName}/${type}/${name}`
        });
    });
}


function generateSassDoc() {
    Object.keys(sortedSassDoc).forEach(group => {
        const title = `<i>SCSS:</i> ${sortedSassDoc[group][0].name}`;
        const docData = {
            title,
            cleanTitle: title.replace(/<(?:.|\n)*?>/gm, ''),
            docs: sortedSassDoc[group],
            docType: "scss"
        };
        const filename = `${sortedSassDoc[group][0].longname.replace('scss:', 'scss-')}.html`;

        const outpath = path.join(outdir, filename);
        const html = view.render("container.tmpl", docData);

        searchableDocuments[filename] = {
            id: filename,
            title: title.replace(/<(?:.|\n)*?>/gm, ''),
            subTitles: searchSubTitles(html),
            body: searchData(html)
        };

        fs.writeFileSync(outpath, html, "utf8");
    });
}


function find(spec) {
    return helper.find(data, spec);
}

function getAncestorLinks(doclet) {
    return helper.getAncestorLinks(data, doclet);
}

function hashToLink(doclet, hash) {
    if (!/^(#.+)/.test(hash)) {
        return hash;
    }

    let url = helper.createLink(doclet);

    url = url.replace(/(#.+|$)/, hash);
    return `<a href="${url}">${hash}</a>`;
}

function needsSignature(doclet) {
    let needsSig = false;

    // function and class definitions always get a signature
    if (doclet.kind === 'function' || doclet.kind === 'class') {
        needsSig = true;
    }
    // typedefs that contain functions get a signature, too
    else if (doclet.kind === 'typedef' && doclet.type && doclet.type.names && doclet.type.names.length) {
        for (let i = 0, l = doclet.type.names.length; i < l; i += 1) {
            if (doclet.type.names[i].toLowerCase() === 'function') {
                needsSig = true;
                break;
            }
        }
    }

    return needsSig;
}

function addSignatureParams(f) {
    const optionalClass = 'optional';
    const params = helper.getSignatureParams(f, optionalClass);

    f.signature = `${(f.signature || '')}<span class="definition__arguments">(`;

    for (let i = 0, l = params.length; i < l; i += 1) {
        const element = params[i];
        const seperator = (i > 0) ? ', ' : '';

        if (!new RegExp(`class=["|']${optionalClass}["|']`).test(element)) {
            f.signature += `${seperator}<wbr><span class="definition__argument">${(f.params[i].variable ? "..." : "") + element}</span>`;
        } else {
            const regExp = new RegExp(`<span class=["|']${optionalClass}["|']>(.*?)<\\/span>`, "i");
            f.signature += element.replace(regExp, ` $\`[${seperator}<span class="definition__argument">${f.params[i].variable ? "..." : ""}$1</span>$']`);
        }

    }

    f.signature += ')</span>';
    f.signature = f.signature.replace(/\( \[/g, '([').replace(/\[, /g, '[,&nbsp;');
}

function addSignatureReturns(f) {
    const returnTypes = helper.getSignatureReturns(f);

    f.signature = `<span class="signature">${(f.signature || '')}</span>${returnTypes.length ? ` => {<span class="definition__return-types">${returnTypes.join('</span>|<wbr><span class="definition__return-types">')}</span>}` : ''}`;
}

function addSignatureTypes(f) {
    const types = helper.getSignatureTypes(f);

    f.signature = `${(f.signature || '')}<span class="definition__return-types">${types.length ? ` :${types.join('|')}` : ''}</span>`;
}

function addAttribs(f) {
    const attribs = helper.getAttribs(f);

    f.attribs = `<span class="definition__types">${(attribs.length ? `&lt;<span class="definition__type">${attribs.join('</span>, <span class="definition__type">')}</span>&gt; ` : '')}</span>`;
}

function searchData(suppliedHtml) {
    const cheerio = require('cheerio');
    const $ = cheerio.load(suppliedHtml);
    const stripped = [];

    $('.searchable').each((index, element) => {
        stripped.push($(element).text().trim().replace(/\s+/g, ' '));
    });

    return stripped.join(' ');
}

function searchSubTitles(suppliedHtml) {
    const cheerio = require('cheerio');
    const $ = cheerio.load(suppliedHtml);
    const subTitles = [];

    $('.function').each((index, element) => {
        const id = $(element).find('.function__target').attr('id');
        const title = $(element).find('.function__header h4').text().trim().replace(/\s+/g, ' ');

        if (id && title) {
            subTitles.push({
                id,
                title
            });
        }
    });

    return subTitles;
}

function generate(docType, title, docs, filename, suppliedResolveLinks) {
    const resolveLinks = suppliedResolveLinks !== false;

    const docData = {
        title,
        cleanTitle: title.replace(/<(?:.|\n)*?>/gm, ''),
        docs,
        docType
    };

    const outpath = path.join(outdir, filename);
    let html = view.render('container.tmpl', docData);

    if (resolveLinks) {
        html = helper.resolveLinks(html); // turn {@link foo} into <a href="foodoc.html">foo</a>
    }

    if (docType !== 'index') {
        searchableDocuments[filename] = {
            id: filename,
            title: title.replace(/<(?:.|\n)*?>/gm, ''),
            subTitles: searchSubTitles(html),
            body: searchData(html)
        };
    }

    fs.writeFileSync(outpath, html, 'utf8');
}

/**
 * Look for classes or functions with the same name as modules (which indicates that the module
 * exports only that class or function), then attach the classes or functions to the `module`
 * property of the appropriate module doclets. The name of each class or function is also updated
 * for display purposes. This function mutates the original arrays.
 *
 * @private
 * @param {Array.<module:jsdoc/doclet.Doclet>} doclets - The array of classes and functions to
 * check.
 * @param {Array.<module:jsdoc/doclet.Doclet>} modules - The array of module doclets to search.
 */
function attachModuleSymbols(doclets, modules) {
    const symbols = {};

    // build a lookup table
    doclets.forEach(symbol => {
        symbols[symbol.longname] = symbols[symbol.longname] || [];
        symbols[symbol.longname].push(symbol);
    });

    return modules.map(module => {
        if (symbols[module.longname]) {
            module.modules = symbols[module.longname]
            // Only show symbols that have a description. Make an exception for classes, because
            // we want to show the constructor-signature heading no matter what.
                .filter(symbol => symbol.description || symbol.kind === 'class')
                .map(symbol => {
                    const newSymbol = doop(symbol);

                    if (newSymbol.kind === 'class' || newSymbol.kind === 'function') {
                        newSymbol.name = `${newSymbol.name.replace('module:', '(require("')}"))`;
                    }

                    return newSymbol;
                });
        }
    });
}

/**
 @param {TAFFY} taffyData See <http://taffydb.com/>.
 @param {object} opts
 @param {Tutorial} tutorials
 */
exports.publish = function (taffyData, opts, tutorials) {
    data = taffyData;

    conf.default = conf.default || {};

    const templatePath = opts.template;
    view = new template.Template(`${templatePath}/tmpl`);

    // claim some special filenames in advance, so the All-Powerful Overseer of Filename Uniqueness
    // doesn't try to hand them out later
    //	var indexUrl = helper.getUniqueFilename( 'index' );
    // don't call registerLink() on this one! 'index' is also a valid longname

    // set up templating
    // set up templating
    view.layout = 'layout.tmpl';

    // set up tutorials for helper
    helper.setTutorials(tutorials);

    data = helper.prune(data);

    helper.addEventListeners(data);

    data().each(doclet => {
        doclet.attribs = '';

        if (doclet.examples) {
            doclet.examples = doclet.examples.map(suppliedExample => {
                let example = suppliedExample;
                let caption;
                let lang;

                // allow using a markdown parser on the examples captions (surrounded by useless HTML p tags)
                if (example.match(/^\s*(<p>)?<caption>([\s\S]+?)<\/caption>(\s*)([\s\S]+?)(<\/p>)?$/i)) {
                    caption = RegExp.$2;
                    example = RegExp.$4 + (RegExp.$1 ? '' : RegExp.$5);
                }

                lang = /{@lang (.*?)}/.exec(example);

                if (lang && lang[1]) {
                    example = example.replace(lang[0], "");
                    lang = lang[1];

                } else {
                    lang = null;
                }

                return {
                    caption: caption ? parseMarkdown(caption) : '',
                    code: example,
                    lang: lang || "javascript"
                };
            });
        }
        if (doclet.see) {
            doclet.see.forEach((seeItem, i) => {
                doclet.see[i] = hashToLink(doclet, seeItem);
            });
        }
    });

    // update outdir if necessary, then create outdir
    const packageInfo = (find({
        kind: 'package'
    }) || [])[0];
    if (packageInfo && packageInfo.name) {
        if (packageInfo.version) {
            outdir = path.join(outdir, packageInfo.name, packageInfo.version);
        } else {
            outdir = path.join(outdir, packageInfo.name);
        }
    }
    fs.mkPath(outdir);

    // copy the template's static files to outdir
    const fromDir = path.join(templatePath, 'static/dist');
    const staticFiles = fs.ls(fromDir, 3);

    staticFiles.forEach(fileName => {
        const toFile = fileName.replace(fromDir, outdir);
        const toDir = fs.toDir(toFile);
        fs.mkPath(toDir);
        fs.copyFileSync(fileName, '', toFile);
    });

    // copy user-specified static files to outdir
    let staticFilePaths;
    let staticFileFilter;
    let staticFileScanner;
    if (conf.default.staticFiles) {
        // The canonical property name is `include`. We accept `paths` for backwards compatibility
        // with a bug in JSDoc 3.2.x.
        staticFilePaths = conf.default.staticFiles.include ||
            conf.default.staticFiles.paths ||
            [];
        staticFileFilter = new (require('jsdoc/src/filter')).Filter(conf.default.staticFiles);
        staticFileScanner = new (require('jsdoc/src/scanner')).Scanner();

        staticFilePaths.forEach(filePath => {
            const extraStaticFiles = staticFileScanner.scan([filePath], 10, staticFileFilter);

            extraStaticFiles.forEach(fileName => {
                const sourcePath = fs.toDir(filePath);
                const toDir = fs.toDir(fileName.replace(sourcePath, outdir));
                fs.mkPath(toDir);
                fs.copyFileSync(fileName, toDir);
            });
        });
    }

    data().each(doclet => {
        const url = helper.createLink(doclet);
        helper.registerLink(doclet.longname, url);
    });

    data().each(doclet => {
        const url = helper.longnameToUrl[doclet.longname];

        if (url.indexOf('#') > -1) {
            doclet.id = helper.longnameToUrl[doclet.longname].split(/#/).pop();
        } else {
            doclet.id = doclet.name;
        }

        if (needsSignature(doclet)) {
            addSignatureParams(doclet);
            addSignatureReturns(doclet);
            addAttribs(doclet);
        }
    });

    // do this after the urls have all been generated
    data().each(doclet => {
        doclet.ancestors = getAncestorLinks(doclet);

        if (doclet.kind === 'member') {
            addSignatureTypes(doclet);
            addAttribs(doclet);
        }

        if (doclet.kind === 'constant') {
            addSignatureTypes(doclet);
            addAttribs(doclet);
            doclet.kind = 'member';
        }
    });

    const members = helper.getMembers(data);
    members.tutorials = tutorials.children;

    // add template helpers
    view.find = find;
    view.linkto = linkto;
    view.resolveAuthorLinks = resolveAuthorLinks;
    view.htmlsafe = htmlsafe;

    // Sort SassDoc
    if (sassDoc.length) {
        sortSassDoc();
    }

    // once for all
    const navBuilded = buildNav(members, sortedSassDoc);
    view.nav = navBuilded[0];
    view.navOptions = navBuilded[1];
    attachModuleSymbols(
        find({
            kind: ['class', 'function'],
            longname: {
                left: 'module:'
            }
        }),
        members.modules);

    view.globalsSorted = [];
    if (listGlobalsAsIncomplete && members.globals.length) {
        const globals = members.globals.map(item => ({name: item.longname, file: item.meta.filename}));
        const globalsSorted = {};

        globals.forEach(item => {
            if (typeof globalsSorted[item.file] === 'undefined') {
                globalsSorted[item.file] = [];
            }
            globalsSorted[item.file].push(item.name);
            globalsSorted[item.file].sort();
        });

        view.globalsSorted = globalsSorted;
    }

    generateSassDoc();

    // index page displays information from package.json and lists files
    const files = find({
            kind: 'file'
        }),
        packages = find({
            kind: 'package'
        });

    generate('index', 'Index',
        packages.concat(
            [{
                kind: 'mainpage',
                readme: opts.readme,
                longname: (opts.mainpagetitle) ? opts.mainpagetitle : 'Main Page'
            }]
        ).concat(files),
        view.nav.index.link);

    // set up the lists that we'll use to generate pages
    const modules = taffy(members.modules);
    const interfaces = taffy(members.interfaces);
    const externals = taffy(members.externals);

    for (const longname in helper.longnameToUrl) {
        if (hasOwnProp.call(helper.longnameToUrl, longname)) {
            const myModules = helper.find(modules, {
                longname
            });
            if (myModules.length) {
                if (myModules[0].name.indexOf(utilsNameLC) === 0) {
                    generate('module', `<i>Utility:</i> ${myModules[0].name.replace(`${utilsNameLC}/`, '')}`, myModules, helper.longnameToUrl[longname]);
                } else {
                    generate('module', `<i>Module:</i> ${myModules[0].name}`, myModules, helper.longnameToUrl[longname]);
                }
            }

            const myInterfaces = helper.find(interfaces, {
                longname
            });
            if (myInterfaces.length) {
                generate('interface', `<i>Interface:</i> ${myInterfaces[0].name}`, myInterfaces, helper.longnameToUrl[longname]);
            }

            const myExternals = helper.find(externals, {
                longname
            });
            if (myExternals.length) {
                generate('external', `<i>External:</i> ${myExternals[0].name}`, myExternals, helper.longnameToUrl[longname]);
            }
        }
    }

    // TODO: move the tutorial functions to templateHelper.js
    function generateTutorial(title, tutorial, filename) {
        const tutorialData = {
            title,
            header: tutorial.title,
            content: tutorial.parse(),
            children: tutorial.children,
            docs: null
        };

        const tutorialPath = path.join(outdir, filename);
        let html = view.render('tutorial.tmpl', tutorialData);

        // yes, you can use {@link} in tutorials too!
        html = helper.resolveLinks(html); // turn {@link foo} into <a href="foodoc.html">foo</a>

        searchableDocuments[filename] = {
            id: filename,
            title,
            body: searchData(html)
        };

        fs.writeFileSync(tutorialPath, html, 'utf8');
    }

    // tutorials can have only one parent so there is no risk for loops
    function saveChildren(node) {
        node.children.forEach(child => {
            generateTutorial(`Tutorial: ${child.title}`, child, helper.tutorialToUrl(child.name));
            saveChildren(child);
        });
    }

    saveChildren(tutorials);

    const tmplString = fs.readFileSync(`${`${templatePath}/tmpl`}/quicksearch.tmpl`).toString(),
        tmpl = tmplString.replace('<%= searchableDocuments %>', JSON.stringify(searchableDocuments)),
        outpath = path.join(outdir, "quicksearch.html");

    fs.writeFileSync(outpath, tmpl, "utf8");
};
