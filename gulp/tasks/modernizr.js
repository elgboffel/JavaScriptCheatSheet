const { config } = global.akqa;
const modernizrConfig = require(`${process.env.INIT_CWD}/setup/modernizr`);
const destMultiple = require("../helpers/destMultiple");
const buildFolderCollection = require("../helpers/buildFolderCollection");
const outputFolders = buildFolderCollection(config.tasks.modernizr.targetFolder);
const colors = require("ansi-colors");
const log = require("fancy-log");


module.exports = doneCallback => {

    const modernizr = require("modernizr");

    const gulpFile = require("gulp-file");

    if (modernizrConfig.iHaventCustomizedMyModernizr) {
        log(colors.bold(`************************************************************************************`));
        log(colors.yellow(colors.bold(`⚠ You haven't customized your Modernizr, which means it'll contain no detections.`)));
        log(`   Please edit ${colors.yellow(colors.bold('setup/modernizr.json'))} to your liking.`);
        log(` `);
        log(`   You can find options on Modernizr.com; select needed options, then build and`);
        log(`   copy 'Command line config' into the config file.`);
        log(` `);
        log(`   To disable this warning, unset ${colors.yellow(colors.bold('iHaventCustomizedMyModernizr'))} in the config file.`);
        log(colors.bold(`************************************************************************************`));
    }

    modernizr.build(modernizrConfig, data => {
        gulpFile(config.tasks.modernizr.filename, data).pipe(destMultiple(outputFolders));
        doneCallback();
    });

};
