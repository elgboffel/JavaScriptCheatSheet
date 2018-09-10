/**
 * Accessibility helper functions
 * @module utils/dom/accessibility
 * @author Casper Andersen <casper.andersen@akqa.com>
 *
 * @example <caption>Set tag tabindex on all tab'able (a, button, form element, etc.) elements in the container</caption>
 * import { tabbingEnable } from './utils/dom/accessibility';
 * tabbingEnable(container);
 *
 *
 * @example <caption>Remove tag tabindex on all tab'able elements in the container</caption>
 * import { tabbingDisable } from './utils/dom/accessibility';
 * tabbingDisable(container);
 *
 *
 * @example <caption>Set aria-value on element</caption>
 * import { setAria } from './utils/accessibility';
 * setAria(element, ariatag, value);
 *
 *
 * @example <caption>Set ariatag value to true on element</caption>
 * import { ariaEnable } from './utils/accessibility';
 * ariaEnable(element, ariatag);
 *
 *
 * @example <caption>Set ariatag value to false on element</caption>
 * import { ariaDisable } from './utils/accessibility';
 * ariaDisable(element, ariatag);
 *
 * */

import { selectTabDomElements } from './tabDomElements';
import forEach from "../forEach";

/**
  * Enable tabbing on tabbable dom elements
  * @param {HTMLElement} container
  */
export function tabbingEnable(container) {

    const tabElements = selectTabDomElements(container);

    forEach(tabElements, item => item.removeAttribute('tabindex'));
}

/**
 * Disable tabbing on tabbable dom elements
 * @param {HTMLElement} container
 */
export function tabbingDisable(container) {

    const tabElements = selectTabDomElements(container);

    forEach(tabElements, item => item.setAttribute('tabindex', '-1'));
}

/**
 * Set aria tag
 * @param {HTMLElement} element
 * @param {String} aria
 * @param {String} value
 */
export function setAria(element, aria, value) {
    element.setAttribute(`aria-${aria}`, value);
}

/**
 * Enable aria tag - Value true
 * @param {HTMLElement} element
 * @param {String} aria
 */
export function ariaEnable(element, aria) {
    setAria(element, aria, true);
}

/**
 * Disable aria tag - Value false
 * @param {HTMLElement} element
 * @param {String} aria
 */
export function ariaDisable(element, aria) {
    setAria(element, aria, false);
}
