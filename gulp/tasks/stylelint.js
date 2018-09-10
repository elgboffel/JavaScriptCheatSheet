const { gulp, config } = global.akqa,
    path = require("path"),
    buildFolderCollection = require('../helpers/buildFolderCollection'),
    lintMessages = require('../helpers/lintMessages');


function stylelintFormatter(lintDataArray) {
    const allMessages = {};
    let fileCount = 0;

    if (lintDataArray.length) {
        lintDataArray.forEach(jsonData => {
            fileCount += 1;

            if (!jsonData.ignored) {
                const messages = [];

                jsonData.warnings.forEach(message => {
                    messages.push({
                        type: message.severity === "error" ? "error" : "warning",
                        message: message.text,
                        rule: message.rule,
                        line: message.line,
                        column: message.column
                    });
                });

                if (messages.length > 0) {
                    allMessages[jsonData.source] = messages;
                }
            }
        });
    }

    // Called once for all Stylelint results.
    lintMessages("Stylelint", allMessages, fileCount);
}


function stylelint() {
    const stylelint = require("gulp-stylelint");

    const source = [
        // We should, of course, lint whatever we can find in the SCSS-folder.
        path.resolve(config.folders.root, config.folders.sourceFolder, config.tasks.scss.sourceFolder, "**/*.{,s}css"),

        // ... but there may be CSS in the javascript folders as well, and we should keep an eye on that as well.
        path.resolve(config.folders.root, config.folders.sourceFolder, config.tasks.javascript.sourceFolder, "**/*.{,s}css")
    ];

    if (config.tasks.scss.excludeFromLint) {
        buildFolderCollection(config.tasks.scss.excludeFromLint, { collectionParentFolder: `${config.folders.sourceFolder}/${config.tasks.scss.sourceFolder}` })
            .forEach(pattern => source.push(`!${pattern}`));

        buildFolderCollection(config.tasks.scss.excludeFromLint, { collectionParentFolder: `${config.folders.sourceFolder}/${config.tasks.javascript.sourceFolder}` })
            .forEach(pattern => source.push(`!${pattern}`));
    }


    return gulp.src(source)
        .pipe(stylelint({
            configBasedir: path.resolve(config.folders.root),
            failAfterError: false,
            reporters: [
                {formatter: stylelintFormatter}
            ]
        }))
    ;
}

module.exports = stylelint;
