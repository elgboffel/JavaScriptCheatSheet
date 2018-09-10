/**
 * Get the current scroll values of the given element (or window). Will return an object containing
 * "left" and "top" properties, which are set to the scroll values, or false if no compatible element
 * was given.
 *
 * @module utils/dom/getElementScroll
 */

import isElement from "./isElement";



/**
 * Get the current scroll values of the given element (or window). Will return an object containing
 * "left" and "top" properties, which are set to the scroll values, or false if no compatible element
 * was given.
 *
 * @param {Element|Window} [element=window]
 * @returns {{ left: number, top: number } | boolean}
 */
export function getElementScroll(element = window) {

    if (isElement(element)) {
        if (element instanceof Window) {
            return {
                left: element.pageXOffset || document.documentElement.scrollLeft,
                top:  element.pageYOffset || document.documentElement.scrollTop
            };
        } else {
            return {
                left: element.scrollX || element.scrollLeft,
                top:  element.scrollY || element.scrollTop
            };
        }
    } else {
        return false;
    }
}


export default getElementScroll;
