import createElement from '../../utils/dom/createElement';
import Timer from '../../utils/timer';
import { removeNotification } from './handler';
import { addEvent, removeEvent, removeAllEvents } from '../../utils/events/events';
import { remove as removeClass, add as addClass } from '../../utils/dom/classList';
import notificationTemplate from './template';

class Notification {

    /**
     * Create notification
     *
     * @param {Number} notificationsCount
     * @param {Object} data
     * @param {String} data.text                - Text
     * @param {String} [data.icon]              - Icon to show next to text
     * @param {String} [data.classNames]        - Class names to be added to notification (space separated string)
     * @param {Boolean} [data.swipeToRemove]    - Class names to be added to notification (space separated string)
     * @param {number} [data.duration]          - Duration in milliseconds - Defaults to 5000 - Set to 0 to show notification until it's removed manually
     * @param {Boolean} [data.progressBar]      - Show progress bar? - Defaults to false
     * @returns {{element: HTMLElement, id: String}}
     */
    constructor(notificationsCount, data) {
        this.id = notificationsCount;
        this.mainClass = "notification";
        this.duration = data.duration === 0 ? 0 : Number(data.duration) || 5000;
        this.touchMove = {
            x: null,
            y: null,
            use: null,
            time: null
        };
        this.swipeToRemove = data.swipeToRemove !== false;
        this.dom = {};

        // Create markup from template
        const temporaryContainer = createElement('div', {
            html: notificationTemplate(this.mainClass, data)
        });
        this.dom.notification = temporaryContainer.firstElementChild;

        // Make reference to notification's "inside element"
        this.dom.inside = this.dom.notification.firstElementChild;

        // Create a progress bar or set a timeout to remove notification (if a duration is set)
        if (data.progressBar && data.progressBar === true && this.duration) {
            this.dom.progressBar = this.dom.notification.querySelector(`.${this.mainClass}__progressbar`);
            this.dom.progressBar.style.animationDuration = `${this.duration}ms`;
            addEvent(this.dom.progressBar, "animationend", () => this.destroy());
        } else if (this.duration) {
            this.timeout = new Timer(() => this.destroy(), this.duration);
        }


        // After 750 ms, add event listeners for removing notification
        window.setTimeout(() => {

            // Remove notification on click
            addEvent(this.dom.inside, "click", event => {
                // Prevent default behaviour
                event.preventDefault();

                // Destroy notification
                this.destroy();

                return false;
            });

            // Swipe to remove
            if (this.swipeToRemove) {
                addEvent(this.dom.inside, "touchstart", event => {
                    const timestamp = Date.now();
                    this.touchMove.x = event.touches[0].clientX;
                    this.touchMove.y = event.touches[0].clientY;
                    this.touchMove.time = new Date().getTime();

                    addEvent(this.dom.inside, "touchmove", event => {
                        event.preventDefault();

                        const movement = {
                            x: Math.min(Math.max(event.touches[0].clientX - this.touchMove.x, -100), 100),
                            y: Math.min(Math.max(event.touches[0].clientY - this.touchMove.y, -100), 0)
                        };
                        let opacity;

                        if (!this.touchMove.use) {
                            this.touchMove.use = (Math.abs(movement.x) > Math.abs(movement.y) ? "x" : "y");
                        }

                        if (this.touchMove.use === "x") {
                            this.dom.inside.style.transform = `translate3d(${movement.x}px, 0, 0)`;
                            opacity = 1 - Math.abs(movement.x) / 100;
                        } else {
                            this.dom.inside.style.transform = `translate3d(0, ${movement.y}px, 0)`;
                            opacity = 1 - Math.abs(movement.y) / 100;
                        }
                        this.dom.inside.style.opacity = opacity;
                    });

                    addEvent(this.dom.inside, "touchend", event => {
                        const movement = {
                            x: Math.abs(event.changedTouches[0].clientX - this.touchMove.x),
                            y: Math.abs(event.changedTouches[0].clientY - this.touchMove.y)
                        };

                        removeEvent(this.dom.inside, "touchmove touchend");

                        if (Date.now() - timestamp < 250 && movement.x < 10 && movement.y < 10) {
                            // This must have been a click
                            this.destroy();
                        } else if ((this.touchMove.use === "x" && movement.x > 50) || (this.touchMove.use === "y" && movement.y > 50)) {
                            this.destroy();
                        } else {
                            addClass(this.dom.notification, `${this.mainClass}--transition-back`);
                            addEvent(this.dom.inside, "transitionend", () => {
                                this.dom.inside.style.transform = "";
                                this.dom.inside.style.opacity = "";
                                removeClass(this.dom.notification, `${this.mainClass}--transition-back`);
                            });
                        }

                        this.touchMove.x = null;
                        this.touchMove.y = null;
                        this.touchMove.use = null;
                        this.touchMove.time = null;
                    });
                });
            }
        }, 750);

        return {
            element: this.dom.notification,
            timeout: this.timeout,
            id: this.id
        };
    }


    /**
     * Destroy notification
     */
    destroy() {
        if (this.dom.notification) {

            // Remove event listeners
            removeAllEvents(this.dom.inside);

            if (this.dom.progressbar) {
                removeEvent(this.dom.progressbar, "animationend");
            }

            // Hide notification
            this.dom.notification.style.maxHeight = `${this.dom.notification.offsetHeight}px`;
            window.forceRedraw = this.dom.notification.offsetHeight;
            addClass(this.dom.notification, `${this.mainClass}--hide`);

            // Remove notification when it's hidden
            addEvent(this.dom.notification, "transitionend", () => {
                removeAllEvents(this.dom.notification);
                removeNotification(this.id);
            });
        }
    }
}

export default Notification;
