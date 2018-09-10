/**
 * Get the **position of an element** on the screen.
 *
 * @module utils/dom/getElementPosition
 * @author Lars Munkholm <lars.munkholm@akqa.com>
 *
 * @example <caption>Basic usage:</caption>
 * import getElementPosition from './utils/getElementPosition';
 *
 * const element = document.querySelector('.anElement');
 * getElementPosition(element);
 *
 *
 * @example <caption>Perform a search for an element with an ID equal to the string, i.e. 'elementId', and get the position of that:</caption>
 * import getElementPosition from './utils/getElementPosition';
 *
 * getElementPosition('elementId');
 */


/**
 * Return the position of an element
 *
 * @param {HTMLElement|String} element - The HTML element to work with or its ID
 * @param {HTMLElement|String|Window} [relativeTo=window] - The HTML element to return the position relative to or its ID
 * @returns {{top: Number, left: Number}} An object with top and left positions in pixels
 */
export function getElementPosition(element, relativeTo = window) {

    const useElement = typeof element === "string" ? document.getElementById(element) : element;

    // Throw error if element wasn't found
    if (!useElement) {
        throw "getElementPosition did not find an element.";
    }


    const useRelativeTo = typeof relativeTo === "string" ? document.getElementById(relativeTo) : relativeTo;

    // Throw error if relative element wasn't found
    if (!useRelativeTo) {
        throw "getElementPosition did not find an element to show the position relative to.";
    }

    if (relativeTo === window) {
        // Return position relative to window
        const rect = useElement.getBoundingClientRect();
        return {
            top: rect.top + (window.pageYOffset || document.documentElement.scrollTop),
            left: rect.left + (window.pageXOffset || document.documentElement.scrollLeft)
        };
    } else {
        // Return position relative to declared element
        return {
            top: useElement.offsetTop - relativeTo.offsetTop,
            left: useElement.offsetLeft - relativeTo.offsetLeft
        };
    }
}

export default getElementPosition;
