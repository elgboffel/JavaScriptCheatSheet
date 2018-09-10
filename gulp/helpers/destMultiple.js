/*global process */
const path = require("path");
const through2 = require("through2");
const defaults = require("defaults");
const mkdirp = require("mkdirp");
const vinylFileOperations = require("vinyl-fs/lib/file-operations");


/**
 * Write the stream content to one or more destination folders.
 * Almost all code in this function was stolen directly from vinyl-fs v0.3.14,
 * specifically /lib/dest/index.js. All I've done is add the option to handle
 * arrays as well.
 *
 * @param {String|function|Array} pathNames
 * @param {object} [optionObject]
 * @returns {*}
 */
function destMultiple(pathNames, optionObject) {

    if (typeof pathNames !== 'string' && typeof pathNames !== 'function' && !(pathNames instanceof Array)) {
        throw new Error('Invalid output folder');
    }

    const options = defaults(optionObject || {}, {
        cwd: process.cwd()
    });

    if (typeof options.mode === 'string') {
        options.mode = parseInt(options.mode, 8);
    }

    const cwd = path.resolve(options.cwd);

    function saveFile (file, enc, cb) {

        /**
         *
         * @param {String} basePath
         * @param {Boolean} [isLast=false]
         */
        function performWrite(basePath, isLast) {

            const writePath = path.resolve(basePath, file.relative);
            const writeFolder = path.dirname(writePath);

            // Create the folder the file is going in
            mkdirp(writeFolder, err => {
                if (err) {
                    return cb(err);
                }
                vinylFileOperations.writeFile(writePath, file.contents, {}, isLast ? cb : () => {});
            });

        }


        let resolvedPathArray;
        let tempPath;


        if (typeof pathNames === 'string') {
            resolvedPathArray = [path.resolve(cwd, pathNames)];
        }
        if (typeof pathNames === 'function') {
            tempPath = path.resolve(cwd, pathNames(file));
            resolvedPathArray = tempPath instanceof Array ? tempPath : [tempPath];
        }
        if (pathNames instanceof Array) {
            resolvedPathArray = pathNames;
        }

        resolvedPathArray.forEach((path, i) => performWrite(resolvedPathArray[i], i + 1 === resolvedPathArray.length));

    }

    const stream = through2.obj(saveFile);
    stream.resume();
    return stream;

}


module.exports = destMultiple;
