/*global global, process */
/* eslint no-console: 0 */
const { gulp, config } = global.akqa;
const path = require("path");
const colors = require("ansi-colors");
const log = require("fancy-log");
const url = require("url");
const fs = require("fs");

const basePath = path.resolve(config.folders.root, config.tasks.browsersync.baseDir);

const spaMiddleware = (enabled, defaultFile) => {
    if (!enabled) return;

    return (req, res, next) => {
        let fileName = url.parse(req.url);
        fileName = fileName.href.split(fileName.search).join("");
        const fileExists = fs.existsSync(basePath + fileName);

        if (!fileExists && fileName.indexOf("browser-sync-client") < 0) {
            req.url = defaultFile;
        }

        return next();
    };
};

function browsersync(done) {
    if (config.tasks.browsersync.enable) {

        if (config.tasks.serviceworkers.enable && config.tasks.browsersync.port === 3000) {
            console.log('');
            console.log('');
            log(colors.yellow('**********************************************************************************************************************'));
            log(`${colors.yellow(colors.bold('WARNING:'))} BrowserSync is running at port 3000, and the service worker task is enabled.`);
            log(`If you run more than one project with a service worker on the same port, you are gonna have a bad time.`);
            log(`Please stop, and change ${colors.green('tasks.browsersync.port')} in ${colors.green('gulp/config.json')} to something else.`);
            log(colors.yellow('**********************************************************************************************************************'));
            console.log('');
            console.log('');
        }

        global.akqa.browsersyncInstance = require("browser-sync").create();

        const browserSyncConfig = {
            ui: {
                port: config.tasks.browsersync.uiPort
            },
            port: config.tasks.browsersync.port,
            https: config.tasks.browsersync.https,
            ghostMode: config.tasks.browsersync.ghostMode,
            online: config.tasks.browsersync.online
        };

        const spaEnabled = config.tasks.browsersync.spa && config.tasks.browsersync.spa.enabled;
        const baseFile = config.tasks.browsersync.spa.baseFile;

        // if-statement defines whether to use server or proxy setup, as you can't run Browsersync with both.
        if (!config.tasks.browsersync.proxy) {
            browserSyncConfig.server = {
                baseDir: basePath,
                index: config.tasks.browsersync.indexFile,
                routes: config.tasks.browsersync.routes,
                middleware: [spaMiddleware(spaEnabled, baseFile)]
            };
        } else {
            browserSyncConfig.proxy = config.tasks.browsersync.proxy;
        }


        if (config.tasks.browsersync.enableSSI) {
            const browserSyncSSI = require("browsersync-ssi");

            if (!config.tasks.browsersync.proxy) {
                browserSyncConfig.server.middleware = [browserSyncSSI({
                    baseDir: basePath,
                    ext: '.shtml',
                    version: '1.4.0'
                }), spaMiddleware(spaEnabled, baseFile)];
            }

        }

        global.akqa.browsersyncInstance.init(browserSyncConfig, () => {
            if (global.akqa.castlab) {
                sendExternalUrl(global.akqa.browsersyncInstance.getOption('urls').get('external'));
            }
        });

        if (config.tasks.browsersync.htmlFolders.length && config.tasks.browsersync.htmlFilePatterns.length) {

            const watchPaths = [];

            config.tasks.browsersync.htmlFolders.forEach(folder =>
                config.tasks.browsersync.htmlFilePatterns.forEach(filePattern =>
                    watchPaths.push(path.relative(config.folders.root, path.resolve(basePath, folder, filePattern))))
            );

            // Watch the given basepath for changes to HTML/SHTML-files.
            gulp
                .watch(watchPaths, { cwd: path.resolve(config.folders.root) })
                .on('change', global.akqa.browsersyncInstance.reload);

        }

        if (config.tasks.browsersync.proxy) {
            log(colors.bold(`***********************************`));
            log(colors.bold(colors.yellow(`Browsersync using proxy with vHost: `)), colors.bold(colors.green(config.tasks.browsersync.proxy)));
            log(colors.bold(`***********************************`));
        }
    }

    done();
}


function sendExternalUrl(url) {

    const fetch = require("node-fetch");
    const data = {
        "title": process.env.npm_package_description,
        "location": global.akqa.castlabLocation,
        "message": url
    };

    fetch(
        "https://castlab.akqa-play.dk/api/notify",
        {
            credentials: "same-origin",
            method: "post",
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(() => {
            console.log(``);
            log(`************************************************************************************************`);
            log(`***`);
            log(`*** Compiling in ${colors.yellow(colors.bold(`CastLab mode`))} - no minification performed!`);
            log(`*** The CastLab task will send the external url, that Browsersync creates, to an AKQA API.`);
            log(`*** It is then used to open a browser on test devices which has the CastLab app installed.`);
            log(`*** Get the CastLab app for your device here: ${colors.yellow(colors.bold('https://castlab.dis-play.dk'))}`);
            log(`***`);
            log(`*** You are testing on devices located at the ${colors.yellow(colors.bold((global.akqa.castlabLocation === "aarhus" ? "Aarhus" : "Copenhagen")))} office`);
            log(`***`);
            log(`************************************************************************************************`);
            console.log(``);
        })
        .catch(err => {
            log(colors.red(`******************************************************************************`));
            log(colors.red(colors.bold(`*** CastLab error response:`)));
            log(colors.red(colors.bold(`*** ${err} ***`)));
            log(colors.red(`******************************************************************************`));
        });
}


module.exports = browsersync;

