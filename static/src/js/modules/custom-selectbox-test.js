/**
    Author's name: Casper Andersen <can@dis-play.dk>
    Modified and refactored by: Casper Andersen <can@dis-play.dk>
    Date of creation: 18/10-2017

    Custom selectbox test script
 */

import { addEvent } from "../utils/events/events";
import forEach from "../utils/forEach";
import createElement from "../utils/dom/createElement";

// Set value
const setBtns = document.querySelectorAll(
    ".custom-selectbox-test .setvaluebtntest"
);
addEvent(setBtns, "click", e => {
    e.preventDefault();

    const setValueInput = document.querySelector(
        `.custom-selectbox-test .setvalueinputtest[data-selectboxid="${
            e.target.dataset.selectboxid
        }"]`
    );
    const selectbox = document.getElementById(e.target.dataset.selectboxid);
    selectbox.value =
        setValueInput.value.indexOf("new Array") !== -1
            ? eval(setValueInput.value)
            : setValueInput.value;
});

// Get value
const getBtns = document.querySelectorAll(
    ".custom-selectbox-test .getvaluebtntest"
);
addEvent(getBtns, "click", e => {
    e.preventDefault();

    const getValueInput = document.querySelector(
        `.custom-selectbox-test .getvalueinputtest[data-selectboxid="${
            e.target.dataset.selectboxid
        }"]`
    );
    const selectbox = document.getElementById(e.target.dataset.selectboxid);
    getValueInput.value = selectbox.value;
});

// Disable / Enable options
const disableOptions = document.querySelectorAll(
    ".custom-selectbox-test .disableoptionbtntest"
);
const enableOptions = document.querySelectorAll(
    ".custom-selectbox-test .enableoptionsbtntest"
);
addEvent(disableOptions, "click", e => {
    e.preventDefault();
    const selectbox = document.getElementById(e.target.dataset.selectboxid),
        options = e.target.dataset.options,
        optgroup = e.target.dataset.optgroup;

    if (options !== undefined) {
        forEach(options.split(","), value => {
            selectbox.querySelector(
                `option[value="${value}"]`
            ).disabled = true;
        });
    } else if (optgroup !== undefined) {
        forEach(optgroup.split(","), value => {
            selectbox.querySelector(
                `optgroup[label="${value}"]`
            ).disabled = true;
        });
    }
});
addEvent(enableOptions, "click", e => {
    e.preventDefault();
    const selectbox = document.getElementById(e.target.dataset.selectboxid),
        options = e.target.dataset.options,
        optgroup = e.target.dataset.optgroup;

    if (options !== undefined) {
        forEach(options.split(","), value => {
            selectbox.querySelector(
                `option[value="${value}"]`
            ).disabled = false;
        });
    } else if (optgroup !== undefined) {
        forEach(optgroup.split(","), value => {
            selectbox.querySelector(
                `optgroup[label="${value}"]`
            ).disabled = false;
        });
    }
});

// Hide / unhide options
const hideOptions = document.querySelectorAll(
    ".custom-selectbox-test .hideOptionsbtntest"
);
const unhideOptions = document.querySelectorAll(
    ".custom-selectbox-test .unhideOptionsbtntest"
);
addEvent(hideOptions, "click", e => {
    e.preventDefault();
    const selectbox = document.getElementById(e.target.dataset.selectboxid),
        options = e.target.dataset.options,
        optgroup = e.target.dataset.optgroup;

    if (options !== undefined) {
        forEach(options.split(","), value => {
            selectbox.querySelector(
                `option[value="${value}"]`
            ).hidden = true;
        });
    } else if (optgroup !== undefined) {
        forEach(optgroup.split(","), value => {
            selectbox.querySelector(
                `optgroup[label="${value}"]`
            ).hidden = true;
        });
    }
});
addEvent(unhideOptions, "click", e => {
    e.preventDefault();
    const selectbox = document.getElementById(e.target.dataset.selectboxid),
        options = e.target.dataset.options,
        optgroup = e.target.dataset.optgroup;

    if (options !== undefined) {
        forEach(options.split(","), value => {
            selectbox.querySelector(
                `option[value="${value}"]`
            ).hidden = false;
        });
    } else if (optgroup !== undefined) {
        forEach(optgroup.split(","), value => {
            selectbox.querySelector(
                `optgroup[label="${value}"]`
            ).hidden = false;
        });
    }
});

// Update optionslist dom for custom-selectbox
const updateOptionsListMarkup = document.querySelectorAll(
    ".custom-selectbox-test .updateoptionslistbtntest"
);
addEvent(updateOptionsListMarkup, "click", e => {
    e.preventDefault();
    const selectbox = document.getElementById(e.target.dataset.selectboxid),
        newValues = JSON.parse(e.target.dataset.options);

    forEach(newValues, obj => {
        const newoption = createElement("option", {
            text: obj.name,
            attributes: {
                value: obj.value
            }
        });

        selectbox.appendChild(newoption);
    });
    selectbox.update();
});
