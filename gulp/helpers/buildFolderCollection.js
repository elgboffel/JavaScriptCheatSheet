const { config } = global.akqa;
const path = require("path");


function resolveFolder(baseDir, targetPath, relative) {
    const outputDir = path.resolve(config.folders.root, baseDir, targetPath);
    return relative ? path.relative('.', outputDir) : outputDir;
}


/**
 * Builds an array of all known destination folders, postfixed with a given folder name. Very useful for
 * outputting a single stream into several destinations.
 *
 * @param {String|String[]} pathName - The path to append to every known destination folder
 * @param {object} [additionalOptions] - Additional options for the path builder
 * @param {Boolean} [additionalOptions.returnRelativePaths=false] - Return returnRelativePath paths instead of absolute ones.
 * @param {String|String[]} [additionalOptions.collectionParentFolder] - Use a different collection parent than the output folder array
 * @param {String} [additionalOptions.pathPostFix=''] - All paths in the input will be postfixed with this. Useful for manipulating arrays of input folders automatically.
 * @returns {Array}
 */
module.exports = (pathName, additionalOptions = {}) => {

    const usedAdditionalOptions = typeof additionalOptions === "object" ? additionalOptions : {};

    const returnArray = [];
    const basePath = usedAdditionalOptions.collectionParentFolder || config.folders.targetFolder;

    function addPathname(curPathName) {
        if (basePath instanceof Array) {
            basePath.forEach(curPath => returnArray.push(resolveFolder(curPath, curPathName + (usedAdditionalOptions.pathPostFix || ""), usedAdditionalOptions.returnRelativePaths)));
        } else {
            returnArray.push(resolveFolder(basePath, curPathName + (usedAdditionalOptions.pathPostFix || ""), usedAdditionalOptions.returnRelativePaths));
        }
    }

    if (typeof pathName === "string") {
        addPathname(pathName);
    } else if (pathName instanceof Array) {
        pathName.forEach(path => addPathname(path));
    }


    return returnArray;
};
