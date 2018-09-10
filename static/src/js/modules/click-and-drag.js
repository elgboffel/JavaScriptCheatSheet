import onReady from '../utils/events/onReady';
import { addEvent, removeEvent } from '../utils/events/events';
import { add as addClass, remove as removeClass } from '../utils/dom/classList';

/**
 * @author Christopher Bourlon <cbo@dis-play.dk>
 *
 * and improved by the team
 *
 */

/**
 * @description
 * You can click on the box and pull the elements form a side to another.
 *
 * TO USE:
 *
 * In the .html file
 * Add data-module="click-and-drag" to you <div> and that's it! Of course, don't forget the .scss file.
 *
 * In the main.js
 * import ClickAndDrag from './modules/click-and-drag';
 *
 * bootstrapper({
 *  'click-and-drag': ClickAndDrag
 * });
 *
 */

/**
 * @param {HTMLElement} container
 * @constructor
 */
class ClickAndDrag {
    /**
     * The constructor is fired once the class is instantiated.
     *
     * @param {HTMLElement} container
     */
    constructor(container) {
        this.isDown = false;
        this.startX;
        this.scrollLeft;
        this.speed = 2; // speed of the walk (scroll when we grab)
        onReady(() => this.init(container));// Run initializing code once the DOM is ready.
    }


    /**
     * fired when the mouse is down
     * @event add the handlers
     */
    bindEvents() {
        addEvent(this.dom.container, 'mouseleave', this.leaveHandler);
        addEvent(this.dom.container, 'mouseup', this.upHandler);
        addEvent(this.dom.container, 'mousemove', this.moveHandler);
    }


    /**
     * fired to clean after us when the trick is done.
     * @event remove the handlers
     */
    removeEvents() {
        removeEvent(this.dom.container, 'mouseleave', this.leaveHandler);
        removeEvent(this.dom.container, 'mouseup', this.upHandler);
        removeEvent(this.dom.container, 'mousemove', this.moveHandler);
    }


    /**
     * when the cursor leaves the container
     */
    mouseLeaveHandler() {
        this.isDown = false;
        removeClass(this.dom.container, 'click-and-drag--active');
        this.removeEvents();
    }


    /**
     * when the mouse is "clicked"
     * @param {Event} e
     */
    mouseDownHandler(e) {
        this.isDown = true;
        addClass(this.dom.container, 'click-and-drag--active');
        this.startX = e.pageX - this.dom.container.offsetLeft;
        this.scrollLeft = this.dom.container.scrollLeft;
        this.bindEvents();
    }


    /**
     * when the cursor "grabs" and move on the container
     * @param {Event} e
     */
    mouseMoveHandler(e) {
        if (!this.isDown) {
            return; // stop the function from running
        }
        e.preventDefault();
        const x = e.pageX - this.dom.container.offsetLeft;
        const walk = (x - this.startX) * this.speed;
        this.dom.container.scrollLeft = this.scrollLeft - walk;
    }


    /**
     * when the cursor does not "grab" (no click)
     */
    mouseUpHandler() {
        this.isDown = false;
        removeClass(this.dom.container, 'click-and-drag--active');
        this.removeEvents();
    }


    /**
     * The actual initialization function, fired once the DOM is ready.
     *
     * @param {HTMLElement} container
     */
    init(container) {

        this.dom = {
            container,
        };

        this.leaveHandler = e => this.mouseLeaveHandler(e);
        this.upHandler = e => this.mouseUpHandler(e);
        this.downHandler = e => this.mouseDownHandler(e);
        this.moveHandler = e => this.mouseMoveHandler(e);

        /**
         * the main event that listen to the mousedown. Fires the mouseDownHandler which contains bindEvents()
         */
        addEvent(this.dom.container, 'mousedown', e => this.downHandler(e));
    }
}


export default ClickAndDrag;
