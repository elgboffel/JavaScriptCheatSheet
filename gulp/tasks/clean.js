const { gulp, config } = global.akqa;
const buildFolderCollection = require("../helpers/buildFolderCollection");
const del = require("del");
const colors = require("ansi-colors");
const log = require("fancy-log");


function cleanUpInAisleFive() {

    const tasksToClean = config.tasks.clean.tasks;
    let lastResult;

    if (tasksToClean.length) {
        log(colors.yellow(colors.bold(new Array(70).join('*'))));

        tasksToClean.forEach(selectedTask => {

            if (config.tasks[selectedTask]) {
                let foldersToClean;
                if (config.tasks[selectedTask].cleanTargetFolders) {
                    foldersToClean = buildFolderCollection(config.tasks[selectedTask].cleanTargetFolders, { returnRelativePaths: true });
                }
                else if (config.tasks[selectedTask].targetFolder) {

                    if (config.tasks[selectedTask].sourceFolder instanceof Array) {
                        const tempArray = config.tasks[selectedTask].sourceFolder.map(sourceFolderName => `${config.tasks[selectedTask].targetFolder}/${sourceFolderName}/**`);
                        foldersToClean = buildFolderCollection(tempArray, { returnRelativePaths: true });
                    } else {
                        foldersToClean = buildFolderCollection(`${config.tasks[selectedTask].targetFolder}/**`, { returnRelativePaths: true });
                    }
                } else {
                    log(colors.red(colors.bold(`⚠ Task ${selectedTask} has no targetFolder or cleanTargetFolders property.`)));
                }

                if (foldersToClean) {
                    log(colors.yellow(colors.bold('⚠ Cleaning up for task ')) + colors.cyan(colors.bold(selectedTask)));
                    lastResult = del(foldersToClean, { force: true });
                }
            } else {
                log(colors.red(colors.bold(`⚠ Task ${selectedTask} doesn't exist in config.json!`)));
            }
        });

        log(colors.yellow(colors.bold(new Array(70).join('*'))));

        return lastResult;
    }

}


module.exports = cleanUpInAisleFive;
