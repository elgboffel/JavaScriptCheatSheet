/**
* ZIP
*
* Set up tasks for making a ZIP file
* containing only the needed files for production
*/
const { gulp } = global.akqa;

const zip = () => {

    const zip = require("gulp-zip");
    const plumber = require("gulp-plumber");

    return gulp.src([
        '!{.gitignore,.editorconfig,.jshintrc,bower.json,gulpfile.js,install.bat,package.json,README.md,web.config,frontline.zip,.eslintrc.json}',
        '!.git',
        '!node_modules', '!node_modules/**',
        '!modules-html', '!modules-html/**',
        '!gulp', '!gulp/**',
        '!static/src', '!static/src/**',
        './**'
    ])
        .pipe(plumber())
        .pipe(zip('frontline.zip'))
        .pipe(plumber.stop())
        .pipe(gulp.dest('.'));

};


module.exports = zip;
