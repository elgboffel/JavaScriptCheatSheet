import onReady from '../utils/events/onReady';
import {add as addClass, remove as removeClass} from '../utils/dom/classList';
import {onScroll} from '../utils/events/onScroll';
import getElementScroll from '../utils/dom/getElementScroll';
import scrollTo from '../utils/dom/scrollTo';
import {onWindowResize, currentWindowHeight} from '../utils/events/onWindowResize';
import {addEvent} from '../utils/events/events';


/**
 * Class names
 */
const classNames = {
    activeModifier: 'scrolltotop--active',
    clickArea: 'scrolltotop__clickarea'
};


class ScrollToTop {

    /**
     * @param {HTMLElement} container
     */
    constructor(container) {
        this.settings = {
            /**
             * User needs to be scrolled this many screen sizes down for the button to show.
             * @type {number}
             */
            showAfterWindowHeightsDown: 4,

            /**
             * Only show button when user tries to get back up to the top, and has scrolled this many screen sizes.
             * @type {number} - Set this to 0 to show the button without waiting for the user to scroll up first.
             */
            showAfterWindowHeightsUp: 1
        };

        // Variables used in the code below
        // Don't mess with these unless you know what you're doing
        this.tempData = {
            isVisible: false,
            scrollDownPeak: 0,
            scrollUpPeak: 0
        };

        onReady(() => this.initialize(container));
    }


    /**
     * Create the DOM-elements we need.
     * @param {HTMLElement} container
     */
    createDOM(container) {
        this.dom = {
            container,
            clickArea: container.querySelector(`.${classNames.clickArea}`)
        };
    }


    /**
     * Bind events
     */
    bindEvents() {
        addEvent(this.dom.clickArea, "click", () => scrollTo(0));
    }


    /**
     * Check scroll position
     * and decide whether to show or hide the Scroll To Top button - or do nothing at all
     */
    checkScroll() {
        const windowScrollPosition = getElementScroll();

        if (!this.tempData.isVisible) {
            // Button is not visible yet

            if (this.settings.showAfterWindowHeightsUp && this.tempData.scrollDownPeak && windowScrollPosition.top <= this.tempData.scrollDownPeak - (currentWindowHeight * this.settings.showAfterWindowHeightsUp) && windowScrollPosition.top > currentWindowHeight) {
                // The user has scrolled up enough (after scrolling down first) to show the Go To Top

                // Show Go To Top now
                addClass(this.dom.container, classNames.activeModifier);
                this.tempData.isVisible = true;

                // Reset scroll down "peak position"
                this.tempData.scrollDownPeak = 0;

                // Set scroll up "peak position"
                this.tempData.scrollUpPeak = windowScrollPosition.top;

            } else if (windowScrollPosition.top >= currentWindowHeight * this.settings.showAfterWindowHeightsDown) {
                // The user has scrolled down enough to show the Go To Top

                if (!this.settings.showAfterWindowHeightsUp) {

                    // If the user doesn't need to scroll up before showing the Go To Top,
                    // show it now
                    addClass(this.dom.container, classNames.activeModifier);
                    this.tempData.isVisible = true;

                } else if (this.tempData.scrollDownPeak < windowScrollPosition.top) {

                    // Remember the scroll down "peak position"
                    this.tempData.scrollDownPeak = windowScrollPosition.top;

                }

            }

        } else {
            // Button is already visible

            if (this.settings.showAfterWindowHeightsUp && windowScrollPosition.top > this.tempData.scrollUpPeak + currentWindowHeight) {
                // User is scrolling back down

                // Hide Scroll To Top
                removeClass(this.dom.container, classNames.activeModifier);
                this.tempData.isVisible = false;

                // Reset scroll up "peak position"
                this.tempData.scrollUpPeak = 0;

                if (this.tempData.scrollDownPeak < windowScrollPosition.top && windowScrollPosition.top >= currentWindowHeight * this.settings.showAfterWindowHeightsDown) {
                    // Remember the scroll down "peak position"
                    this.tempData.scrollDownPeak = windowScrollPosition.top;
                }

            } else if (windowScrollPosition.top < currentWindowHeight) {
                // User is almost back at the top of the page

                // Hide Go To Top
                removeClass(this.dom.container, classNames.activeModifier);
                this.tempData.isVisible = false;

                // Reset the scroll up/down "peak positions"
                this.tempData.scrollUpPeak = 0;
                this.tempData.scrollDownPeak = 0;

            } else if (this.settings.showAfterWindowHeightsUp) {

                if (this.tempData.scrollDownPeak < windowScrollPosition.top && windowScrollPosition.top >= currentWindowHeight * this.settings.showAfterWindowHeightsDown) {
                    // Remember the scroll down "peak position"
                    this.tempData.scrollDownPeak = windowScrollPosition.top;
                }

                if (this.tempData.scrollUpPeak > windowScrollPosition.top) {
                    // Remember the scroll up "peak position"
                    this.tempData.scrollUpPeak = windowScrollPosition.top;
                }
            }
        }
    }


    /**
     * Initialize module
     * @param {HTMLElement} container
     */
    initialize(container) {
        this.createDOM(container);
        this.bindEvents();

        // Check scroll position and do what's gotta be done - on scroll and window resize
        onScroll(window, () => this.checkScroll(), 250);
        onWindowResize(() => this.checkScroll());
    }

}

export default ScrollToTop;
