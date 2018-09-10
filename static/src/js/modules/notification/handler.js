import {addEvent, addEventOnce, removeAllEvents} from "../../utils/events/events";
import forEach from "../../utils/forEach";

let hoverEventIsListening = false;
const dom = {
    notifications: {}
};


/**
 * Remove notification
 *
 * @param {String} id - Notification ID
 */
export function removeNotification(id) {
    if (dom.notifications[id] && dom.notifications[id].element) {
        // Remove notification from DOM
        dom.container.removeChild(dom.notifications[id].element);

        // Delete reference
        delete dom.notifications[id];

        // If there are no notifications present, stop listening for mouse enter
        if (!Object.keys(dom.notifications).length) {
            hoverEventIsListening = false;
            removeAllEvents(dom.container);
        }
    }
}


export function addNotification(newNotification) {
    // Add reference
    dom.notifications[newNotification.id] = newNotification;

    // Make sure container exists
    if (!dom.container) {
        dom.container = document.createElement("div");
        dom.container.className = "notifications";
        document.body.appendChild(dom.container);
    }

    // Prepend notification to container
    dom.container.appendChild(dom.notifications[newNotification.id].element);

    if (!hoverEventIsListening) {
        hoverEventIsListening = true;

        // Pause timeout on all notifications on hover
        addEvent(dom.container, "mouseenter", () => {
            forEach(dom.notifications, notification => {
                if (typeof notification.timeout !== 'undefined') {
                    notification.timeout.pause();
                }
            });

            // Resume timeouts on mouse leave
            addEventOnce(dom.container, "mouseleave", () => {
                forEach(dom.notifications, notification => {
                    if (typeof notification.timeout !== 'undefined') {
                        notification.timeout.resume();
                    }
                });
            });
        });
    }
}
