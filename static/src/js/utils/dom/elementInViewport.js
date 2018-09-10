/**
 * Check if the given element is inside the client viewport or not.
 *
 * @module utils/dom/elementInViewport
 * @author Nicolaj Lund Nielsen <nicolaj.hummel@akqa.com>
 * @author Lars Munkholm <lars.munkholm@akqa.com>
 *
 * @example <caption>Basic usage:</caption>
 * import elementInViewport from './utils/elementInViewport';
 *
 * if (elementInViewport(element)) {
 *     // ...
 * };
 *
 */

import { currentWindowHeight } from '../events/onWindowResize';


/**
 * Check if a given element is within the client viewport
 *
 * @param {HTMLElement} element - Element to check against viewport bounds
 * @param {number} expandMargin - Number of pixels to expand viewport-detection-area with
 * @returns {boolean} True if element is in viewport
 */
export function elementInViewport(element, expandMargin = 0) {
    const rect = element.getBoundingClientRect();
    const span = rect.top + rect.height + expandMargin;

    return (span >= Math.min(0, expandMargin) && rect.top <= currentWindowHeight + expandMargin);
}


export default elementInViewport;
