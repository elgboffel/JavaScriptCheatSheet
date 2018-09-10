/*
 Modal dialog class

 Author: Anders Gissel <agi@dis-play.dk>
 Modified by:
 ************************************************************************************************************

 To use:

    import Modal from './modules/modal';

    const newModal = new Modal();
    newModal
        .setContent("<p>Demo-data</p>")
        .setTitle("Demo-title");

    // or:
    // const newModal = new Modal({ content: "<p>Demo-data</p>", title: "Demo-title" });

     window.setTimeout(() => newModal.destroy(), 5000);


 There are a lot of possible options, so please check out the JSDoc for the main class. However, if all
 you need is a simple alert or confirm, there are even easier ways of going about it:


    import { alert as alertModal, confirm as confirmModal } from './modules/modal';

    confirmModal("Please confirm this message!", "Please confirm", "Yes", "No")
        .then(
            () => alertModal("You clicked yes!", "Wohoo!", "OK"),
            () => alertModal("You clicked no!", "What?!", "Oh, man, sorry")
        );



 Both "helpers" return promises for easier chaining upon user interaction.

*/

import scrollLock, { currentState as currentScrollLockState } from '../utils/dom/scrollLock';
import { addEvent, removeAllEvents, addEventOnce } from '../utils/events/events';
import { add as addClass, remove as removeClass } from '../utils/dom/classList';
import createElement from '../utils/dom/createElement';
import { detectTransitionEndEventName } from "../utils/events/detectEventName";


/**
 * An indication of how many modals are currently open. Primarily used internally, but you can read it if you wish.
 * @type {number}
 */
export let modalCount = 0;



const activeClassModifier = "visible";


/**
 * The event name to listen for when waiting for transitions to finish. If you clear this, it's tantamount to setting
 * "useTransitions" to false in all instantiations. Otherwise, a utility will be used to detect the event name in the
 * current browser.
 *
 * @type {string}
 */
const transitionEndEventName = detectTransitionEndEventName();


/**
 * An object containing the various element names that will be used while building the DOM for a modal.
 * * Block-level name is set using configuration for each modal (see "blockClass")
 * * Basic modifiers are set using configuration for each modal (see "modifierClass"); specific per-element modifier are hardcoded.
 *
 * So, basically (f*cking), if you want to change the class name of any auto-generated element, this is where you do it.
 *
 * @type {object}
 */
const classNames = {
    background: 'background',
    wrapper: 'wrapper',
    innerWrapper: 'inner-wrapper',
    header: 'header',

    titleWrapper: 'title-wrapper',
    title: 'title',

    content: 'content',

    closeButton: 'close',
    closeIcon: 'close-icon',
    closeLabel: 'close-label',
};



export default class Modal {

    /**
     * Let's very modal!
     *
     * @param {object} [options]
     * @param {HTMLElement|Node|string} [options.content] The content of the modal. Can also be set using setContent() on the instantiation.
     * @param {HTMLElement|Node|string} [options.title] The title of the modal. Can also be set using setTitle() on the instantiation.
     * @param {string} [options.blockClass='modal'] This is the block-identifier class (the "B" in "BEM")
     * @param {string} [options.modifierClass=''] All created DOM nodes will receive this modifier class (the "M" in "BEM")
     * @param {boolean} [options.autoShow=true] Whether or not to show the modal upon creation (if disabled, you'll need to run show() at some point).
     * @param {boolean} [options.closable=true] Whether or not this modal can be closed by the user (if not, you need to do it programmatically).
     * @param {boolean} [options.setScrollLock=true] Whether or not to enable/disable a scroll lock while the modal is open. If scroll lock is already activated, this defaults to false.
     * @param {boolean} [options.useTransitions=true] If true, the script will listen for transitions to figure out when the modal is shown or hidden. If disabled, these listeners are not set, and events fire immediately.
     * @param {function|function[]} [options.beforeShow=[]] Optional callback(s) to fire before the modal is shown. Single function or array of functions.
     * @param {function|function[]} [options.afterShow=[]] Optional callback(s) to fire after the modal is shown. Single function or array of functions.
     * @param {function|function[]} [options.beforeHide=[]] Optional callback(s) to fire before the modal is destroyed. Single function or array of functions.
     * @param {function|function[]} [options.afterHide=[]] Optional callback(s) to fire after the modal is destroyed. Single function or array of functions.
     * @param {function|function[]} [options.beforeDestruct=[]] Optional callback(s) to fire just before the modal is destroyed. Single function or array of functions.
     */
    constructor(options = {}) {
        this.dom = {};

        this.configuration = {
            blockClass: options.blockClass || 'modal',
            modifierClass: options.modifierClass || '',

            autoShow: typeof options.autoShow === "boolean" ? options.autoShow : true,
            closable: typeof options.closable === "boolean" ? options.closable : true,

            setScrollLock: typeof options.setScrollLock === "boolean" ? options.setScrollLock : !currentScrollLockState,

            useTransitions: typeof options.useTransitions === "boolean" ? options.useTransitions : transitionEndEventName.length > 0,

            // Callbacks, man!
            beforeShow: this.sanitizeCallbacks(options.beforeShow),
            afterShow: this.sanitizeCallbacks(options.afterShow),
            beforeHide: this.sanitizeCallbacks(options.beforeHide),
            afterHide: this.sanitizeCallbacks(options.afterHide),
            beforeDestruct: this.sanitizeCallbacks(options.beforeDestruct)
        };

        this.buildDOMNodes();

        // Load title if set through the options.
        if (typeof options.title !== "undefined") {
            this.setTitle(options.title);
        }

        // Load content if set through the options.
        if (typeof options.content !== "undefined") {
            this.setContent(options.content);
        }

        if (this.configuration.autoShow) {
            window.setTimeout(() => this.show(), 50);
        }

        modalCount += 1;

    }


    /**
     * Build the "BE"-part of a BEM-object class name.
     * @param {string} elementIdentifier
     * @returns {string}
     */
    buildBaseClass(elementIdentifier) {
        return `${this.configuration.blockClass}__${elementIdentifier}`;
    }


    /**
     * Build a string containing all relevant classnames for the given element type.
     *
     * @param {string} elementIdentifier - This will become the "E" in the BEM-naming - in other words, the element name.
     * @param {string} [modifier=""] - Optional modifier class, that will be added in addition to the modifierClass from the configuration.
     * @returns {string}
     */
    buildCompleteClassString(elementIdentifier, modifier) {

        const baseClass = this.buildBaseClass(elementIdentifier);
        let className = baseClass;

        if (typeof modifier === "string" && modifier.length > 0) {
            className += ` ${baseClass}--${modifier}`;
        }

        if (typeof this.configuration.modifierClass === "string" && this.configuration.modifierClass.length > 0) {
            className += ` ${baseClass}--${this.configuration.modifierClass}`;
        }

        return className;
    }


    /**
     * Ensure that the callback lists are populated with nothing but arrays.
     *
     * @param {function|function[]} callbackList
     * @returns {Array}
     */
    sanitizeCallbacks(callbackList) {
        return callbackList instanceof Array ? callbackList : typeof callbackList === 'function' ? [callbackList] : [];
    }


    /**
     * Build all the DOM nodes for this particular instance.
     *
     * @returns {Modal}
     */
    buildDOMNodes() {

        this.dom.body = document.querySelector('body');

        // First we'll create the background and outer wrapper as "real" DOM elements,
        // since that'll make it easier to reference them later.
        const modalBG = document.createElement('div');
        const modalContainer = document.createElement('section');

        const closeButton = this.configuration.closable ? `<button type="button" class="${this.buildCompleteClassString(classNames.closeButton)}">
                        <span class="${this.buildCompleteClassString(classNames.closeIcon, '1')}"></span>
                        <span class="${this.buildCompleteClassString(classNames.closeIcon, '2')}"></span>
                        <span class="${this.buildCompleteClassString(classNames.closeLabel)}"></span>
                    </button>` : "";

        // Create the inner content of the modal as a template literal. We don't need
        // references right now.
        const modalContentString = `<div class="${this.buildCompleteClassString(classNames.innerWrapper)}">
                <header class="${this.buildCompleteClassString(classNames.header)}">
                    ${closeButton}
                    <div class="${this.buildCompleteClassString(classNames.titleWrapper)}"></div>
                </header>
                <div class="${this.buildCompleteClassString(classNames.content)}"></div>
            </div>`;


        // Set some classes on the outer elements, then add them to the body
        const levelName = `level${modalCount}`;
        modalBG.className = `${this.buildCompleteClassString(classNames.background, levelName)}`;
        modalContainer.className = `${this.buildCompleteClassString(classNames.wrapper, levelName)}`;
        this.dom.body.appendChild(modalBG);
        this.dom.body.appendChild(modalContainer);


        // Insert the inner content wrapper now.
        modalContainer.insertAdjacentHTML('beforeend', modalContentString);


        // Store references to the elements we created for later use.
        this.dom.background = modalBG;
        this.dom.wrapper = modalContainer;
        this.dom.contentWrapper = modalContainer.querySelector(`.${this.buildBaseClass(classNames.content)}`);
        this.dom.titleWrapper = modalContainer.querySelector(`.${this.buildBaseClass(classNames.titleWrapper)}`);


        if (this.configuration.closable) {
            this.dom.closeButton = modalContainer.querySelector(`.${this.buildBaseClass(classNames.closeButton)}`);

            // Make sure the popup closes when either the background or close-button is clicked.
            addEvent(this.dom.closeButton, 'click', this.destroy.bind(this));
            addEvent(this.dom.background, 'click', this.destroy.bind(this));
        }

        return this;
    }


    /**
     * Fire all callbacks registered with the named type (ie. "beforeDestruct") or similar.
     *
     * @param {string} callbackType
     * @returns {Modal}
     */
    fireCallbacks(callbackType) {
        if (this && this.configuration) {
            const callbackArray = this.configuration[callbackType];
            if (Array.isArray(callbackArray) && callbackArray.length) {
                callbackArray.forEach(funcRef => {
                    funcRef.call(this);
                });
            }
        }
        return this;
    }


    beforeShow() {
        this.fireCallbacks("beforeShow");
    }


    afterShow() {
        this.fireCallbacks("afterShow");
    }


    beforeHide() {
        this.fireCallbacks("beforeHide");
    }


    afterHide() {
        this.fireCallbacks("afterHide");
    }


    beforeDestruct() {
        this.fireCallbacks("beforeDestruct");
    }


    /**
     * Show the modal.
     *
     * @returns {Modal}
     */
    show() {
        if (this.configuration.setScrollLock) {
            // Scroll locks are nice. Let's do some of that.
            scrollLock.enable();
        }

        this.beforeShow();
        if (this.configuration.useTransitions) {
            addEventOnce(this.dom.wrapper, transitionEndEventName, this.afterShow.bind(this));
        } else {
            this.afterShow();
        }
        addClass(this.dom.background, `${this.buildBaseClass(classNames.background)}--${activeClassModifier}`);
        addClass(this.dom.wrapper, `${this.buildBaseClass(classNames.wrapper)}--${activeClassModifier}`);

        return this;
    }


    /**
     * Hide the modal.
     *
     * @param {boolean} [avoidEvents=false] - If true, the "afterHide()" functions will NOT be fired once the modal is hidden.
     * @returns {Modal}
     */
    hide(avoidEvents = false) {
        if (this.configuration.setScrollLock) {
            // Disable scroll lock
            scrollLock.disable();
        }

        this.beforeHide();

        if (avoidEvents !== true) {
            if (this.configuration.useTransitions) {
                addEventOnce(this.dom.wrapper, transitionEndEventName, this.afterHide.bind(this));
            } else {
                this.afterHide();
            }
        }
        removeClass(this.dom.background, `${this.buildBaseClass(classNames.background)}--${activeClassModifier}`);
        removeClass(this.dom.wrapper, `${this.buildBaseClass(classNames.wrapper)}--${activeClassModifier}`);

        return this;
    }



    /**
     * Clear the content area completely.
     *
     * @returns {Modal}
     */
    clearContent() {
        if (typeof this.dom === 'object' && this.dom.contentWrapper instanceof HTMLElement) {
            this.dom.contentWrapper.innerHTML = '';
        }

        return this;
    }


    /**
     * Load content into the modal container.
     *
     * @param {HTMLElement|Node|string} content
     * @param {boolean} [clearFirst]
     * @returns {Modal}
     */
    setContent(content, clearFirst = false) {

        if (clearFirst) {
            this.clearContent();
        }

        if (content instanceof Node) {
            this.dom.contentWrapper.insertBefore(content, null);
        } else if (typeof content === 'string') {
            this.dom.contentWrapper.insertAdjacentHTML('beforeend', content);
        }

        return this;

    }


    /**
     * An easy way of getting the content wrapper, in case you need it from the outside for further processing.
     *
     * @returns {HTMLElement}
     */
    getContentWrapper() {
        return this.dom.contentWrapper;
    }



    /**
     * Add a raw text string to the content wrapper as a pretty, formatted title object.
     *
     * @param {Element|string} title - The title to add. Should be either an HTMLElement or a string.
     * @param {boolean} [stringAsHTML=false] - If "title" is a string, and this argument is true, the content will be set using innerHTML. Otherwise, innerText will be used.
     * @returns {Modal}
     */
    setTitle(title, stringAsHTML = false) {

        if (!this.dom.titleElement) {
            this.dom.titleElement = document.createElement("h2");
            addClass(this.dom.titleElement, this.buildCompleteClassString(classNames.title));
            this.dom.titleWrapper.append(this.dom.titleElement);
        }

        // Set the title
        if (title instanceof Element) {
            this.dom.titleElement.innerHTML = '';
            this.dom.titleElement.appendChild(title);
        } else if (typeof title === "string") {
            this.dom.titleElement[stringAsHTML ? 'innerHTML' : 'innerText'] = title;
        }

        return this;
    }


    /**
     * An easy way of getting the title wrapper, because we care.
     *
     * @returns {HTMLElement}
     */
    getTitleWrapper() {
        return this.dom.titleWrapper;
    }



    /**
     * Destroy the modal. This will remove event handlers and remove the DOM as best we can.
     */
    destroy() {

        this.beforeDestruct();

        // Remove all regular event listeners, because that's just a nice thing to to.
        removeAllEvents(this.dom.closeButton);
        removeAllEvents(this.dom.background);

        /**
         * Callback function for cleaning up after ourselves.
         */
        const afterHideCallback = () => {
            // Fire the "afterHide" callbacks (if any) manually, because we've disabled the event listener that would've
            // done this automatically.
            this.afterHide();

            // Remove all content nodes.
            this.clearContent();
            this.dom.body.removeChild(this.dom.background);
            this.dom.body.removeChild(this.dom.wrapper);

            // More cleanup!
            delete this.dom;
            delete this.configuration;
        };

        // Set up a callback function to clean up the DOM once we're done hiding the modal
        if (this.configuration.useTransitions) {
            addEventOnce(this.dom.wrapper, transitionEndEventName, afterHideCallback);
        }

        this.hide();

        // If we're not listening for transitions, let's just clear out immediately.
        if (!this.configuration.useTransitions) {
            afterHideCallback();
        }

        modalCount -= 1;
    }


}




/**
 * Shortcut for displaying a confirm-message to the user. Will return a promise that is resolved on "Yes" and
 * rejected on "No".
 *
 * @param {string|HTMLElement} message
 * @param {string|HTMLElement} title
 * @param {string} [yesLabel]
 * @param {string} [noLabel]
 * @returns {Promise}
 */
export function confirm(message, title, yesLabel, noLabel) {
    return new Promise((onYes, onNo) => {

        const content = createElement('div', { className: 'modal__content-inner text-center' });
        const contentParagraph = createElement('p', { text: message });
        const yesButton = createElement('button', { className: 'btn btn--primary', text: yesLabel || "Yes" });
        const noButton = createElement('button', { className: 'btn btn--secondary', text: noLabel || "No" });

        const alertModal = new Modal({
            closable: false,
            beforeDestruct: () => {
                removeAllEvents(yesButton);
                removeAllEvents(noButton);
            }
        });

        addClass(alertModal.getTitleWrapper(), "text-center");

        addEventOnce(yesButton, "click", () => {
            alertModal.destroy();
            onYes();
        });
        addEventOnce(noButton, "click", () => {
            alertModal.destroy();
            onNo();
        });

        content.appendChild(contentParagraph);
        content.appendChild(yesButton);
        content.appendChild(noButton);

        alertModal
            .setTitle(title)
            .setContent(content);
    });
}


/**
 * Shortcut for displaying an alert box to the user. Returns a promise that resolves when the user clicks "OK".
 *
 * @param {string|HTMLElement} message
 * @param {string|HTMLElement} title
 * @param {string} [okLabel="OK"]
 * @returns {Promise}
 */
export function alert(message, title, okLabel) {

    return new Promise(onOK => {

        const content = createElement('div', { className: 'modal__content-inner text-center' });
        const contentParagraph = createElement('p', { text: message });
        const button = createElement('button', { className: 'btn btn--primary', text: okLabel || "OK" });

        const alertModal = new Modal({
            beforeDestruct: () => {
                removeAllEvents(button);
                onOK();
            }
        });

        addClass(alertModal.getTitleWrapper(), "text-center");

        addEventOnce(button, "click", () => alertModal.destroy());

        content.appendChild(contentParagraph);
        content.appendChild(button);

        alertModal
            .setTitle(title)
            .setContent(content);
    });

}
