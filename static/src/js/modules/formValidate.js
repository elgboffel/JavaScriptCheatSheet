/**
 * FormValidate function
 *
 * Validates form fields using the Constraint Validation Javascript API,
 * displaying an error when the user leaves a field, and keeping that error persistent until the issue is fixed.
 *
 * When validated and submitted, the field elements are returned for your very own amusement.
 *
 * @module FormValidate
 * @author Bjarni Olsen <bjo@dis-play.dk>
 * @author Lars Munkholm <lar@dis-play.dk>
 *
 *
 * @example <caption>Basic JS:</caption>
 * import FormValidate from './modules/formvalidate';
 *
 * const formElement = document.querySelector("form");
 * const formValidation = new FormValidate({
 *     form: formElement,
 *     onSubmit: fields => {
 *         window.console.log(fields);
 *     }
 * });
 *
 *
 * @example <caption>Basic HTML:
 * Use a combination of semantic input types and validation attributes such as "required" and "pattern".
 * All error and requirement messages is set on the input control but fallback to hardcoded messages.</caption>
 * {@lang html}
 * <!-- As a minimum the field should use "required" to get validated.-- >
 * <input required type="email" name="inputEmail"/>
 *
 * <!-- Enhance it with the "pattern" and "data" attributes. -->
 * <input
 *     required
 *     type="number"
 *     name="numberInput"
 *     pattern="[-+]?[0-9]"
 *     data-error-message="Please fill out this field."
 *     data-requirements-message="Please only use numbers."
 * />
 */


import onReady from '../utils/events/onReady';
import { addEvent, removeEvent } from '../utils/events/events';
import { addClass, hasClass, removeClass } from '../utils/dom/classList';
import forEach from '../utils/forEach';
import scrollTo from '../utils/dom/scrollTo';
import createElement from '../utils/dom/createElement';


/**
 * Callback for when the valid form is submitted.
 *
 * @callback onSubmit
 * @param {NodeList} fields - The validated fields in the form.
 */

/**
 * Object with the different options for setting up the validation.
 *
 * @typedef {object} FormValidateOptionsObject
 * @property {onSubmit} [onSubmit] - Optional callback to fire after the valid form is submitted.
 */

/**
 * Object returned by this.getValidityState()
 *
 * @private
 * @typedef {Object} ValidationObject
 * @property {Object} checkValidity
 * @property {boolean} checkValidity.badInput
 * @property {boolean} checkValidity.patternMismatch
 * @property {boolean} checkValidity.tooLong
 * @property {boolean} checkValidity.tooShort
 * @property {boolean} checkValidity.valueMissing
 * @property {boolean} valid
 */

/**
 * Object returned by this.checkExtendedValidation()
 *
 * @private
 * @typedef {Object} ExtendedValidationObject
 * @property {boolean} confirmError
 * @property {boolean} valid
 */


class FormValidate {

    /**
     * This is the constructor method for the FormValidate module.
     *
     * @class
     * @param {HTMLFormElement|Node} formElement - The form element to validate
     * @param {FormValidateOptionsObject} [options={}] - Optional options object
     */
    constructor(formElement, options) {

        /**
         * Object containing the various element names that will be used while building the DOM for error messages.
         *
         * @private
         * @type {Object}
         */
        this.classNames = {
            errorField: "formvalidate__error",
            forceInvalidField: "formvalidate__force-invalid",
            validField: "formvalidate__validates",
            message: "formvalidate__error-message",
            messageId: "error-for-"
        };

        /**
         * Global object to contain all DOM elements
         *
         * @private
         * @type {Object}
         */
        this.dom = {};

        /**
         * Global boolean to check for already added events
         *
         * @private
         */
        this.alreadyHasKeyupEvent = false;

        /**
         * This variable holds the event name to fire on a form field in order to trigger validation on it.
         *
         * @type {string}
         */
        this.validationTrigger = "trigger-form-validation";

        /**
         * Comma separated string wit the tag names of the elements that should be validated.
         *
         * @private
         * @type {string}
         */
        this.elementsToValidate = "input, select, textarea, datalist, output";

        onReady(() => this.init(formElement, options));

    }


    /**
     * Generate the field validity object
     *
     * @private
     * @param  {HTMLElement} field - The field to validate
     * @param  {HTMLElement} input - The dummy input
     * @returns {ValidationObject} The validity object
     */
    getValidityState(field, input) {
        let element = field;
        const type = element.getAttribute("type") || input.nodeName.toLowerCase();
        const isNum = type === "number" || type === "range";
        const length = element.value.length;

        let valid = true;

        // If radio group, get selected field
        if (type === "radio" && element.name) {
            const group = this.dom.form.querySelectorAll(`input[name=${element.name}]`);
            forEach(group, (item => {
                if (item.form === element.form && item.checked) {
                    element = item;
                }
            }));
        }

        // Run validity checks
        const checkValidity = {
            badInput: (isNum && length > 0 && !/[-+]?[0-9]/.test(element.value)), // value of a number field is not a number
            patternMismatch: (element.hasAttribute("pattern") && length > 0 && new RegExp(element.getAttribute("pattern")).test(element.value) === false),
            tooLong: (element.hasAttribute("maxLength") && element.getAttribute("maxLength") > 0 && length > parseInt(element.getAttribute("maxLength"), 10)), // the user has edited a too-long value in a field with a maximum length
            tooShort: (element.hasAttribute("minLength") && element.getAttribute("minLength") > 0 && length > 0 && length < parseInt(element.getAttribute("minLength"), 10)), // the user has edited a too-short value in a field with a minimum length,
            valueMissing: (element.hasAttribute("required") && (((type === "checkbox" || type === "radio") && !element.checked) || (type === "select" && element.options[element.selectedIndex].value < 1) || (type !== "checkbox" && type !== "radio" && type !== "select" && length < 1))) // required field without a value
        };

        // Check if any errors
        forEach(checkValidity, check => {
            if (valid) {
                // If there's an error, change valid value
                if (check) {
                    valid = false;
                }
            }
        });

        // Add valid property to validity object
        checkValidity.valid = valid;

        // Return object
        return checkValidity;
    }


    /**
     * Extended validation states
     *
     * @private
     * @param {HTMLElement} field - The field to validate
     * @returns {ExtendedValidationObject} The custom validations object
     */
    checkExtendedValidation(field) {
        const confirmField = field.getAttribute("data-confirms") || false;
        let valid = true;

        // these checks must ALWAYS be a boolean (true or false)
        const confirmFieldElement = this.dom.form.querySelector(`input[name=${confirmField}]`);
        const extendedValidation = {
            confirmError: (confirmFieldElement !== null && confirmFieldElement.value !== field.value)
        };

        // Check if any errors
        forEach (extendedValidation, check => {
            if (valid) {
                // If there's an error, change valid value
                if (check) {
                    valid = false;
                }
            }
        });

        // Add valid property to validity object
        extendedValidation.valid = valid;

        // Return object
        return extendedValidation;
    }


    /**
     * If the set of ValidityState features aren't supported, polyfill.
     *
     * @private
     * @param {HTMLElement} input - The dummy input
     * @returns {Object} The validity object
     */
    polyfillValidityState(input) {
        const selfScope = this;
        Object.defineProperty(HTMLInputElement.prototype, "validity", {
            get: function ValidityState() {
                return selfScope.getValidityState(this, input);
            },
            configurable: true,
        });
    }


    /**
     * Validate input after pressing a key.
     *
     * @private
     * @param {KeyboardEvent} event
     */
    inlineValidation(event) {
        const field = event.target;

        // If this field belongs to a group of fields, get all of them
        let fieldGroup;
        if (field.type === "radio" && field.name) {
            fieldGroup = this.dom.form.querySelectorAll(`input[name=${field.name}]`);
        }

        // Validate the field
        const error = this.hasError(field);

        if (error) {
            this.showError(field, error);
            return;
        }

        // It's valid, remove error class
        removeClass(field, this.classNames.errorField);
        // and add a valid class
        addClass(field, this.classNames.validField);

        // ...remove the keyup eventhandler
        removeEvent(fieldGroup ? fieldGroup : field, "keyup");
        this.alreadyHasKeyupEvent = false;

        // and hide any existing error message
        this.hideError(field);
    }


    /**
     * Validate the field using Validity State properties
     *
     * @private
     * @param {HTMLElement} field
     * @returns {string|boolean}
     */
    hasError(field) {
        // Don't validate submits, buttons and reset inputs, and disabled fields
        if (!field || !field.validity || field.disabled || field.type === "reset" || field.type === "submit" || field.type === "button") {
            return false;
        }

        // Get validity
        const validity = field.validity;

        // Get extended custom validations
        const extendedValidations = this.checkExtendedValidation(field);

        // If all valid, return null
        if (validity.valid && extendedValidations.valid && !hasClass(field, this.classNames.forceInvalidField)) {
            return false;
        }

        // gather all error messages from the field
        const errorMessage = field.dataset.errorMessage || "Please fill out this field";
        const requirementsMessage = field.dataset.requirementsMessage;

        // If field is required and empty
        if (validity.valueMissing) {
            return errorMessage;
        }

        // If not the right type
        if (validity.typeMismatch) {

            // Email
            if (field.type === "email") {
                return requirementsMessage || "Please enter an email address.";
            }

            // URL
            if (field.type === "url") {
                return requirementsMessage || "Please enter a URL.";
            }

        }

        // If too short
        if (validity.tooShort) {
            return requirementsMessage || `Please expand this text to ${field.getAttribute("minLength")} characters or more. You are currently using ${field.value.length} characters.`;
        }

        // If too long
        if (validity.tooLong) {
            return requirementsMessage || `Please short this text to no more than ${field.getAttribute("maxLength")} characters. You are currently using ${field.value.length} characters.`;
        }

        // If number input isn't a number
        if (validity.badInput) {
            return requirementsMessage || "Please enter a number.";
        }

        // If a number value doesn't match the step interval
        if (validity.stepMismatch) {
            return requirementsMessage || "Please select a valid value.";
        }

        // If a number field is over the max
        if (validity.rangeOverflow) {
            return requirementsMessage || `Please select a value that is no more than ${field.getAttribute("max")}.`;
        }

        // If a number field is below the min
        if (validity.rangeUnderflow) {
            return requirementsMessage || `Please select a value that is no less than ${field.getAttribute("min")}.`;
        }

        // If pattern doesn't match
        if (validity.patternMismatch) {
            return requirementsMessage || "Please match the requested format.";
        }

        if (extendedValidations.confirmError) {
            return requirementsMessage || "Field value doesn’t match";
        }

        // If all else fails, return a generic catchall error
        return requirementsMessage || "The value you entered for this field is invalid.";
    }


    /**
     * Show an error message below the field
     *
     * @private
     * @param {HTMLElement} field
     * @param {string} errorMessage
     */
    showError(field, errorMessage) {
        let element = field;

        // Add error class to field
        addClass(element, this.classNames.errorField);
        removeClass(element, this.classNames.validField);

        // If the element is a radio button and part of a group, error all and get the last item in the group
        let elementGroup;
        if (element.type === "radio" && element.name) {
            elementGroup = this.dom.form.querySelectorAll(`input[name=${element.name}]`);
            const len = elementGroup.length;
            if (len > 0) {
                forEach(elementGroup, item => {
                    addClass(item, this.classNames.errorField);
                    removeClass(item, this.classNames.validField);
                });
                element = elementGroup[len - 1];
            }
        }

        // Get element id or name
        const id = element.id || element.name;
        if (!id) {
            throw "[formvalidate.js] Fields need an ID or a name for form validation to work.";
        }

        // Check if error message element already exists
        // If not, create one
        let message = this.dom.form.querySelector(`.${this.classNames.message}#${this.classNames.messageId}${id}`);
        if (!message) {
            message = createElement("div", {
                className: this.classNames.message,
                id: `${this.classNames.messageId}${id}`
            });

            if (element.dataset.errorContainer) {

                // If an element is specified as container for the error message, use this
                const errorContainer = element.form.querySelector(element.dataset.errorContainer);
                errorContainer.innerHTML = "";
                errorContainer.appendChild(message);

            } else {

                // If the element is a radio button or checkbox, insert error after the label
                let label;
                if (element.type === "radio" || element.type === "checkbox") {
                    label = element.form.querySelector(`label[for="${id}"]`) || element.parentNode;
                    if (label) {
                        label.parentNode.insertBefore(message, label.nextSibling);
                    }
                }

                // Otherwise, insert it after the element
                if (!label) {
                    element.parentNode.insertBefore(message, element.nextSibling);
                }

            }
        }

        // Save original ARIA role, if it exists
        if (element.hasAttribute("aria-describedby")) {
            element.setAttribute("data-original-aria-describedby", element.getAttribute("aria-describedby"));
        }

        // Add ARIA role to the element
        element.setAttribute("aria-describedby", `${this.classNames.messageId}${id}`);

        // Update error message
        message.innerHTML = errorMessage;

        // Show error message
        message.style.display = "block";
        message.style.visibility = "visible";

        // Since the element has an error, we attach an keyup event to guide the user with positive inline validation
        // But first check if the element already has an event handler
        if (this.alreadyHasKeyupEvent !== element.name) {
            addEvent(elementGroup ? elementGroup : element, "keyup", e => this.inlineValidation(e));

            // save reference to element name to clean up events later
            this.alreadyHasKeyupEvent = element.name;
        }
    }


    /**
     * Hide an error message
     *
     * @private
     * @param {HTMLElement} field
     */
    hideError(field) {
        let element = field;
        // Don't validate submits, buttons and reset inputs, and disabled fields
        if (element.disabled || element.type === "reset" || element.type === "submit" || element.type === "button") {
            return false;
        }

        // Remove error class from element
        removeClass(element, this.classNames.errorField);
        addClass(element, this.classNames.validField);

        // Remove ARIA role from the element
        element.removeAttribute("aria-describedby");

        // Reset ARIA role to original value if it exists
        if (element.hasAttribute("data-original-aria-describedby")) {
            element.setAttribute("aria-describedby", element.getAttribute("data-original-aria-describedby"));
            element.removeAttribute("data-original-aria-describedby");
        }

        // If the element is a radio button and part of a group, remove error from all and get the last item in the group
        if (element.type === "radio" && element.name) {
            const group = this.dom.form.querySelectorAll(`input[name=${element.name}]`);
            const len = group.length;

            if (len > 0) {
                forEach(group, item => {

                    // Only check elements in current form
                    if (item.form === element.form) {
                        removeClass(item, this.classNames.errorField);
                        addClass(item, this.classNames.validField);
                    }

                });

                element = group[len - 1];
            }
        }

        // Get element id or name
        const id = element.id || element.name;
        if (!id) {
            return;
        }

        // Check if an error message is in the DOM
        const message = this.dom.form.querySelector(`.${this.classNames.message}#${this.classNames.messageId}${id}`);
        if (!message) {
            return;
        }

        // If so, hide it
        message.innerHTML = "";
        message.style.display = "none";
        message.style.visibility = "hidden";
    }


    /**
     * Initiate FormValidate
     *
     * @private
     * @param {HTMLFormElement|Node} formElement - The form element to validate
     * @param {FormValidateOptionsObject} [options={}] - Optional options object
     */
    init(formElement, options = {}) {

        // Make sure that ValidityState is supported in IE11 and Edge: https://quirksmode.org/dom/forms/index.html#link2
        const dummyInput = createElement("input");
        if (!("validity" in dummyInput && "badInput" in dummyInput.validity && "patternMismatch" in dummyInput.validity && "tooLong" in dummyInput.validity && "tooShort" in dummyInput.validity && "valueMissing" in dummyInput.validity)) {
            // If no support then polyfill
            this.polyfillValidityState(dummyInput);
        }

        // Cache the form element in the global dom object
        this.dom.form = formElement;

        // Disable native form validation
        this.dom.form.setAttribute("novalidate", true);

        // Set pattern on e-mail fields that are missing it
        forEach(this.dom.form.querySelectorAll("input[type=email]:not([pattern])"), emailField => {
            emailField.setAttribute("pattern", "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$");
        });

        // Check validity when the user leaves the field
        addEvent(this.dom.form, `change blur ${this.validationTrigger}`, event => {

            if (event.relatedTarget && event.relatedTarget.type === "submit") {
                // Ignore blur events caused by clicking a submit button
                return;
            }

            // Validate the field
            const error = this.hasError(event.target);

            if (error) {
                this.showError(event.target, error);
                return;
            }

            // Otherwise, hide any existing error message
            this.hideError(event.target);

        }, true);


        addEvent(this.dom.form, "submit", event => {

            // Lets not submit the form
            // We will control this from the outside with the callback function (onSubmit)
            event.preventDefault();

            // Get all of the form elements (except buttons)
            // Find elements on every submit since they might change dynamically
            const fields = this.dom.form.querySelectorAll(this.elementsToValidate);

            // Validate each field
            // Store the first field with an error to a variable so we can bring it into focus later
            let error, hasErrors;
            forEach(fields, field => {
                error = this.hasError(field);
                if (error) {
                    this.showError(field, error);
                    if (!hasErrors) {
                        hasErrors = field;
                    }
                }
            });

            // If there are errors, don't submit form and focus on first element with error
            // Else fire callback with all the fields
            if (hasErrors) {

                if (hasErrors.offsetWidth > 0 || hasErrors.offsetHeight > 0) {

                    // Element is visible - focus on it
                    hasErrors.focus();

                } else {

                    // Element is not visible
                    // If it has specified an error container (data-error-container="...")
                    // find that and scroll to it - otherwise scroll to a parent element.

                    let scrollToError = false;
                    if (hasErrors.dataset.errorContainer) {
                        const errorContainer = this.dom.form.querySelector(hasErrors.dataset.errorContainer);
                        if (errorContainer) {
                            scrollToError = true;
                            void scrollTo(errorContainer, 0, window, -30);
                        }
                    }

                    if (!scrollToError) {
                        let searchingForVisibleParent = hasErrors.parentElement;

                        while (searchingForVisibleParent) {
                            if (searchingForVisibleParent.offsetWidth > 0 || searchingForVisibleParent.offsetHeight > 0) {
                                void scrollTo(searchingForVisibleParent, 0, window, -30);
                                searchingForVisibleParent = false;
                            } else {
                                searchingForVisibleParent = searchingForVisibleParent.parentElement;
                            }
                        }
                    }
                }

            } else {
                if (typeof options.onSubmit === "function") {
                    options.onSubmit(fields);
                }
            }

        });
    }


    /**
     * Remove event listeners and clean up.
     * Use this when dynamically removing the form.
     */
    destroy() {
        removeEvent(this.dom.form, `submit change blur ${this.validationTrigger}`);

        forEach(this.dom.form.querySelectorAll(this.elementsToValidate), field => removeEvent(field, "keyup"));

        this.dom = null;
    }
}


export default FormValidate;
