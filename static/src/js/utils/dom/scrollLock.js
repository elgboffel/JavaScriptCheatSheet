/**
 * A utility to **lock the viewport** at the current position in order to **stop scrolling**.
 *
 * This is very useful when opening modal windows and the likes.
 *
 * @module utils/dom/scrollLock
 * @author Lars Munkholm <lars.munkholm@akqa.com>
 * @author Anders Gissel <anders.gissel@akqa.com>
 *
 * @example <caption>Basic usage</caption>
 * import {enable as enableScrollLock, disable as disableScrollLock} from './utils/dom/scrollLock';
 *
 * enableScrollLock();
 * window.setTimeout(disableScrollLock, 3000);
 */

import triggerCustomEvent from '../events/triggerCustomEvent';
import getElementScroll from "./getElementScroll";
import {addClass, removeClass} from "./classList";


const className = "dis-scroll-lock";
let scrollTop = 0;


/**
 * Get the current state of the scroll lock. `true` if the scroll lock is enabled, otherwise `false`.
 *
 * @type {boolean}
 */
export let currentState = false;


/**
 * Enable the scroll lock.
 */
export function enable() {
    if (!currentState) {
        // Get scroll position
        const scrollPosition = getElementScroll();

        // Reset scroll position
        window.scrollTo(scrollPosition.left, 0);

        const htmlTag = document.documentElement;
        addClass(htmlTag, className);
        htmlTag.style.marginTop = `${-scrollPosition.top}px`;
        htmlTag.style.position = "fixed";
        htmlTag.style.overflow = "hidden";
        htmlTag.style.width = "100%";

        // Trigger event on target. You can listen for it using document.body.addEventListener("dis.scrolllock:enable", callbackHere)
        triggerCustomEvent(document.body, "dis.scrolllock:enable");

        // Remember state
        currentState = true;
        scrollTop = scrollPosition.top;
    }
}


/**
 * Disable the scroll lock
 */
export function disable() {
    if (currentState) {
        const scrollPosition = getElementScroll();

        const htmlTag = document.documentElement;
        removeClass(htmlTag, className);
        htmlTag.style.marginTop = "";
        htmlTag.style.position = "";
        htmlTag.style.overflow = "";
        htmlTag.style.width = "";

        // Set the scroll position to what it was before
        window.scrollTo(scrollPosition.left, scrollTop);

        // Trigger event on target. You can listen for it using document.body.addEventListener("dis.scrolllock:disable", callbackHere)
        triggerCustomEvent(document.body, "dis.scrolllock:disable");

        // Remember state
        currentState = false;
    }
}


/**
 * Toggle the scroll lock between on and off
 */
export function toggle() {
    if (currentState) {
        disable();
    } else {
        enable();
    }
}


/**
 * Default object containing all regular methods
 */
export default {
    enable,
    disable,
    toggle
};
