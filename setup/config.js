
/**
 * IMPORTANT: This is where you define the browser compatibility needed for your output!
 * *************************************************************************************
 *
 * Set this to the absolute minimum you need to support. The newer the browser, the less
 * transpiling is needed. For a new-Chrome-only experience, you could deliver pure ES6
 * by setting this to "last 2 Chrome versions", for example.
 *
 * You can find examples on how to configure this here:
 * https://github.com/browserslist/browserslist#full-list
 *
 * @private
 * @type {string[]}
 */
const supportedBrowsers = ["last 2 versions", "IE 11"];





const configuration = {

    /** Set this to true to disable all minificaton during normal development. Normally you'd want to set this to "true". */
    disableMinificationDuringDevelopment: true,


    /** "folders" are where you define all the default paths for the tasks to use. These are pretty important. */
    folders: {
        /** The root is the path of the resources relative to the gulpfile. You shouldn't change this. */
        root: "./",

        /**
         * The sourceFolder is where you keep all your source files. Makes a certain kind of sense when
         * you think about it.
         */
        sourceFolder: "static/src/",

        /**
         * The targetFolder(s) is/are where you want your compiled assets to go. This path is relative to the
         * root, so you can easily add "../Webroot/static/" too, but remember that the more targetFolders you
         * have, the more junk you'll put on your harddrive. If you want a special setup for use in BrowserSync
         * or similar, there are much smarter ways than adding a billion targetPaths. ;-)
         */
        targetFolder: [
            "static/dist/"
        ],


        /**
         * This path is where Babel/Webpack will look for dynamically imported JS and CSS during runtime. This
         * path MUST correspond to the asset path on your website (this includes the initial slash!), or things
         * will break for you at some point. If you don't use dynamically imported code, don't worry about it.
         */
        dynamicJSImportSource: "/static/dist/js/"
    },



    /** This is where you define the setup for all the tasks. */
    tasks: {

        appveyor: {
            tasks: [
                "modernizr",
                "svg",
                "copyAssets",
                "scss",
                "javascript",
                "zip"
            ]
        },


        browsersync: {
            /** Enable BrowserSync? */
            enable: true,

            /** Enable the engine for parsing SHTML/SSI statements? */
            enableSSI: false,

            spa: {
                enabled: true,
                baseFile: "/index.html"
            },

            /** Which file should be used as the index? */
            indexFile: "index.html",

            /** Which directory should be used as the resource root? */
            baseDir: "./",

            /**
             * Routes are cool. This is where you can point BrowserSync to load various paths from different folders,
             * in case your setup is "weird", or you don't want a billion targetFolders (do you remember reading about
             * this? If not, go back and start from the top!). Examples of valid routes would be:
             *
             *  // Any request to "/js" should be loaded from the "../Webroot/js" folder instead.
             *    "/js": "../Webroot/js/"
             *
             *  // The same for CSS:
             *    "/css": "../Webroot/css/"
             *
             *  // Or you can just map a single file:
             *    "/SomeFile.txt": "../../../yo.doc"
             *
             * The possibilities are almost endless, and lets you create a pretty advanced setup without having more
             * than the one targetFolder. Neat, huh?
             *
             * The default here, "/static", ensures that "absolute" calls to static files are resolved correctly in
             * case of the user being inside a subfolder.
             */
            routes: {
                "/static": "static"
            },

            /** "port" is the port BrowserSync will listen on. You really should change this, ESPECIALLY if you're going to use service workers. */
            port: 3000,

            /** "uiPort" is the port BrowserSync will set its administration interface up on. */
            uiPort: 3001,

            /** Y'all want HTTPS or nah? */
            https: false,

            /** How many interactions should carry between different sessions on the same BrowserSync-server? */
            ghostMode: {
                clicks: true,
                forms: true,
                scroll: false
            },

            /** You can reduce startup time by setting this to "false" in case you're... you know, offline. */
            online: true,

            /**
             * You can setup BrowserSync to act as a proxy instead of a server. This lets you serve a local site
             * (from IIS or Visual Studio) to your local network for easier debugging and testing. Do this by
             * setting the target address here. The address must be without the protocol-prefix (`http://` or
             * `https://`). For example: "localhost:52456" or "frontline.dis-play.local"
             */
            proxy: "",

            /** These are the folders inside which we'll be watching for HTML-changes. Just because. */
            htmlFolders: [
                "./",
                "demo-html-folder/"
            ],

            /** Which files should be treated as HTML-files (with or without SSI-parsing)? */
            htmlFilePatterns: [
                "*.shtml",
                "*.html"
            ]
        },



        build: {
            /** Once a build is performed (during "build", "default" or similar tasks), these are the tasks that are run. */
            tasks: [
                "modernizr",
                "svg",
                "copyAssets",
                "scss",
                "serviceworkers",
                "javascript"
            ]
        },



        msbuild: {
            solutionSettings: "../../../../../install/solution-properties.json",
            msbuildPath: "C:\\Program Files (x86)\\MSBuild\\14.0\\Bin\\msbuild.exe",
            packageFolder: "../obj/Local/Package/PackageTmp",
            webroot: "../../../www",
            defaultTarget: "Build",
            verbosity: "minimal",
            filesToPublish: [
                "../bin/**/*.*",
                "../views/**/*.*",
                "!../*.cs",
                "static/dist/**/*.*"
            ]
        },



        clean: {
            /** These tasks will be cleaned when the "clean" task is run. Their target folder(s) will be deleted. Simple as that. */
            tasks: [
                "svg",
                "copyAssets",
                "javascript",
                "scss"
            ]
        },


        copyAssets: {
            /**
             * These folders beneath the "global sourceFolder" will be copied 1:1 to the output. Very useful for fonts
             * and similar resources, but please don't do it for SVG-files.
             */
            sourceFolder: [
                "fonts",
                "img",
                "media"
            ],
            targetFolder: ".",
            watch: true,
            watchFor: "*.*"
        },


        javascript: {
            /** Where do we get the source? */
            sourceFolder: "js",

            /**
             * Exclude certain source files from the linter. If you add your own code to this, I will look for you,
             * I will find you, and I will kill you. Well, maybe not KILL... but don't do it.
             */
            excludeFromLint: [
                "vendor/**/*.js"
            ],

            /** Where does the code end up? */
            targetFolder: "js",

            /**
             * Each entrypoint will result in a separate payload. There are much better ways of splitting up your
             * code, so unless you're making two *completely* separate sites (and in that case, why the heck are
             * you putting all your eggs in one basket like this?), you should use dynamic imports and lazy-loading.
             * It's faster, it's more efficient, and it lets Webpack do some pretty amazing stuff behind the scenes.
             */
            entryPoints: [
                "main.js"
            ],

            /** This is the transpiler. You like the transpiler. The transpiler is your friend. */
            babelPresetEnv: {
                modules: false,
                targets: {
                    browsers: supportedBrowsers
                }
            },

            /** Do we watch for changes? */
            watch: true,

            watchFor: "*.*",

            /** Which tasks should be run when a file changes? */
            watchRun: [
                "eslint",
                "javascript"
            ],
            stylesInJS: {
                useDynamicIncludes: true,
                useStyleInjectionInDevelopment: false,
                staticFilename: "[name].css",
                dynamicFilename: "[name].[hash:6].css",
                outputFolderName: "components",
                cssModulesEnabled: false,
                classNamePatternDevelopment: "[path][name]__[local]--[hash:base64:6]",
                classNamePatternProduction: "[name]--[hash:base64:6]"
            }
        },


        modernizr: {
            filename: "modernizr.js",
            targetFolder: "js"
        },




        scss: {
            sourceFolder: "scss",
            targetFolder: "css",
            entryPoints: [
                "critical.scss",
                "main.scss"
            ],
            excludeFromLint: [
                "vendor/**/*.{,s}css"
            ],
            cssNanoConfig: {
                zindex: false,
                reduceIdents: false
            },
            autoPrefixerConfig: {
                /** As with the JS, there's no reason to prefix code for browsers you're not going to support anyway. */
                browsers: supportedBrowsers,
                add: true
            },
            groupMediaQueries: true,
            watch: true,
            watchFor: "*.scss",
            watchRun: [
                "stylelint",
                "scss"
            ]
        },




        serviceworkers: {
            enable: false,
            versionFile: "serviceworker-version.json",
            sourceFolder: "serviceworkers",
            targetFolder: "../../",
            watch: true,
            watchFor: "*.*",
            watchRun: [
                "eslint",
                "serviceworkers"
            ]
        },




        svg: {
            /**
             * Outputting individual SVG-files and injecting them in the DOM at build- or runtime is very much preferred.
             * Here's how to import an SVG-file across various platforms:
             *
             * Cross-platform C# CMS (confirmed on SiteCore, Umbraco, EpiServer):
             *     @Html.Raw(File.ReadAllText(Server.MapPath("~/static/dist/svg/name-of-svg.svg")))
             *
             * Umbraco (newer baseline):
             *     @Static.IncludeFile("~/static/dist/svg/name-of-svg.svg")
             *
             * SHTML:
             *     <!--#include virtual="/static/dist/svg/name-of-svg.svg" -->
             *
             * Javascript (note the source path!). Inject it using element.innerHTML, the "html" property in createElement(), or dangerouslySetInnerHTML in React.
             *     import someIcon from '../svg-individual/name-of-svg.svg';
             *     window.console.log(someIcon);
             *
             *
             * */
            individualFiles: {
                enable: true,
                sourceFolder: "svg-individual",
                targetFolder: "svg",
                removeIDsFromOutput: true
            },

            /**
             * This subtask builds a bundle of all your SVG-files and lets you refer to the content using <svg><use>,
             * but though this cuts the amount of requests down drastically, compared to inserting links to individual
             * files, there are drawbacks to this technique. Please try to have the CMS inject the SVG content, because
             * then there are NO javascript-dependencies (svg4everybody) and no extra requests – plus, it lets you animate
             * and style the individual parts of the SVG, so everybody wins.
             *
             * What's that, you say? You're making a static HTML site and have no CMS? Just use the SHTML-capabilities,
             * and then render to HTML from there. This can be fully automated in minutes... just ask!
             *
             * Ideally, you'd not use this part at all.
             */
            bundle: {
                enable: true,
                sourceFolder: "svg-bundle",
                targetFolder: "svg",
                bundleName: "_bundle.svg",
                /** Cheerio is used to clean up the SVGs before bundling them. */
                cheerio: {
                    removeDefs: true
                },
                removeIDsFromOutput: true
            },
            cleanTargetFolders: [
                "svg"
            ],
            watch: true,
            watchFor: "*.svg",
            watchFolders: [
                "svg-bundle",
                "svg-individual"
            ]
        },




        /**
         * Documentation makes everything easier for us and the robots that help us.
         * This task is for generating an easy-to-read set of HTML-files with descriptions and examples
         * for all our utilities. - Good for beginners and for brushing up.
         */
        docs: {
            sources: {
                mainPage: "README.md",
                scss: [
                    "scss/utilities",
                    "scss/layout"
                ],
                js: [
                    "js/utils"
                ]
            },
            targetFolder: "docs",

            /**
             * Globals are utilities without the @module directive
             * We don't like those, and listing them as incomplete is helpful when working on new utilities.
             */
            listGlobalsAsIncomplete: true
        }
    }
};

module.exports = configuration;
