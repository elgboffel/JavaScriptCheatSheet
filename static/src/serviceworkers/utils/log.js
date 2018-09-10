import { version as SERVICEWORKER_VERSION } from '../../../../setup/serviceworker-version.json';


/**
 * @type {boolean}
 */
let enabled = false;


/**
 * Enable log.
 */
export function enableLog() {
    enabled = true;
}


/**
 * Disable log.
 */
export function disableLog() {
    enabled = false;
}


/**
 * Log a color coded messages in the console.
 *
 * @param {string} type
 * @param {string} message
 * @param {*} [attachment]
 */
export function log(type, message, attachment = '') {

    if (enabled) {
        let color = 'auto';
        let backgroundColor = 'auto';

        if (type === 'status') {
            color = 'auto';
        } else if (type === 'add') {
            color = '#5dad2b';
        } else if (type === 'delete') {
            color = '#dd0000';
        } else if (type === 'return') {
            color = '#1e90ff';
        } else if (type === 'offline') {
            color = '#000000';
            backgroundColor = '#1e90ff';
        } else if (type === 'fetch') {
            color = '#ff6c00';
        } else if (type === 'error') {
            color = '#000000';
            backgroundColor = '#800000';
        }

        // eslint-disable-next-line no-console
        console.log(`SW ${SERVICEWORKER_VERSION}: %c${message}`, `color: ${color}; background-color: ${backgroundColor}`, attachment);
    }

}


export default log;
