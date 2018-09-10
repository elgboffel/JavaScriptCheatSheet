/* eslint no-console: 0 */
const { gulp, config } = global.akqa;
const path = require("path");
const buildFolderCollection = require("../helpers/buildFolderCollection");
const lintMessages = require('../helpers/lintMessages');


function eslint() {
    const eslint = require("gulp-eslint");
    let source = [
        path.resolve(config.folders.root, config.folders.sourceFolder, config.tasks.javascript.sourceFolder, "**/*.js"),
        path.resolve(config.folders.root, config.folders.sourceFolder, config.tasks.serviceworkers.sourceFolder, "**/*.js")
    ];

    if (config.tasks.javascript.excludeFromLint) {
        const antiPatterns = buildFolderCollection(config.tasks.javascript.excludeFromLint, { collectionParentFolder: `${config.folders.sourceFolder}/${config.tasks.javascript.sourceFolder}` });
        antiPatterns.forEach(pattern => source.push(`!${pattern}`));
    }


    const allMessages = {};

    return gulp.src(source)
        .pipe(eslint())
        .pipe(eslint.formatEach('json', jsonData => {
            const parsedFileData = JSON.parse(jsonData)[0];
            const messages = [];

            parsedFileData.messages.forEach(message =>
                messages.push({
                    type: message.severity === 1 ? "warning" : "error",
                    message: message.message,
                    rule: message.ruleId,
                    line: message.line,
                    column: message.column,
                    source: message.source
                })
            );

            if (messages.length > 0) {
                allMessages[parsedFileData.filePath] = messages;
            }
        }))
        .pipe(eslint.results(results => {
            // Called once for all ESLint results.
            lintMessages("ESLint", allMessages, results.length);
        }))
    ;
}

module.exports = eslint;
