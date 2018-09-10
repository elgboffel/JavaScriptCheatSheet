/**
 * @module utils/dom/getElementSize
 * @author Lars Munkholm <lars.munkholm@akqa.com>
 */


/**
 * Get both width and height of element
 *
 * @param {Element} element - The HTML element to work with
 * @param {Object} [options={}] - Object of options
 * @param {boolean} [options.includePadding=false] - Get size including padding (defaults to true)
 * @param {boolean} [options.includeBorder=false] - Get size including border (defaults to true)
 * @param {boolean} [options.includeMargin=true] - Get size including margin (defaults to false)
 * @param {null|':before'|':after'} [options.pseudoElement=null] - Get size of pseudo element ':before' or ':after'
 * @returns {{width: number, height: number}} An object with the width and height as numbers
 */
export function getElementSize(element, options = {}) {

    // Get styles
    const elementStyle = window.getComputedStyle(element, options.pseudoElement);

    return {
        width: getElementWidth(element, options, elementStyle),
        height: getElementHeight(element, options, elementStyle)
    };

}



/**
 * Get width of element
 *
 * @param {Element} element - The HTML element to work with
 * @param {Object} [options={}] - Object of options
 * @param {boolean} [options.includeMargin=false] - Get width including margin (defaults to false)
 * @param {boolean} [options.includeBorder=true] - Get width including border (defaults to true)
 * @param {boolean} [options.includePadding=true] - Get width including padding (defaults to true)
 * @param {null|':before'|':after'} [options.pseudoElement=null] - Get width of pseudo element ':before' or ':after'
 * @param {CSSStyleDeclaration} [elementStyle] - Style declaration of element (in case you already have called .getComputedStyle(), pass its returned value here)
 * @returns {number} The width as a number
 */
export function getElementWidth(element, options = {}, elementStyle = null) {

    // Keep supplied values or set to defaults
    options.includeMargin = options.includeMargin === true;
    options.includeBorder = options.includeBorder !== false;
    options.includePadding = options.includePadding !== false;

    // Get styles
    const style = elementStyle || window.getComputedStyle(element, options.pseudoElement);

    // Get width including border and padding
    let width = element.offsetWidth;

    // Calculate width with margin
    if (options.includeMargin) {
        width += parseFloat(style.marginLeft) + parseFloat(style.marginRight);
    }

    // Calculate width without border
    if (!options.includeBorder) {
        width -= parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
    }

    // Calculate width without padding
    if (!options.includePadding) {
        width -= parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    }

    return width;

}


/**
 * Get height of element
 *
 * @param {Element} element - The HTML element to work with
 * @param {Object} [options={}] - Object of options
 * @param {boolean} [options.includeMargin=false] - Get height including margin (defaults to false)
 * @param {boolean} [options.includeBorder=true] - Get height including border (defaults to true)
 * @param {boolean} [options.includePadding=true] - Get height including padding (defaults to true)
 * @param {null|':before'|':after'} [options.pseudoElement=null] - Get height of pseudo element ':before' or ':after'
 * @param {CSSStyleDeclaration} [elementStyle] - Style declaration of element (in case you already have called .getComputedStyle(), pass its returned value here)
 * @returns {number} The height as a number
 */
export function getElementHeight(element, options = {}, elementStyle = null) {

    // Keep supplied values or set to defaults
    options.includeMargin = options.includeMargin === true;
    options.includeBorder = options.includeBorder !== false;
    options.includePadding = options.includePadding !== false;

    // Get styles
    const style = elementStyle || window.getComputedStyle(element, options.pseudoElement);

    // Get height including border and padding
    let height = element.offsetHeight;

    // Calculate height with margin
    if (options.includeMargin) {
        height += parseFloat(style.marginTop) + parseFloat(style.marginBottom);
    }

    // Calculate height without border
    if (!options.includeBorder) {
        height -= parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    }

    // Calculate height without padding
    if (!options.includePadding) {
        height -= parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    }

    return height;

}


export default getElementSize;
