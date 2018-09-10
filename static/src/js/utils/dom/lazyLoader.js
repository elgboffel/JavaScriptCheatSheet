/**
 * @module utils/dom/lazyLoader
 */

import {breakpointIndex, currentBreakpoint, onWindowResize} from '../events/onWindowResize';
import elementInViewport from './elementInViewport';
import {addClass, removeClass, hasClass} from "./classList";
import {onScroll, removeScrollCallback} from '../events/onScroll';
import imageLoader from "./imageLoader";
import forEach from '../forEach';

const lazyImagesNotLoaded = [];
const lazyImagesLoaded = [];
const lazyBgClassname = "lazy-bg";
const loadingClassname = "lazy-loading";
const loadedClassname = "lazy-loaded";
let lastUsedScreenWidth;
let lazyBufferMargin;

/**
 * This function gets the data-src from the image wrapper, based on width of the browser window.
 *
 * @private
 * @param {HTMLElement} image - Image wrapper element
 * @returns {string}
 */
function getImageSrc(image) {

    let src = "";
    let largestBreakpointFound = 0;

    forEach(breakpointIndex, (sizeIndication, breakpointName) => {
        if (currentBreakpoint >= sizeIndication && sizeIndication > largestBreakpointFound) {
            src = image.getAttribute(`data-src-${breakpointName}`) || src;

            // Make sure we won't set the size to a smaller breakpoint later, in case they're not properly ordered.
            largestBreakpointFound = sizeIndication;
        }
    });

    if (!src) {
        forEach(breakpointIndex, (sizeIndication, breakpointName) => {
            if (!src && sizeIndication > largestBreakpointFound) {
                src = image.getAttribute(`data-src-${breakpointName}`);

                // Make sure we won't set the size to a smaller breakpoint later, in case they're not properly ordered.
                largestBreakpointFound = sizeIndication;
            }
        });
    }

    return src;
}

/**
 * This function gets the image wrapper data attributes src and alt text,
 * creates a new image and appends it to image wrapper.
 *
 * @private
 * @param {HTMLElement} imageContainer - Image wrapper element
 */
function loadImage(imageContainer) {
    let src = getImageSrc(imageContainer);
    let oldImage = imageContainer.querySelector("img");
    const altText = imageContainer.getAttribute("data-alt") || "";

    // If no usable source was returned, abort at once.
    if (!src) {
        return;
    }
    // We don't want to start processing if the new URL matches the old one.
    if (oldImage) {
        if (oldImage.getAttribute("src") === src) {
            return;
        }
    }

    // Add loading-class
    addClass(imageContainer, loadingClassname);

    // Determine when the image has actually been loaded (and decoded if possible).
    imageLoader(src).then(newImageTag => {
        // Set the ALT text.
        newImageTag.setAttribute("alt", altText);

        oldImage = imageContainer.querySelector("img");
        if (oldImage) {
            src = getImageSrc(imageContainer);
            if (oldImage.getAttribute("src") === src) {
                return;
            }
            oldImage.parentNode.removeChild(oldImage);
        }
        removeClass(imageContainer, loadingClassname);
        addClass(imageContainer, loadedClassname);
        imageContainer.appendChild(newImageTag);
    });
}

/**
 * This function gets the image wrapper data attributes src and alt text
 * and creates an new image tag to download the image.
 * It then uses the src as a background-image.
 *
 * @private
 * @param {HTMLElement} imageContainer - Image wrapper element
 */
function loadBgImage(imageContainer) {
    const src = getImageSrc(imageContainer);
    const formattedSrc = `url(${src})`;

    // If no usable source was returned, abort at once.
    if (!src || imageContainer.style.backgroundImage === formattedSrc) {
        return;
    }

    addClass(imageContainer, loadingClassname);

    // Add event listener to determine when the image has actually been loaded.
    imageLoader(src).then(() => {
        imageContainer.style.backgroundImage = formattedSrc;
        addClass(imageContainer, loadedClassname);
        removeClass(imageContainer, loadingClassname);
    });
}





/**
 * This function loops through the array lazyImagesNotLoaded,
 * checking its elements against the elementInViewport function.
 * If elementInViewport returns true it calls either loadImage or loadBgImage
 * depending on whether it has the class "lazy-bg"
 *
 * @private
 */

function detectViewableImages() {
    const total = lazyImagesNotLoaded.length;
    const loadedImages = [];
    if (total) {
        let i;
        for (i = 0; i < total; i += 1) {
            const image = lazyImagesNotLoaded[i];
            if (elementInViewport(image, lazyBufferMargin)) {
                loadedImages.push(i);
                if (hasClass(image, lazyBgClassname)) {
                    loadBgImage(image);
                } else {
                    loadImage(image);
                }
            }
        }
        // Remove images loaded from lazyImagesNotLoaded
        // and add them to lazyImagesLoaded array
        for (i = loadedImages.length - 1; i >= 0; i -= 1) {
            const image = lazyImagesNotLoaded.splice(loadedImages[i], 1);
            lazyImagesLoaded.push(image[0]);
        }
    } else {
        removeScrollCallback(window, detectViewableImages);
    }
}



/**
 * Refresh src of lazy images loaded on page.
 *
 * @private
 */
function refreshLoadedImages() {
    // If our current screen mode does not match the one we used the last time we made an image lookup,
    // perform a new one now. Otherwise, what would be the point?
    if (lastUsedScreenWidth !== currentBreakpoint) {
        forEach(lazyImagesLoaded, element => {
            if (hasClass(element, lazyBgClassname)) {
                loadBgImage(element);
            } else {
                loadImage(element);
            }
        });
        lastUsedScreenWidth = currentBreakpoint;
    }
    detectViewableImages();
}

/**
 * Detect all responsive images on the page and setup event listeners.
 *
 * @param lazyImages {string|NodeList} - Selector for imageContainer
 * @param bufferMargin {Number} - Number of pixel after viewport to load images
 */
export function setupLazyImages(lazyImages, bufferMargin) {
    let imageContainers;

    if (typeof lazyImages === "string") {
        imageContainers = document.querySelectorAll(lazyImages);
    } else if (typeof lazyImages === "object" && lazyImages.length) {
        imageContainers = lazyImages;
    } else {
        throw "lazyLoader imageContainers not given as string or nodeList";
    }

    lazyBufferMargin = bufferMargin;
    // Save the NodeList of imageContainers into an Array (since we need that in detectViewableImages!
    const totalImages = imageContainers.length;
    for (let i = 0; i < totalImages; i += 1) {
        lazyImagesNotLoaded.push(imageContainers[i]);
    }

    detectViewableImages();
    onScroll(window, detectViewableImages, 250);
    onWindowResize(refreshLoadedImages);
}

export default setupLazyImages;
