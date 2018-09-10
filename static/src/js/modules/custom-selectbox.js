/**
    Author's name: Casper Andersen <can@dis-play.dk>
    Modified and refactored by: Casper Andersen <can@dis-play.dk>
    Date of creation: 18/10-2017

    Custom selectbox:
    The custom-selectbox is not depend on any other dom elements then form element <select>

    import customSelectbox from './modules/custom-selectbox';
    bootstrapper({
        'custom-selectbox': customSelectbox
    });

    Data-attributes:
        data-module - To initialize custom-selectbox with bootstrapper
            <select data-module="custom-selectbox">

        data-uniqueid - Set your own unique id, instead of using the config.uniqueID from the module
            <select data-uniqueid="myownid">

        data-classprefix - Set your own classprefix for using your own classprefixer for custom-selectbox
            <select data-classprefixer="myown-classprefixer">

        data-nativeoff - Set to true if you wont the customized selectbox instead of native selectbox on mobile devices
            <select data-nativeoff="true">


    To see more feature for the custom-selectbox look in the html file.
 */

import onReady from "../utils/events/onReady";
import {
    add as addClass,
    remove as removeClass,
    toggle as toggleClass
} from "../utils/dom/classList";
import { addEvent, removeEvent, delegateEvent } from "../utils/events/events";
import triggerEvent from "../utils/events/triggerCustomEvent";
import forEach from "../utils/forEach";
import createElement from "../utils/dom/createElement";
import { onClickOutside } from "../utils/events/onClickOutside";
import TabDomElements from "../utils/dom/tabDomElements";
import {
    setAria,
    ariaEnable,
    ariaDisable,
    tabbingEnable,
    tabbingDisable
} from "../utils/dom/accessibility";
import isMobile from '../utils/isMobile';

/**
 * Custom selectbox class
 *
 * @param {HTMLElement} container
 * @constructor
 */
class CustomSelectbox {
    /**
     * The constructor is fired once the class is instantiated.
     *
     * @param {HTMLElement} container
     */
    constructor(container) {
        // Run initializing code once the DOM is ready.
        onReady(() => this.init(container));
    }

    /**
     * Class names - add classnames to this.classNames
     */
    classNames() {
        this.classNames = {
            selectboxInput: this.config.classPrefix,
            isMobileTouch: `${this.config.classPrefix}--ismobiletouch`,
            wrap: `${this.config.classPrefix}__wrap`,
            label: `${this.config.classPrefix}__label`,
            selectboxOpen: "open",
            selectboxOpenOnTop: "open-ontop",
            hasMaxHeight: "has-maxheight",

            scrollbar: `${this.config.classPrefix}__scrollbar`,
            scroller: `${this.config.classPrefix}__scrollbar__scroller`,

            optionsWrap: `${this.config.classPrefix}__options-wrap`,
            options: `${this.config.classPrefix}__options`,

            optgroup: `${this.config.classPrefix}__optgroup`,
            optgroupLabel: `${this.config.classPrefix}__optgroup-label`,
            optgroupList: `${this.config.classPrefix}__optgroup-list`,

            option: `${this.config.classPrefix}__option`,
            optionSelected: `${this.config.classPrefix}__option--selected`,
            optionDisabled: `${this.config.classPrefix}__option--disabled`,
            optionHidden: `${this.config.classPrefix}__option--hidden`,
            optionSubText: `${this.config.classPrefix}__option__subtext`
        };
    }

    getDomProps() {
        this.domProps = {
            uniqueID: this.dom.selectboxInput.dataset.uniqueid,
            classPrefix: this.dom.selectboxInput.dataset.classprefix,
            extraClass: this.dom.selectboxInput.dataset.extraclass,
            multiple: this.dom.selectboxInput.hasAttribute("multiple"),
            nativeOff: this.dom.selectboxInput.dataset.nativeoff === "true",
            maxHeight: parseInt(this.dom.selectboxInput.dataset.maxheight),
            updateLabel: !this.dom.selectboxInput.dataset.updatelabel
        };
    }

    /**
     * Check if selectbox should run native or customized
     * @return {Boolean}
     */
    useNative() {
        return this.props.isMobile && !this.domProps.nativeOff;
    }

    /**
     * Keyboard arrow up
     */
    onKeyUp() {
        // useNative return;
        if (this.useNative()) {
            return;
        }

        if (this.dom.label === document.activeElement && !this.props.isopen) {
            this.openSelectbox();
        } else if (this.props.isopen) {
            const prevElement = this.tabDOM.getPrevTabElement();
            if (prevElement !== undefined) {
                prevElement.focus();
            } else {
                this.tabDOM.getLastTabElement().focus();
            }
        }
    }

    /**
     * Keyborad arrow down
     */
    onKeyDown() {
        // useNative return;
        if (this.useNative()) {
            return;
        }

        if (this.dom.label === document.activeElement && !this.props.isopen) {
            this.openSelectbox();
        } else if (this.props.isopen) {
            const nextElement = this.tabDOM.getNextTabElement();
            if (nextElement !== undefined) {
                nextElement.focus();
            } else {
                this.tabDOM.getFirstTabElement().focus();
            }
        }
    }

    /**
     *  Jump key - like a-z and 0-9
     * @param {String} Letter, number or sign to jump to.
     */
    jumpToKey(key) {
        if (key.length === 1) {
            // Index of current active element in custom-selectbox
            const currentActiveElement = this.tabDOM.getCurrentActiveElementIndex();

            // Find key that is after currentActive element index in letter array
            let letterIndex = this.firstLetterArray.findIndex(
                (e, i) => e === key && i > currentActiveElement
            );
            // Find key that is before currentActive element index in letter array
            if (letterIndex === -1) {
                letterIndex = this.firstLetterArray.findIndex(
                    (e, i) => e === key && i < currentActiveElement
                );
            }
            // Find key that is same currentActive element index in letter array
            if (letterIndex === -1 && currentActiveElement > -1) {
                letterIndex = currentActiveElement;
            }

            // Jump to letter index
            if (letterIndex === -1) {
                this.tabDOM.getFirstTabElement().focus(); // In key is not in letter array - Jump to first button
            } else {
                this.tabDOM.getTabElementByIndex(letterIndex).focus(); // Else jump to index
            }
        }
    }

    /**
     * On keydown event
     */
    onKeyDownEvents() {
        addEvent(this.dom.wrapper, "keydown", e => {
            const keyCode = e.keyCode;

            if (keyCode === 40) {
                // Down
                e.preventDefault();
                this.onKeyDown();
            } else if (keyCode === 38) {
                // Up
                e.preventDefault();
                this.onKeyUp();
            } else if (keyCode === 27) {
                // Esc
                this.closeSelectbox();
                this.dom.label.focus();
            } else {
                if (this.props.isopen) {
                    this.jumpToKey(e.key);
                }
            }
        });
    }

    /**
     * Handling keyevent
     */
    bindKeyEvents() {
        // Bind key event
        this.onKeyDownEvents();
    }

    /**
     * Override propety value for native selectbox for return array with value of multiple values.
     */
    overrideValueProperty() {
        Object.defineProperty(this.dom.selectboxInput, "value", {
            get: () => {
                if (this.domProps.multiple) {
                    const values = [];

                    forEach(this.dom.selectboxInputOptions, option => {
                        if (option.selected) {
                            values.push(option.getAttribute("value"));
                        }
                    });

                    if (values.length) {
                        return values;
                    } else {
                        return "";
                    }
                }

                const selectedOption = this.dom.selectboxInput.querySelector(
                    "option:checked"
                );
                if (selectedOption !== null) {
                    return selectedOption.getAttribute("value");
                }
                return "";
            },
            set: val => {
                if (this.value !== val) {
                    if (this.domProps.multiple) {
                        forEach(
                            this.dom.selectboxInputOptions,
                            option =>
                                (option.selected =
                                    option.getAttribute("value") !==
                                        undefined &&
                                    val.indexOf(
                                        option.getAttribute("value")
                                    ) !== -1)
                        );
                        this.updateCustomSelectboxOptions();
                    } else {
                        if (val === "" || val === null) {
                            this.dom.selectboxInputOptions[0].selected = true;
                            this.updateCustomSelectboxOptions();
                        } else {
                            const selectedOption = this.dom.selectboxInput.querySelector(
                                `option[value="${val}"]`
                            );
                            if (selectedOption !== null) {
                                selectedOption.selected = true;
                                this.updateCustomSelectboxOptions();
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     *  Override boolean propety like disabled or hidden for native selectbox for set disabled on options to true/false.
     * @param {String} property - Property to override
     * @param {HTMLElement} dom - HTMLElement to override property on
     */
    overrideBooleanProperty(property, dom) {
        Object.defineProperty(dom, property, {
            get: () => dom.getAttribute(property) !== null,
            set: val => {
                if (val) {
                    dom.setAttribute(property, property);
                } else {
                    dom.removeAttribute(property);
                }

                if (dom.tagName === "OPTGROUP") {
                    this.updateCustomSelectboxOptgroup();
                } else {
                    this.updateCustomSelectboxOptions();
                }
            },
            configurable: true
        });
    }

    /**
     * Set max-height if data-maxheight filled
     */
    maxHeightScrollbar() {
        // Max height
        //console.log(this.domProps.maxHeight, !isNaN(this.domProps.maxHeight), this.dom.optionsList.clientHeight > this.domProps.maxHeight);

        if (
            this.domProps.maxHeight &&
            !isNaN(this.domProps.maxHeight) &&
            this.dom.optionsList.clientHeight > this.domProps.maxHeight
        ) {
            const scrollDiff =
                    this.dom.optionsList.clientHeight - this.domProps.maxHeight,
                scrollbarHeight = scrollDiff / this.domProps.maxHeight * 100;

            // Build scrollbar
            const scrollbar = createElement("span", {
                    className: this.classNames.scrollbar
                }),
                scroller = createElement("span", {
                    className: this.classNames.scroller
                });

            scrollbar.appendChild(scroller);
            this.dom.optionsListWrap.appendChild(scrollbar);

            // Set height of scrollbar scroller
            scroller.style.height = `${scrollbarHeight}%`;

            // Set maxheight om optionslist
            this.dom.optionsList.style.maxHeight = `${
                this.domProps.maxHeight
            }px`;
            addClass(this.dom.optionsListWrap, this.classNames.hasMaxHeight);

            // Add scroll event run handle scroller
            addEvent(this.dom.optionsList, "scroll", e => {
                scroller.style.top = `${e.currentTarget.scrollTop /
                    scrollDiff *
                    (100 - scrollbarHeight)}%`;
            });
        }
    }

    /**
     * Close selectbox
     */
    closeSelectbox() {
        removeClass(this.dom.optionsListWrap, this.classNames.selectboxOpen);

        this.props.isopen = false;

        // Remove open-ontop class
        removeClass(
            this.dom.optionsListWrap,
            this.classNames.selectboxOpenOnTop
        );

        // Accessibility aria tags
        ariaDisable(this.dom.label, "expanded");
        ariaEnable(this.dom.optionsListWrap, "hidden");

        // Tabbing disabled
        tabbingDisable(this.dom.optionsListWrap);
    }

    /**
     * Open selectbox
     */
    openSelectbox() {
        // Return if has no options
        if (!this.dom.selectboxInput.length) {
            return false;
        }

        // Calc if optionslist should open on top of label, instead of normal underneath
        const optionslistHeight = this.dom.optionsList.clientHeight,
            offsetToTop = this.dom.wrapper.offsetTop - window.scrollY,
            offsetToBottom =
                window.innerHeight -
                (offsetToTop + this.dom.wrapper.clientHeight);

        // Add class open-ontop if space between window bottom and selectbox is smaller then optionslist height
        if (
            offsetToBottom < optionslistHeight &&
            offsetToTop > offsetToBottom
        ) {
            addClass(
                this.dom.optionsListWrap,
                this.classNames.selectboxOpenOnTop
            );
        }

        // Add opener class
        addClass(this.dom.optionsListWrap, this.classNames.selectboxOpen);

        //Close selectbox when clickoutside
        onClickOutside(this.dom.wrapper, () => {
            this.closeSelectbox();
        });

        this.props.isopen = true;

        // Accessibility aria tags
        ariaEnable(this.dom.label, "expanded");
        ariaDisable(this.dom.optionsListWrap, "hidden");
        // Tabbing enabled
        tabbingEnable(this.dom.optionsListWrap);
    }

    /**
     * Open / close selectbox
     */
    toggleSelectbox(e) {
        e.preventDefault();

        if (this.props.isopen) {
            this.closeSelectbox();
        } else {
            this.openSelectbox();
        }
    }

    /**
     * Set label text for selected options or default text.
     */
    updateLabelText() {
        let labelText = "";

        for (const index in this.selectedOptions) {
            if (this.selectedOptions.hasOwnProperty(index)) {
                labelText += `${this.selectedOptions[index].text}, `;
            }
        }
        labelText = labelText.substr(0, labelText.length - 2);

        // If no options selected, set label text to first option text
        if (labelText === "") {
            // Set label text
            labelText = this.dom.selectboxInputOptions[0].innerText;

            // Update title attribute
            this.dom.label.setAttribute("title", labelText);
        }

        // Update label text
        this.dom.label.innerText = labelText;
    }

    /**
     * Update custom selectbox optgroup
     */
    updateCustomSelectboxOptgroup() {
        forEach(this.dom.selectboxInputOptgroup, (optgroup, index) => {
            // If hidden native
            const optionsListItem = this.dom.optionsList.querySelectorAll(
                    "li.custom-selectbox__optgroup"
                )[index],
                disabled = optgroup.disabled,
                hidden = optgroup.hidden;

            // Togggle disabled class
            toggleClass(
                optionsListItem,
                this.classNames.optionDisabled,
                disabled
            );

            // Toggle hidden class
            toggleClass(optionsListItem, this.classNames.optionHidden, hidden);

            const optgroupOptions = this.dom.selectboxInputOptgroup[index]
                .children;

            // Optgroup options to not selected
            forEach(optgroupOptions, option => {
                option.selected = false;
            });

            // Update all custom selectbox options
            this.updateCustomSelectboxOptions();
        });
    }

    /**
     * Update all custom selectbox options
     */
    updateCustomSelectboxOptions() {
        // Reset selected options obj
        this.selectedOptions = {};

        // Disabled or hidden
        const disabledOrHidden = [];

        // Store firstletter and index for use of jumpto keydown functionality
        this.firstLetterArray = [""]; // First index is button

        forEach(this.dom.selectboxInputOptions, (option, index) => {
            const value = option.getAttribute("value"),
                selected = option.selected && value;

            // Add selected item to this.selectedOptions obj
            if (selected) {
                this.selectedOptions[index] = {
                    text: option.innerText,
                    value
                };
            }

            // Get option by index
            const optionsListItem = this.dom.optionsList.querySelectorAll(
                "li > a"
            )[index];

            // Disabled / hidden
            const disabled = option.disabled,
                hidden = option.hidden;

            // Multiple select
            if (this.domProps.multiple) {
                toggleClass(
                    optionsListItem,
                    this.classNames.optionSelected,
                    selected
                );
            }

            // Togggle disabled class
            toggleClass(
                optionsListItem,
                this.classNames.optionDisabled,
                disabled
            );

            // Toggle hidden class
            toggleClass(optionsListItem, this.classNames.optionHidden, hidden);

            // Exclude from TabDOM is disabled or hidden
            if (disabled || hidden) {
                disabledOrHidden.push(optionsListItem);
            }

            // Add first letter to array
            if (!disabled && !hidden) {
                this.firstLetterArray.push(
                    option.innerText.charAt(0).toLowerCase()
                );
            }
        });

        // Add native selectbox to exclude from TabDOM array
        disabledOrHidden.push(this.dom.selectboxInput);

        // Update label text
        if (
            this.dom.selectboxInputOptions.length > 0 &&
            this.domProps.updateLabel
        ) {
            this.updateLabelText();
        }

        // Init tabbing dom
        delete this.tabDOM;
        this.tabDOM = new TabDomElements(this.dom.wrapper, disabledOrHidden);

        // Max-height
        this.maxHeightScrollbar();
    }

    /**
     * Select option from optionsList
     * @param {Obejct} e
     */
    selectOption(e) {
        e.event.preventDefault();

        const indexOfSelected = Array.prototype.slice
                .call(
                    this.dom.optionsList.querySelectorAll(
                        `li:not(.${this.classNames.optgroup})`
                    )
                )
                .indexOf(e.target.parentNode),
            selectedOption = this.dom.selectboxInputOptions[indexOfSelected];

        if (
            selectedOption.disabled ||
            (selectedOption.parentNode.tagName === "OPTGROUP" &&
                selectedOption.parentNode.disabled)
        ) {
            return;
        }

        if (this.domProps.multiple) {
            // If option has value
            if (selectedOption.getAttribute("value") && indexOfSelected) {
                selectedOption.selected = !selectedOption.selected;
            } else {
                // Clear all selected options
                this.dom.selectboxInput.value = "";

                // Focus on label
                this.dom.label.focus();

                // Close selectbox
                this.closeSelectbox();
            }
        } else {
            selectedOption.selected = true;

            // Focus on label
            this.dom.label.focus();

            // Close selectbox
            this.closeSelectbox();
        }

        triggerEvent(this.dom.selectboxInput, "change");
    }

    /**
     * Add all events to selectbox
     */
    addEvents() {
        // Bind click for label
        addEvent(this.dom.label, "click", this.toggleSelectbox.bind(this));

        // Select option / options
        delegateEvent(
            `a.${this.classNames.option}`,
            "click",
            this.selectOption.bind(this),
            this.dom.wrapper
        );

        // OnChangeEvent - update selected options
        addEvent(
            this.dom.selectboxInput,
            "change",
            this.updateCustomSelectboxOptions.bind(this)
        );
    }

    /**
     * Re-collect options and build optionslist again
     */
    update() {
        // Empty options obj
        this.dom.selectboxInputOptions = [];

        // Remove old dom
        this.dom.wrapper.removeChild(this.dom.optionsListWrap);

        // Building options list if has options
        if (this.dom.selectboxInput.length) {
            this.buildOptionsList();
        }

        // Update domProps
        this.getDomProps();
    }

    /**
     * Setting props for selectbox depend on useNative or not
     */
    setPropsForSelectboxInput() {
        if (this.useNative()) {
            // Mobile touch devices uses native
            addClass(this.dom.selectboxInput, this.classNames.isMobileTouch);
        } else {
            // Tabindex -1 for disable tabbing on desktop
            this.dom.selectboxInput.setAttribute("tabindex", "-1");
        }
    }

    /**
     * Bind new optgroup properties like disabled, hidden
     * @param {HTMLOptGroupElement} optgroup
     */
    bindOverrideOptgroupProperty(optgroup) {
        // Override disabled propery
        this.overrideBooleanProperty("disabled", optgroup);

        // Override hidden propery
        this.overrideBooleanProperty("hidden", optgroup);
    }

    /**
     * Bind new options properties like disabled, hidden
     * @param {HTMLElement} option
     */
    bindOverrideOptionsProperty(option) {
        // Override disabled propery
        this.overrideBooleanProperty("disabled", option);

        // Override hidden propery
        this.overrideBooleanProperty("hidden", option);
    }

    /**
     * Build html structure for wrapper around selectbox
     */
    buildWrapper() {
        const select = this.dom.selectboxInput;

        // Wrapper element
        const wrap = createElement("div", {
            className: this.classNames.wrap
        });

        if (this.domProps.extraClass) {
            addClass(wrap, this.domProps.extraClass);
        }

        // Insert wrapper element before select
        select.parentNode.insertBefore(wrap, select);

        // Move select and label into wrapper
        wrap.appendChild(select);

        // Add label to dom refereces
        this.dom.wrapper = wrap;
    }

    /**
     * Build html structure for button label what trigger option list.
     */
    buildLabel() {
        // Add Button label for
        const label = createElement("button", {
            // Set label class
            className: this.classNames.label,
            // Set label text - Used the first option text
            text: this.dom.selectboxInput[0]
                ? this.dom.selectboxInput[0].innerText
                : "Has no options",
            // Add type button
            attributes: { type: "button" }
        });

        // Set aria tags
        setAria(label, "controls", this.config.uniqueID);
        ariaDisable(label, "expanded");

        // Append to wrapper
        this.dom.wrapper.appendChild(label);

        // Add trigger label to dom refereces
        this.dom.label = label;
    }

    /**
     * Build markup for optgroup
     * @param {HTMLOptGroupElement} optgroup
     * @param {String} optionsDOM
     * @return {String}
     */
    buildOptgroup(optgroup, optionsDOM) {
        // Override properties to option elements
        this.bindOverrideOptgroupProperty(optgroup);

        // Label Text
        const optgroupLabel = `<span class="${this.classNames.optgroupLabel}">${
            optgroup.label
        }</span>`;

        // Return li starts with optgroup label
        return `<li class="${this.classNames.optgroup}">${
            optgroup.label ? optgroupLabel : ""
        }<ul class="${this.classNames.optgroupList}">${optionsDOM}</ul>`;
    }

    /**
     * Build markup for option
     * @param {HTMLOptionElement} option
     * @return {String}
     */
    buildOption(option) {
        // Override properties to option elements
        this.bindOverrideOptionsProperty(option);

        // Option has subtext
        const dataSubText = option.dataset.subtext,
            subText =
                dataSubText !== undefined
                    ? `<span class="${
                        this.classNames.optionSubText
                    }">${dataSubText}</span>`
                    : "";

        return `<li><a href="#" class="${
            this.classNames.option
        }" tabindex="-1">${option.innerText}${subText}</a></li>`;
    }

    /**
     * Build markup for options list.
     */
    buildOptionsList() {
        // Create div options-wrap element
        const optionsListWrap = createElement("div", {
            className: this.classNames.optionsWrap,
            attributes: { id: this.config.uniqueID }
        });
        ariaEnable(optionsListWrap, "hidden");

        // Create div options-list element
        const optionsList = createElement("ul", {
            className: this.classNames.options
        });

        // Append div.options-wrap to wrapper element
        this.dom.optionsListWrap = this.dom.wrapper.appendChild(
            optionsListWrap
        );

        // Append ul.options-list to option-wrap element
        this.dom.optionsList = this.dom.optionsListWrap.appendChild(
            optionsList
        );

        // Build html string for optionsList.
        let optionsListItemsMarkup = "";

        // Get first level of options and optgroups
        const getFirstLevel = this.dom.selectboxInput.children;

        forEach(getFirstLevel, firstLevelDOM => {
            // If optgroup
            if (firstLevelDOM.tagName === "OPTGROUP") {
                this.dom.selectboxInputOptgroup.push(firstLevelDOM);

                // Get options from optgroup
                const secondLevel = firstLevelDOM.children;
                let secondLevelMarkup = "";

                forEach(secondLevel, secondLevelOption => {
                    // Add option to selectboxInputOptions dom obj
                    this.dom.selectboxInputOptions.push(secondLevelOption);
                    secondLevelMarkup += this.buildOption(secondLevelOption);
                });

                // Add optgroup with children options markup
                optionsListItemsMarkup += this.buildOptgroup(
                    firstLevelDOM,
                    secondLevelMarkup
                );
            } else {
                // Add option to selectboxInputOptions dom obj
                this.dom.selectboxInputOptions.push(firstLevelDOM);

                // Add option markup
                optionsListItemsMarkup += this.buildOption(firstLevelDOM);
            }
        });

        // Add builded markup to optionList dom
        this.dom.optionsList.innerHTML = optionsListItemsMarkup;

        // Update custom option state (selected)
        this.updateCustomSelectboxOptions();
    }

    /**
     * Building DOM for custom-selectbox
     */
    buildDOM() {
        // Building wrapper
        this.buildWrapper();

        // Build label
        this.buildLabel();

        // Building options list if has options
        if (this.dom.selectboxInput.length) {
            this.buildOptionsList();
        }
    }

    /**
     * Destroy all events for custom-selectbox
     */
    destroy() {
        removeEvent(this.dom.label, "click");
        removeEvent(this.dom.optionsList.querySelectorAll("a"), "click");
        removeEvent(this.dom.selectboxInput, "change");
        removeEvent(this.dom.wrapper, "keydown");
        removeEvent(this.dom.optionsList, "scroll");

        delete this.tabDOM;
    }

    /**
     * The actual initialization function, fired once the DOM is ready.
     *
     * @param {HTMLElement} container
     */
    init(container) {
        // Configurations for module
        this.config = {
            classPrefix: "custom-selectbox",
            uniqueID: `custom-selectbox_${Date.now()}`
        };

        // Dom elements
        this.dom = {
            // Exsisting dom
            selectboxInput: container,
            selectboxInputOptgroup: [], // Collects optgroup in buildOptionsList
            selectboxInputOptions: [], // Collects options in buildOptionsList

            // Builded dom
            wrapper: null,
            label: null,
            optionsListWrap: null,
            optionsList: null
        };

        // Selectbox properties
        this.props = {
            isopen: false,
            isMobile
        };

        // Selectbox dom properties
        this.domProps = {
            uniqueID: "",
            classPrefix: "",
            extraClass: "",
            multiple: "",
            nativeOff: "",
            maxHeight: "",
            updateLabel: ""
        };
        this.getDomProps();

        // Overwrite this.config.uniqueID, if uniqueID is set in data-uniqueid
        this.config.uniqueID = this.domProps.uniqueID || this.config.uniqueID;

        // Overwrite this.config.classPrefix, if data-classPrefix is set
        this.config.classPrefix =
            this.domProps.classPrefix || this.config.classPrefix;

        /*
        *   Selected option(s)
        *   { index: { text: "", value: "" } }
        */
        this.selectedOptions = {};

        // ClassNames list - Added to this.classNames object
        this.classNames();

        // Override the value property to enable set and get array
        this.overrideValueProperty();

        // Update optionslist dom. Ex after added, removed options/optgroups or changes domProps.
        this.dom.selectboxInput.update = this.update.bind(this);

        // Building DOM
        this.buildDOM();

        // Setup selectbox props
        this.setPropsForSelectboxInput();

        // Add events for label and options
        this.addEvents();

        // Binding keyevents on keydown
        if (!this.useNative()) {
            this.bindKeyEvents();
        }
    }
}

export default CustomSelectbox;
