/*global env: true */

const utilsName = 'Utils';
const utilsNameLC = utilsName.toLocaleLowerCase();
const utilsTitle = 'Javascript utilities';

const helper = require('jsdoc/util/templateHelper');
const linkto = helper.linkto;
const globalUrl = helper.getUniqueFilename('global');
const indexUrl = helper.getUniqueFilename('index');
const makeNavList = require('./makeNavList');
const conf = env.conf.templates || {};

const navOptions = {
    systemName: conf.systemName || "Documentation",
    systemVersion: conf.systemVersion || ""
};

const navigationMaster = {
    index: {
        title: navOptions.systemName,
        link: indexUrl,
        members: []
    },
    namespace: {
        title: "Namespaces",
        members: []
    },
    module: {
        title: "Modules",
        members: []
    },
    class: {
        title: "Classes",
        members: []
    },
    mixin: {
        title: "Mixins",
        members: []
    },
    scss: {
        title: "SCSS utilities",
        members: []
    },
    event: {
        title: "Events",
        link: helper.getUniqueFilename("events.list"),
        members: []
    },
    interface: {
        title: "Interfaces",
        link: helper.getUniqueFilename("interfaces.list"),
        members: []
    },
    tutorial: {
        title: "Tutorials",
        link: helper.getUniqueFilename("tutorials.list"),
        members: []
    },
    external: {
        title: "Externals",
        link: helper.getUniqueFilename("externals.list"),
        members: []
    }
};


/**
 * Create the navigation sidebar.
 * @param {object} members The members that will be used to create the sidebar.
 * @param {array<object>} members.classes
 * @param {array<object>} members.externals
 * @param {array<object>} members.globals
 * @param {array<object>} members.mixins
 * @param {array<object>} members.interfaces
 * @param {array<object>} members.modules
 * @param {array<object>} members.namespaces
 * @param {array<object>} members.tutorials
 * @param {array<object>} members.events
 * @param {object} sortedSassDoc
 * @return {string} The HTML for the navigation sidebar.
 */
module.exports = function buildNav(members, sortedSassDoc) {

    const seen = {};
    const nav = navigationMaster;

    const sortedSassGroups = Object.keys(sortedSassDoc);

    if (sortedSassGroups.length) {
        sortedSassGroups.forEach(sassGroup => {
            nav.scss.members.push(`<a href="${sortedSassDoc[sassGroup][0].longname.replace('scss:', 'scss-')}.html">${sortedSassDoc[sassGroup][0].name}</a>`);
        });
    }

    if (members.modules.length) {

        members.modules.forEach(m => {
            if (!Object.prototype.hasOwnProperty.call(seen, m.longname)) {

                nav.module.members.push(linkto(m.longname, m.longname.replace("module:", "")));
            }
            seen[m.longname] = true;
        });
    }

    if (members.externals.length) {

        members.externals.forEach(e => {
            if (!Object.prototype.hasOwnProperty.call(seen, e.longname)) {

                nav.external.members.push(linkto(e.longname, e.name.replace(/(^"|"$)/g, '')));
            }
            seen[e.longname] = true;
        });
    }

    if (members.events.length) {

        members.events.forEach(e => {
            if (!Object.prototype.hasOwnProperty.call(seen, e.longname)) {

                nav.event.members.push(linkto(e.longname, e.longname.replace("module:", "")));
            }
            seen[e.longname] = true;
        });

    }

    if (members.namespaces.length) {

        members.namespaces.forEach(n => {
            if (!Object.prototype.hasOwnProperty.call(seen, n.longname)) {

                nav.namespace.members.push(linkto(n.longname, n.longname.replace("module:", "")));
            }
            seen[n.longname] = true;
        });

    }

    if (members.mixins.length) {

        members.mixins.forEach(m => {
            if (!Object.prototype.hasOwnProperty.call(seen, m.longname)) {

                nav.mixin.members.push(linkto(m.longname, m.longname.replace("module:", "")));
            }
            seen[m.longname] = true;
        });

    }

    if (members.interfaces && members.interfaces.length) {

        members.interfaces.forEach(m => {
            if (!Object.prototype.hasOwnProperty.call(seen, m.longname)) {

                nav.interface.members.push(linkto(m.longname, m.longname.replace("module:", "")));
            }
            seen[m.longname] = true;
        });

    }

    const topLevelNav = [];
    Object.keys(nav).forEach(name => {
        const entry = nav[name];
        if (entry.members.length > 0 && name !== "index") {
            const nestedMembers = {};
            entry.members.forEach(member => {
                const pathMatch = member.match(/>([a-z0-9/\s-]*)</i);
                const path = pathMatch && pathMatch.length ? pathMatch[1].split('/') : [];
                const pathDepth = path.length;

                let nestedMembersCheck = nestedMembers;
                path.forEach((pathItem, index) => {
                    if (index === pathDepth - 1) {

                        if (typeof nestedMembersCheck._ === 'undefined') {
                            nestedMembersCheck._ = [];
                        }

                        nestedMembersCheck._.push(member.replace(/>([a-z/]*)</i, `>${pathItem}<`));

                    } else {
                        if (typeof nestedMembersCheck[pathItem] === 'undefined') {
                            nestedMembersCheck[pathItem] = {};
                        }

                        nestedMembersCheck = nestedMembersCheck[pathItem];
                    }
                });
            });

            if (typeof nestedMembers.utils !== 'undefined') {
                topLevelNav.push({
                    title: utilsTitle,
                    list: makeNavList(nestedMembers.utils)
                });

                delete nestedMembers.utils;
            }

            if (Object.keys(nestedMembers).length) {
                topLevelNav.push({
                    title: entry.title,
                    list: makeNavList(nestedMembers)
                });
            }
        }
    });

    // Show Utils second to last in navigation
    topLevelNav.sort((a, b) => {
        const aTitle = a.title.toLocaleLowerCase();
        const bTitle = b.title.toLocaleLowerCase();
        return aTitle === utilsNameLC ? 1 : aTitle > bTitle ? 1 : aTitle < bTitle ? -1 : 0;
    });

    // Show SCSS last in navigation
    topLevelNav.sort((a, b) => {
        const aTitle = a.title.toLocaleLowerCase();
        const bTitle = b.title.toLocaleLowerCase();
        return aTitle === 'scss' ? 1 : aTitle > bTitle ? 1 : aTitle < bTitle ? -1 : 0;
    });

    nav.topLevelNav = topLevelNav;

    return [navigationMaster, navOptions];
};
