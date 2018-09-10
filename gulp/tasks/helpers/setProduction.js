const colors = require("ansi-colors");
const log = require("fancy-log");


const setProduction = done => {
    global.akqa.production = true;

    const warningMessage = '*** Compiling in production mode - no source maps, full minification! ***',
        separator = new Array(warningMessage.length + 1).join('*');

    log(colors.yellow(colors.bold(separator)));
    log(colors.yellow(colors.bold(warningMessage)));
    log(colors.yellow(colors.bold(separator)));

    done();
};


module.exports = setProduction;
