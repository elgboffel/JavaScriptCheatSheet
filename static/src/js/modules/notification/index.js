import Notification from "./notification";
import {addNotification} from "./handler";

let notificationsCount = 0;


/**
 * Create notification
 *
 * @param {Object} data
 * @param {String} data.text                - Text
 * @param {String} [data.icon]              - Icon to show next to text
 * @param {String} [data.classNames]        - Class names to be added to notification (space separated string)
 * @param {Boolean} [data.swipeToRemove]    - Class names to be added to notification (space separated string)
 * @param {Number} [data.duration]          - Duration in seconds
 * @param {Boolean} [data.progressBar]      - Show progress bar?
 */
export function createNotification(data) {
    // Increase notifications count
    notificationsCount += 1;

    // Create new notification from data
    const newNotification = new Notification(notificationsCount, data);

    addNotification(newNotification);
}


export default createNotification;
