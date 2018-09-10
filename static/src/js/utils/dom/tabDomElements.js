/**
 * Tabable element handling
 *
 * Get prev and next from document.activeElement in dom.
 * Get first, last and byIndex tabable element in dom.
 *
 * Date of creation: 18/10-2017
 * @module utils/dom/TabDomElements
 * @author Casper Andersen <casper.andersen@akqa.com>
 *
 * @example
 * import TabDomElements from './utils/dom/tabDomElements';
 *
 * let tabDomElements = new TabDomElements(container); // Default use document
 *
 * // Get prev element from activeElement
 * tabDomElements.getPrevTabElement();
 *
 * // Get next element from activeElement
 * tabDomElements.getNextTabElement();
 *
 * // Get element by index of all tabable elements
 * tabDomElements.getTabElementByIndex();
 *
 * // Get first element of all tabable elements
 * tabDomElements.getFirstTabElement();
 *
 * // Get last element of all tabable elements
 * tabDomElements.getLastTabElement();
 */


import onReady from '../events/onReady';


// Tabable dom elements querystring
const tabableDOMquery = 'a:not([disabled]), button:not([disabled]), input[type=text]:not([disabled]), [tabindex]:not([disabled]):not([tabindex="-1"])';

// Select Tab dom elements
export function selectTabDomElements(container = document) {
    return Array.prototype.filter.call(container.querySelectorAll(tabableDOMquery), element =>
        //check for visibility while always include the current activeElement
        element.offsetWidth > 0 || element.offsetHeight > 0 || element === document.activeElement
    );
}

/**
 * Helper class for selecting tabbing elements
 *
 */
class TabDomElements {

    /**
     * The constructor is fired once the class is instantiated.
     *
     * @param {HTMLElement} container
     */
    constructor(container) {
        // Run initializing code once the DOM is ready.
        onReady(() => this.init(container));
    }

    /**
     * Find previous Tab element
     * @returns {HTMLElement}
     */
    getPrevTabElement() {

        if (document.activeElement) {

            const index = this.TabDomElements.indexOf(document.activeElement);
            if (index > -1) {
                return this.TabDomElements[index - 1] || undefined;
            }
        }
        return undefined;
    }

    /**
     * Find next Tab element
     * @returns {HTMLElement}
     */
    getNextTabElement() {

        if (document.activeElement) {

            const index = this.TabDomElements.indexOf(document.activeElement);
            if (index > -1) {
                return this.TabDomElements[index + 1] || undefined;
            }
        }
        return undefined;
    }

    /**
     * Return Tab dom element by index
     * @param {int} index
     * @returns {HTMLElement}
     */
    getTabElementByIndex(index = null) {
        if (index !== null) {
            return this.TabDomElements[index];
        }
        return undefined;
    }

    /**
     * Return first tab element
     * @returns {HTMLElement}
     */
    getFirstTabElement() {
        return this.TabDomElements[0];
    }

    /**
     * Return last tab element
     * @returns {HTMLElement}
     */
    getLastTabElement() {
        return this.TabDomElements[this.TabDomElements.length - 1];
    }

    /**
     * The actual initialization function, fired once the DOM is ready.
     *
     * @param {HTMLElement} container
     */
    init(container) {

        // Tab dom elements
        this.TabDomElements = selectTabDomElements(container);

    }
}

export default TabDomElements;
