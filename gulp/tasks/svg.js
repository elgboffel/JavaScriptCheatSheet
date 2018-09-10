const { gulp, config } = global.akqa;
const path = require("path");
const destMultiple = require("../helpers/destMultiple");
const buildFolderCollection = require("../helpers/buildFolderCollection");
const colors = require("ansi-colors");
const log = require("fancy-log");


/**
 * Process the given SVG folder and do stuff to the folders inside it.
 *
 * @param {object} settings
 * @param {boolean} settings.enable
 * @param {string} settings.sourceFolder
 * @param {string} settings.targetFolder
 * @param {boolean} settings.removeIDsFromOutput
 * @param {string} [settings.bundleName]
 * @param {object} [settings.cheerio]
 * @param {boolean} [settings.cheerio.removeDefs]
 * @param {boolean} [isBundle=false]
 */
function processSVGFolder(settings, isBundle = false) {

    const svgmin = require("gulp-svgmin");
    const gulpIf = require("gulp-if");
    const rename = require("gulp-rename");
    const cheerio = require("gulp-cheerio");
    const plumber = require("gulp-plumber");
    const svgstore = require("gulp-svgstore");
    const outputFolders = buildFolderCollection(settings.targetFolder);
    const sourceFolder = path.resolve(config.folders.root, config.folders.sourceFolder, settings.sourceFolder);

    const pipe = gulp
        .src(path.resolve(sourceFolder, "**/*.svg"))
        .pipe(plumber())
        .pipe(svgmin(file => {
            const prefix = path.basename(file.relative, path.extname(file.relative));
            return {
                plugins: [
                    {
                        cleanupIDs: {
                            prefix: `${prefix}-`,
                            minify: true,
                            remove: settings.removeIDsFromOutput
                        }
                    }
                ]
            };
        }))
        .pipe(gulpIf(!isBundle, destMultiple(outputFolders)))
        .pipe(gulpIf(isBundle, svgstore()))

        // Run the bundle through Cheerio in order to optimize it even further.
        .pipe(gulpIf(isBundle && typeof settings.cheerio === "object", cheerio({
            parserOptions: { xmlMode: true },
            run: $ => {
                // Remove "defs" definition from bundles, since that will just be straight messed up anyways.
                if (settings.cheerio.removeDefs) {
                    $('defs').remove();
                }

                // You can add similar optimizations here if you wish.
            }
        })))

        .pipe(gulpIf(isBundle, rename(settings.bundleName)))
        .pipe(plumber.stop())
        .pipe(gulpIf(isBundle, destMultiple(outputFolders)));


    // We can't use gulp-if here, since the instance might be undefined, which screws up everything.
    // This, however ugly, works fine.
    if (global.akqa.browsersyncInstance) {
        pipe.pipe(global.akqa.browsersyncInstance.stream({match: '**/*.svg'}));
    }

    return pipe;
}


module.exports = () => {
    let pipeline;

    if (typeof config.tasks.svg.individualFiles === "object" &&
        config.tasks.svg.individualFiles.enable &&
        config.tasks.svg.individualFiles.sourceFolder
    ) {
        log(`${colors.green('- Processing individual SVG-files')}`);
        pipeline = processSVGFolder(config.tasks.svg.individualFiles);
    }

    if (typeof config.tasks.svg.bundle === "object" &&
        config.tasks.svg.bundle.enable &&
        config.tasks.svg.bundle.sourceFolder &&
        config.tasks.svg.bundle.bundleName
    ) {
        log(`${colors.green('- Creating SVG-bundle as ')}${colors.cyan(config.tasks.svg.bundle.bundleName)}`);
        pipeline = processSVGFolder(config.tasks.svg.bundle, true);
    }

    return pipeline;

};
