/* eslint no-console: 0 */
/*global global, process */
const yargs = require("yargs").argv;
const colors = require("ansi-colors");
const log = require("fancy-log");


const setCastlab = done => {
    global.akqa.castlab = true;

    if (!yargs.location) {
        console.log(``);
        console.log(``);
        log(`**********************************************************************************************************************`);
        log(`***`);
        log(`*** You are using "npm run castlab"`);
        log(`*** THIS IS DEPRECATED!`);
        log(`***`);
        log(`*** Please use ${colors.green(colors.bold('npm run castlab:aar'))} to test on devices located at ${colors.green(colors.bold('Aarhus office'))}`);
        log(`*** Or ${colors.green(colors.bold('npm run castlab:cph'))} to test on devices located at ${colors.green(colors.bold('Copenhagen office'))}`);
        log(`***`);
        log(`**********************************************************************************************************************`);

        process.exit();
    } else {
        global.akqa.castlabLocation = yargs.location;
    }

    done();
};


module.exports = setCastlab;
