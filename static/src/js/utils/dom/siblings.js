/**
 * Utility to get **all the siblings** for the given DOM-element, or a subset thereof.
 *
 * @module utils/dom/siblings
 * @author Lars Munkholm <lars.munkholm@akqa.com>
 */



/**
 * Get all siblings of element, or a subset thereof.
 *
 * @param {Element} element - The target element.
 * @param {Boolean} [includeOriginalElement] - Set to true to include the original element among the siblings
 * @param {Element} [fromElement] - Return the siblings starting at this element
 * @param {Element} [untilElement] - Return the siblings stopping at this element
 * @returns {Element[]} Array of elements that are siblings to the given element.
 */
export function siblings(element, includeOriginalElement = false, fromElement = null, untilElement = null) {

    if (includeOriginalElement && !fromElement && !untilElement) {

        // Return array including the original element and all its siblings
        return Array.from(element.parentNode.children);

    } else {

        const siblings = [];

        // Set the element to start looking for siblings from
        let nextElement = fromElement || element.parentNode.firstElementChild;


        do {

            const currentElement = nextElement;
            const sameAsOriginalElement = element === currentElement;

            // Set next element to look at
            nextElement = nextElement.nextElementSibling;

            // Add this element to the list of sibling
            // unless it is the same as the original element (and this should be left out)
            if (!sameAsOriginalElement || includeOriginalElement) {
                siblings.push(currentElement);
            }

            // Stop looking for siblings, if the loop is set to stop at the current element
            if (currentElement === untilElement) {
                break;
            }

        } while (nextElement);


        // Return array of elements
        return siblings;

    }

}


/**
 * Get all the siblings **after** the given element.
 *
 * @param {Element} element - The target element.
 * @param {Boolean} [includeOriginalElement] - Set to true to include the original element among the siblings
 * @returns {Element[]} An array containing the elements following the given element (and possibly the element itself).
 */
export function nextSiblings(element, includeOriginalElement = false) {
    return siblings(element, includeOriginalElement, element);
}


/**
 * Get previous siblings of element
 *
 * @param {Element} element - The target element.
 * @param {Boolean} [includeOriginalElement] - Set to true to include the original element among the siblings
 * @returns {Element[]} An array containing the elements preceding the given element (and possibly the element itself).
 */
export function previousSiblings(element, includeOriginalElement = false) {
    return siblings(element, includeOriginalElement, null, element);
}


export default siblings;
