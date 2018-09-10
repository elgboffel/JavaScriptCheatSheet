/**
 * @module utils/dom/imageLoader
 * @author Lars Munkholm <lars.munkholm@akqa.com>
 */

import {addEventOnce} from "../events/events";


/**
 * Try to decode the image, after it's loaded, and resolve the Promise.
 *
 * @private
 * @param {Element} newImage
 * @returns {Promise<Image>}
 */
function decodeImage(newImage) {
    return ("decode" in newImage) ?
        newImage.decode().then(() => newImage) :
        Promise.resolve(newImage);
}


/**
 * Load an image, and return a Promise that resolves once the image is loaded.
 *
 * @param {string} path
 * @returns {Promise<Image>} Promise that will resolve with the loaded image once it's ready.
 */
export function loadImage(path) {
    const newImage = new Image();

    return new Promise(resolve => {
        addEventOnce(newImage, "load", () => decodeImage(newImage).then(image => resolve(image)));
        newImage.src = path;
    });
}


export default loadImage;
