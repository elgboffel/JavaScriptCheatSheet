const { gulp, config } = global.akqa;
const path = require("path");
const colors = require("ansi-colors");
const log = require("fancy-log");


const rootFolder = path.resolve(config.folders.root, config.folders.sourceFolder);

const setProduction = require('./helpers/setProduction');
const browserSync = require('./helpers/browsersync');


function watch() {

    const knowntasks = Object.keys(config.tasks);

    knowntasks.forEach(currentTaskID => {
        const currentTask = config.tasks[currentTaskID];
        if (currentTask.watch && currentTask.watchFor && (currentTask.sourceFolder || currentTask.watchFolders)) {

            let watchTarget;
            const watchFolders = currentTask.watchFolders || currentTask.sourceFolder;

            if (watchFolders instanceof Array) {
                watchTarget = watchFolders.map(sourceFolderName =>
                    // Using relative paths to ensure Gulp keeps an eye on newly added files as well as the ones it already knows.
                    path.relative(config.folders.root, path.resolve(rootFolder, sourceFolderName, '**/', currentTask.watchFor))
                );
            } else {
                // Using relative paths to ensure Gulp keeps an eye on newly added files as well as the ones it already knows.
                watchTarget = path.relative(config.folders.root, path.resolve(rootFolder, watchFolders, '**/', currentTask.watchFor));
            }

            const watchedFolders = typeof watchTarget === "string" ? 1 : watchTarget.length;
            const watchedFolderString = `(${watchedFolders} folder${watchedFolders === 1 ? '' : 's'})`;
            log(`${colors.green('- Adding watcher for task')} ${colors.cyan(currentTaskID)} ${colors.gray(watchedFolderString)}`);

            gulp.watch(
                watchTarget,
                {
                    cwd: path.resolve(config.folders.root)
                },
                gulp.parallel(currentTask.watchRun || [currentTaskID])
            )
                .on('change', file => log(`${colors.green(colors.bold('✓'))} ${colors.cyan(colors.bold(file))} was ${colors.yellow(colors.bold('changed'))}`))
                .on('add', file => log(`${colors.green(colors.bold('✓'))} ${colors.cyan(colors.bold(file))} was ${colors.green(colors.bold('added'))}`))
                .on('unlink', file => log(`${colors.green(colors.bold('✓'))} ${colors.cyan(colors.bold(file))} was ${colors.red(colors.bold('removed'))}`))
            ;
        }
    });

    log(`${colors.green(colors.bold('✓ Watchers are running!'))}`);
}


const watchAction = gulp.series(browserSync, watch);


module.exports = {
    "watch": watchAction,
    'watch:production': gulp.series(setProduction, watchAction)
};

