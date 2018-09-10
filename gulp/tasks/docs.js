const { gulp, config } = global.akqa;
const open = require("gulp-open");
const path = require("path");
const packageJson = require("../../package");
const jsdoc = require("gulp-jsdoc3");
const sassDoc = require("sassdoc");

const sass = require("gulp-sass");
const sassGlob = require("gulp-sass-glob");
const plumbus = require("gulp-plumber"); // Everyone has a plumbus in their task.
const rename = require("gulp-rename");
const jsonImporter = require("node-sass-json-importer");
const cssPrefixer = require("gulp-autoprefixer");

const webpackStream = require("webpack-stream");




const docs = cb => {
    const docsConfig = config.tasks.docs;

    docsConfig.options = docsConfig.options || {};
    docsConfig.options.opts = docsConfig.options.opts || {};
    docsConfig.options.opts.destination = `${config.folders.root + docsConfig.targetFolder}`;

    docsConfig.options.opts.template = "./gulp/docs-theme";
    docsConfig.options.templates = docsConfig.options.templates || {};
    docsConfig.options.templates.systemName = packageJson.name;

    docsConfig.options.templates.systemVersion = packageJson.version;
    docsConfig.options.plugins = ["plugins/markdown"];
    docsConfig.options.listGlobalsAsIncomplete = docsConfig.listGlobalsAsIncomplete;


    const tasks = [];


    // CSS for documentation
    // ---------------------------------------------------
    tasks.push(new Promise(resolve => {
        gulp.src([
            `${docsConfig.options.opts.template}/static/src/scss/main.scss`,
            './node_modules/prismjs/themes/prism.css'
        ])
            .pipe(plumbus())
            .pipe(sassGlob())
            .pipe(sass({
                importer: [jsonImporter]
            }))
            .pipe(cssPrefixer(config.tasks.scss.autoPrefixerConfig))
            .pipe(rename({extname: '.css'}))
            .pipe(plumbus.stop())
            .pipe(gulp.dest(`${docsConfig.options.opts.template}/static/dist/css`))
            .on('end', resolve);
    }));


    // JS for documentation
    // ---------------------------------------------------
    tasks.push(new Promise(resolve => {
        const webpackModuleRules = [];
        const babelPlugins = [
            ["prismjs", {"languages": ["javascript", "css", "scss", "markup"]}]
        ];

        webpackModuleRules.unshift({
            test: /\.jsx?$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: [
                        ['@babel/env', config.tasks.javascript.babelPresetEnv]
                    ],
                    plugins: babelPlugins
                }
            }
        });

        webpackStream({
            entry: `${docsConfig.options.opts.template}/static/src/js/main.js`,
            devtool: false,
            mode: 'production',
            output: {
                filename: "[name].js",
                chunkFilename: "[name].js",
                pathinfo: true
            },
            module: {
                rules: webpackModuleRules
            }
        })
            .pipe(gulp.dest(`${docsConfig.options.opts.template}/static/dist/js`))
            .on('end', resolve);
    }));


    // SassDoc
    // ---------------------------------------------------
    docsConfig.options.sassDoc = [];
    tasks.push(new Promise(resolve => {
        const files = config.tasks.docs.sources.scss.map(sourceFolder => path.resolve(config.folders.root, config.folders.sourceFolder, sourceFolder, '**/*.scss'));
        sassDoc.parse(files, {verbose: false}).then(data => {
            docsConfig.options.sassDoc = data;
            resolve();
        });
    }));


    // JSDoc
    // ---------------------------------------------------
    Promise.all(tasks).then(() => {
        const files = config.tasks.docs.sources.js.map(sourceFolder => path.resolve(config.folders.root, config.folders.sourceFolder, sourceFolder, '**/*.js'));
        gulp.src([].concat(config.tasks.docs.sources.mainPage, files), {read: false})
            .pipe(jsdoc(docsConfig.options, () => {
                gulp.src(`${docsConfig.options.opts.destination}/index.html`, {read: false})
                    .pipe(open());
                cb();
            }));
    });
};

module.exports = docs;
