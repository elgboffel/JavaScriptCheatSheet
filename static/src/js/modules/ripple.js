/*
* Add a ripple effect to any element on click
*
* Author: Jimmi Nielsen <jni@dis-play.dk>
* Modified by:
*
*
* To use:
in main.js

import setupRippleButton from './modules/ripple';

onReady(() => {
    setupRippleButton();
});

**/

import { addEvent, removeEvent } from '../utils/events/events';
import { detectTransitionEndEventName } from '../utils/events/detectEventName';

const transitionEvent = detectTransitionEndEventName();
let buttonEvent,
    buttons;

/**
 * @param {TouchEvent|MouseEvent} event - Add ripple effect from touch or click position
 */
function doTheRipple(event) {
    const button = event.target,
        rect = button.getBoundingClientRect();

    let x = 0,
        y = 0;

    if (event.changedTouches) {
        x = event.touches[0].clientX;
        y = event.touches[0].clientY;
    } else {
        x = event.clientX;
        y = event.clientY;
    }

    const dynamicCssProps = getDynamicRippleCssProps(x, y, rect);

    const rippleEffect = document.createElement("span");
    rippleEffect.classList.add("ripple-element");

    button.appendChild(rippleEffect);

    requestAnimationFrame(() => {
        Object.assign(rippleEffect.style, dynamicCssProps, {
            transform: "scale(1)",
            opacity: 0
        });
    });

    addEvent(rippleEffect, transitionEvent, () => {
        removeEvent(rippleEffect, transitionEvent);
        button.removeChild(rippleEffect);
    });
}

/**
 * Calculates the distance from the point (x, y) to the furthest corner of a rectangle and returns a set of
 * coordinates and dimensions for use in CSS.
 *
 * @param {number} x
 * @param {number} y
 * @param {DOMRect} rect
 * @returns {{width: string, height: string, top: string, left: string}} objectCoordinates
 */
function getDynamicRippleCssProps(x, y, rect) {
    const distX = Math.max(Math.abs(x - rect.left), Math.abs(x - rect.right));
    const distY = Math.max(Math.abs(y - rect.top), Math.abs(y - rect.bottom));

    const radius = Math.sqrt(distX * distX + distY * distY);
    const offsetX = x - rect.left;
    const offsetY = y - rect.top;

    return {
        width: `${radius * 2}px`,
        height: `${radius * 2}px`,
        top: `${offsetY - radius}px`,
        left: `${offsetX - radius}px`
    };
}

/**
 * @param {string} [elementString=".ripple-effect"] - setup event listeners for all elements with ripple class
 */
function setupRippleButton(elementString = ".ripple-effect") {
    buttonEvent = "touchstart click";

    buttons = document.querySelectorAll(elementString);

    addEvent(buttons, buttonEvent, doTheRipple.bind(this));
}

export default setupRippleButton;
