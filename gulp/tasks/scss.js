/*global global, __dirname */
const { gulp, config } = global.akqa;
const path = require("path");
const destMultiple = require("../helpers/destMultiple");
const notifier = require("node-notifier");
const buildFolderCollection = require("../helpers/buildFolderCollection");
const outputFolders = buildFolderCollection(config.tasks.scss.targetFolder);
const colors = require("ansi-colors");
const log = require("fancy-log");


function errorHandler(err) {
    notifier.notify({
        title: 'SCSS compile error',
        message: err.message,
        icon: path.resolve(__dirname, '../icons/scss.png')
    });


    if (global.akqa.production) {
        throw new Error(err.message);
    } else {
        log(colors.red(colors.bold(`**** SCSS compile error!\n${err.message}`)));
    }
    this.emit('end');
}


const scss = function() {

    const sass = require("gulp-sass");
    const sassGlob = require("gulp-sass-glob");
    const sourcemaps = require("gulp-sourcemaps");
    const cssPrefixer = require("gulp-autoprefixer");
    const plumbus = require("gulp-plumber"); // Everyone has a plumbus in their task.
    const rename = require("gulp-rename");
    const gulpif = require("gulp-if");
    const groupByMediaQueries = require("gulp-group-css-media-queries");
    const jsonImporter = require("node-sass-json-importer");
    const cssNano = require("gulp-cssnano");


    const cssNanoConfig = config.tasks.scss.cssNanoConfig || {};
    cssNanoConfig.autoprefixer = cssNanoConfig.autoprefixer || config.tasks.scss.autoPrefixerConfig;


    const pipe = gulp.src(
        config.tasks.scss.entryPoints,
        {
            cwd: path.resolve(config.folders.root, config.folders.sourceFolder, config.tasks.scss.sourceFolder)
        }
    )
        .pipe(plumbus({ errorHandler })) // There are several hizzards in the way.

        // Fire up source mapping if we're not building for production.
        .pipe(gulpif(!global.akqa.production, sourcemaps.init()))

        // Run file through SASS-glob and -compiler
        .pipe(sassGlob())
        .pipe(sass({
            importer: [jsonImporter]
        }))

        // Group statements by media queries if that feature is enabled. Please be aware this feature might conceivably
        // mess up your code, so please make sure you get the right results. If not, disable the feature for your site.
        .pipe(gulpif(config.tasks.scss.groupMediaQueries, groupByMediaQueries()))

        // Just auto-prefix CSS3-properties if we are building for development purposes.
        // Minify the CSS if we're building to production - see http://cssnano.co/options/ for info about CSS Nano.
        // See configuration for autoprefixer here: https://github.com/postcss/autoprefixer
        .pipe(gulpif(
            global.akqa.castlab || (!global.akqa.production && config.disableMinificationDuringDevelopment),
            cssPrefixer(config.tasks.scss.autoPrefixerConfig),
            cssNano(cssNanoConfig)
        ))

        // Rename CSS file
        .pipe(rename({extname: '.css', suffix: '.min'}))

        // Write sourcemaps, if we've built 'em
        .pipe(gulpif(!global.akqa.production, sourcemaps.write('.')))

        // Stop the Plumbus. It's important to stop the Plumbus, because the Plumbus has all the Fleeb juice.
        .pipe(plumbus.stop())

        // Let's output!
        .pipe(destMultiple(outputFolders));

    // We can't use gulp-if here, since the instance might be undefined, which screws up everything.
    // This, however ugly, works fine.
    if (global.akqa.browsersyncInstance) {
        pipe.pipe(global.akqa.browsersyncInstance.stream({match: '**/*.css'}));
    }

    // Return the pipe so the task handler knows when we're done.
    return pipe;

};


module.exports = scss;
