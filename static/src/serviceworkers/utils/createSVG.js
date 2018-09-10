/**
 * Create an SVG image with a background color and a text
 *
 * @param [text='offline'] - Text to show on image (defaults to "offline")
 * @param {Object} [options]
 * @param {number} [options.width] - Image width (defaults to 400)
 * @param {number} [options.height] - Image height (defaults to 300)
 * @param {string} [options.backgroundColor] - Background color (defaults to #d8d8d8)
 * @param {string} [options.fontFamily] - Font family. Go with something web-safe (defaults to sans-serif)
 * @param {number} [options.fontSize] - Font size in points (defaults to 72)
 * @param {string} [options.fontWeight] - Font weight (defaults to bold)
 * @param {string} [options.color] - Font color (defaults to #9b9b9b)
 * @returns {string} - Returns string with SVG markup
 */
export default function createSVG(text = 'offline', options = {}) {
    const width = options.width || 400;
    const height = options.height || 300;
    const backgroundColor = options.backgroundColor || '#d8d8d8';
    const fontFamily = options.fontFamily || 'sans-serif';
    const fontSize = options.fontSize || 72;
    const fontWeight = options.fontWeight || 'bold';
    const color = options.color || '#9b9b9b';

    const backgroundWidth = (2000 * 2) + width;
    const backgroundHeight = (2000 * 2) + height;

    return new Blob([`
<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <rect x="-2000" y="-2000" width="${backgroundWidth}" height="${backgroundHeight}" fill="${backgroundColor}"/>
    <text fill="${color}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}" x="50%" y="50%" text-anchor="middle" alignment-baseline="middle">
        ${text}
    </text>
</svg>`]);
}
