
const taskLoader = require('../taskLoader');


const parse = part => {

    switch (typeof part) {
    case "string":
        taskLoader(part);
        return part;
    case "function":
        return part;
    case "object":
        if (Array.isArray(part)) {
            const flattenedArray = [];
            part.forEach(subPart => flattenedArray.push(parse(subPart)));
            return flattenedArray;
        }
        throw "Unknown object type!";
    default:
        throw "Unknown data type!";
    }


};


module.exports = (...neededParts) => {
    const processedFunctions = [];

    neededParts.forEach(part => processedFunctions.push(parse(part)));

    return processedFunctions;
};
