/*global __dirname */
const { gulp, config } = global.akqa;
const shell = require("gulp-shell");
const path = require("path");
const pathExists = require("path-exists");

// This function splits a string and gets the last part of the array
function getLastAfterSplit(text, separator) {
    const parts = text.split(separator);
    return parts[parts.length - 1];
}


/**
 * MSBUILD task
 *
 * MSbuild builds and publishes the solution at once
 */
function runMsBuild() {
    pathExists(config.tasks.msbuild.solutionSettings).then(() => {
        const settings = require(config.tasks.msbuild.solutionSettings);

        if (settings) {
            const customBuildFile = path.resolve(__dirname, `..\\..\\..\\..\\..\\${settings.customBuildFile}`);
            const solutionFile = getLastAfterSplit(settings.solutionFilePath, "\\");
            const defaultTarget = config.tasks.msbuild.defaultTarget;
            const variables = [];

            // We define the properties we need to send to msbuild
            const properties = {
                Configuration: settings.defaultBuildConfiguration,
                PresentationFolder: path.resolve(__dirname, "..\\..\\..\\"),
                SolutionFile: solutionFile,
                ProjectFile: `${settings.presentationFolderName}.csproj`,
                GulpLocation: path.resolve(__dirname, "..\\")
            };

            // We format the properties object to msbuild properties as a string
            for (const prop in properties) {
                variables.push(`${prop}=${properties[prop]}`);
            }

            const implodedVariables = variables.join(",");

            // We call the msbuild command via gulp-shell
            return gulp.src("gulpfile.js", { read: false }).pipe(shell([
                `"${config.tasks.msbuild.msbuildPath}" ${customBuildFile} /verbosity:${config.tasks.msbuild.verbosity} /p:${implodedVariables} /t:${defaultTarget}`
            ]));
        }
    });

}

/**
 * PublishWebsite task
 *
 * Publishes files to webroot from the Source folder in the solution
 */
const publishWebsite = () => {
    const webRoot = config.tasks.msbuild.webroot;
    const packageFolder = config.tasks.msbuild.packageFolder;

    // Define the paths to the publish config files
    const configFilesToPublish = [
        `${packageFolder}/App_Config/**/*.config`,
        `${packageFolder}/web.config`
    ];

    // Define the destination of the published files
    gulp.src(configFilesToPublish, { base: packageFolder })
        .pipe(gulp.dest(webRoot));

    // Define which files to publish
    const filesToPublish = config.tasks.msbuild.filesToPublish;

    return gulp.src(filesToPublish, { base: `../` })
        .pipe(gulp.dest(webRoot));
};


module.exports = {
    "msbuild": runMsBuild,
    "publishwebsite": publishWebsite
};
