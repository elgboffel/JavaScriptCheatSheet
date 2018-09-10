/**
 * Helper-utility for creating a DOM-element. Allows you to make a whole lot of shortcuts when creating elements
 * dynamically. Special setters are included to make setting certain attributes easier, but the rest will simply
 * be overloaded onto the element. For example, the attribute `id` is not in the list and requires no processing,
 * so if you include `options.id="whatever"`, your finished element will have `id="whatever"` set.
 *
 * @module utils/dom/createElement
 * @author Anders Gissel <anders.gissel@akqa.com>
 *
 * @example <caption>Create a label with various options and containing an input field.</caption>
 * import createElement from "./utils/dom/createElement";
 *
 * const inputField = createElement("input", {
 *     className: "input input--text",
 *     type: "text",
 *     id: "myField",
 *     value: 45722
 * });
 *
 * const label = createElement("label", {
 *     html: inputField,
 *     title: "My field lives here."
 * });
 *
 * document.getElementById("target").appendChild(label);
 * // Output will be: <label title="My field lives here."><input type="text" class="input input--text" id="myField" value="45722" /></label>
 */

import { addClass } from "./classList";
import forEach from '../forEach';


/**
 * Create a DOM element with the given options. Basically an interface for `document.createElement();`. Any option not
 * described in the parameter list will be added to the tag as a regular attribute.
 *
 * @param {string} tagName - The tag name of the element, ie. "p". Required!
 * @param {object} [options] - Additional options for the new element. Any option that's not on the list will be added as a "regular" attribute.
 * @param {string|array} [options.className] - Classname(s) of element. Can be given as just about anything.
 * @param {string} [options.text] - Text-content of element. Will be set using innerText, and is thus XSS-safe.
 * @param {string|Element|Node} [options.html] - HTML-content of element. Will be set as innerHTML if string is given; appended if Element is given.
 * @param {object} [options.attributes] - DEPRECATED: Key/value pairs of additional attributes, ie.: { readonly: true, 'data-whatever': 'yes' }. This syntax is still supported, but you should just add your extra properties to the main options.
 * @returns {HTMLElement|Element}
 */
export function createElement(tagName, options = {}) {

    const newElement = document.createElement(tagName);

    forEach(options, (optionValue, optionKey) => {

        switch (optionKey) {

        case "className":
            addClass(newElement, optionValue || "");
            break;

        case "attributes":
            forEach(optionValue, (value, attribute) => newElement.setAttribute(attribute, value));
            break;

        case "html":
            // We'll only set the HTML contents if the "text" property hasn't ALSO been set.
            if (!options.text && typeof optionValue !== "undefined") {
                if (typeof optionValue === "string") {
                    newElement.innerHTML = optionValue;
                } else {
                    if (optionValue instanceof Node) {
                        newElement.appendChild(optionValue);
                    }
                }
            }
            break;

        case "text":
            newElement.innerText = options.text;
            break;

        default:
            // Any unknown option key will be treated as a raw attribute.
            newElement.setAttribute(optionKey, optionValue);

        }

    });

    return newElement;

}


export default createElement;
