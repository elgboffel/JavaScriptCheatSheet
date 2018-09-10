/**
 * A utility to detect if the given argument is an element or not.
 *
 * @module utils/dom/isElement
 * @author Anders Gissel <anders.gissel@akqa.com>
 */


/**
 * Find out whether or not the given argument is an element that would react somewhat normally to DOM-manipulations.
 *
 * @param {*} element
 * @returns {boolean} `true` if the given argument is an element (or document, or window), and `false` otherwise.
 */
export function isElement(element) {
    return element instanceof Element ||
        element instanceof Document ||
        element instanceof Window;
}

export default isElement;
