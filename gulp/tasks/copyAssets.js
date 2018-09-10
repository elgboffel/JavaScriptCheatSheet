/*global global */
const { gulp, config } = global.akqa;
const path = require("path");
const rootFolder = path.resolve(config.folders.root, config.folders.sourceFolder);
const destMultiple = require("../helpers/destMultiple");
const buildFolderCollection = require("../helpers/buildFolderCollection");
const outputFolders = buildFolderCollection(".");


function resolveSourcePath(source) {
    if (source.indexOf("*") > -1) {
        return path.resolve(rootFolder, source);
    } else {
        return path.resolve(rootFolder, source, '**/*.*');
    }
}


gulp
    .task('copyAssets', () => {

        let source;

        if (config.tasks.copyAssets.sourceFolder instanceof Array) {
            source = [];
            config.tasks.copyAssets.sourceFolder.forEach(folder => source.push(resolveSourcePath(folder)));
        } else {
            source = resolveSourcePath(config.tasks.copyAssets.sourceFolder);
        }

        const pipe = gulp.src(source, { base: rootFolder })
            .pipe(destMultiple(outputFolders));

        // We can't use gulp-if here, since the instance might be undefined, which screws up everything.
        // This, however ugly, works fine.
        if (global.akqa.browsersyncInstance) {
            pipe.pipe(global.akqa.browsersyncInstance.stream());
        }

        return pipe;

    });
