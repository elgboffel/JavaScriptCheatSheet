/**
 * Template for notification
 * Be very wary if editing this and remember to test it carefully
 *
 * @param {String} mainClass                - Main class name
 * @param {Object} data
 * @param {String} data.text                - Text
 * @param {String} [data.icon]              - Icon to show next to text
 * @param {String} [data.classNames]        - Class names to be added to notification (space separated string)
 * @param {Number} [data.duration]          - Duration in seconds
 * @param {Boolean} [data.progressBar]      - Show progress bar?
 * @returns {String}
 */
export default function notificationTemplate(mainClass, data) {
    const icon = `<div class="${mainClass}__icon">${data.icon}</div>`;

    const additionalClass = data.progressBar && data.duration ? `${mainClass}__inside--has-progressbar` : '';

    return `
        <div class="${mainClass} ${data.classNames ? data.classNames : ''}">
            <div class="${mainClass}__inside ${additionalClass}">
                <div class="${mainClass}__content">
                    ${data.icon ? icon : ''}
                    <div class="${mainClass}__message">
                        ${data.text}
                    </div>
                </div>
                ${data.progressBar && data.duration ? `<div class="${mainClass}__progressbar"></div>` : ''}
            </div>
        </div>`;
}
