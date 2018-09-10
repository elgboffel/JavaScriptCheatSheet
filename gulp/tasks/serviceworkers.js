/*global global, __dirname */
const { config } = global.akqa;
const destMultiple = require("../helpers/destMultiple");
const buildFolderCollection = require("../helpers/buildFolderCollection");
const notifier = require("node-notifier");
const path = require("path");
const bumpFile = require("bump-file");
const defaultOutputFolders = buildFolderCollection(config.tasks.serviceworkers.targetFolder);
const colors = require("ansi-colors");
const log = require("fancy-log");




function errorHandler(err) {
    notifier.notify({
        title: 'JS compile error',
        message: err.message,
        icon: path.resolve(__dirname, '../icons/js.png')
    });

    log(colors.red("******************************************************************************"));
    log(colors.red(colors.bold(err.stack)));
    log(colors.red("******************************************************************************"));

    if (global.akqa.production) {
        throw new Error(err.message);
    }

    this.emit('end');
}



/**
 * Perform compilation of a single javascript file.
 *
 * @param {string} entrypoint - The file to process.
 * @returns {Promise}
 */
function doCompile(entrypoint) {

    const webpackStream = require("webpack-stream");
    const StringReplacePlugin = require("string-replace-webpack-plugin");
    const buffer = require("vinyl-buffer");
    const stripComments = require("gulp-strip-comments");

    // Find out whether or not to build for production use.
    const buildForProduction = global.akqa.production || !config.disableMinificationDuringDevelopment;

    const plugins = [
        new StringReplacePlugin()
    ];

    const pipe = webpackStream({
        entry: entrypoint,
        mode: buildForProduction ? 'production' : 'development',
        plugins,
        output: {
            filename: path.basename(entrypoint)
        },
        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: StringReplacePlugin.replace({
                                replacements: [
                                    {
                                        pattern: "// ##INSERT-LOGGING##",
                                        replacement: () => buildForProduction ? "" : "import { enableLog } from './utils/log'; enableLog();"
                                    }
                                ]
                            })
                        },
                        {
                            loader: 'babel-loader',
                            options: {
                                presets: [
                                    ["babel-preset-env", {
                                        "targets": {
                                            "browsers": ["last 2 versions", "safari >= 11.1"]
                                        }
                                    }]
                                ]
                            }
                        }
                    ]
                }
            ]
        }
    })
        .on('error', errorHandler) // Handle errors gracefully
        .pipe(buffer())
        // Strip comments. We might not be minifying, but there's no reason to deliver commented code to the end user.
        .pipe(stripComments())
        .pipe(destMultiple(defaultOutputFolders));


    // We can't use gulp-if here, since the instance might be undefined, which screws up everything.
    // This, however ugly, works fine.
    if (global.akqa.browsersyncInstance) {
        pipe.pipe(global.akqa.browsersyncInstance.stream({match: '**/*.js'}));
    }

    return pipe;

}



module.exports = function(taskIsDone) {

    if (!config.tasks.serviceworkers.enable) {
        taskIsDone();
        return;
    }

    const pathToVersionFile = path.resolve(config.folders.root, "setup", config.tasks.serviceworkers.versionFile);
    const serviceWorkerSourcePath = path.resolve(config.folders.root, config.folders.sourceFolder, config.tasks.serviceworkers.sourceFolder);
    const fs = require("graceful-fs");

    function whenFilesAreReady() {
        if (global.akqa.browsersyncInstance) {
            global.akqa.browsersyncInstance.reload("*.js");
        }

        taskIsDone();
    }


    bumpFile(pathToVersionFile, { increment: 'patch' })
        .then(data => {
            fs.readdir(serviceWorkerSourcePath, (cb, files) => {
                const promises = [];
                files.forEach(file => {
                    const fileLocation = path.resolve(serviceWorkerSourcePath, file);
                    if (fs.lstatSync(fileLocation).isFile()) {
                        log(colors.green('- processing ') + colors.yellow(`${path.basename(fileLocation)}@${data.version}`));
                        promises.push(doCompile(fileLocation));
                    }
                });

                Promise.all(promises).then(whenFilesAreReady);
            });
        });

};

