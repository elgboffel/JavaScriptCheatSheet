import onReady from '../utils/events/onReady';
import { add as addClass, remove as removeClass } from '../utils/dom/classList';
import { addEvent } from '../utils/events/events';
import forEach from "../utils/forEach";

class Cookiepolicy {

    constructor(container) {
        onReady(() => this.init(container));
    }

    getCookie(name) {
        const nameLookup = `${name}=`;
        const ca = document.cookie.split(';');
        let returnValue = "";
        forEach(ca, c => {
            let usableC = c;
            while (usableC.charAt(0) === ' ') {
                usableC = usableC.substring(1);
            }
            if (usableC.indexOf(nameLookup) === 0) {
                returnValue = usableC.substring(nameLookup.length, usableC.length);
            }
        });

        return returnValue;
    }

    setCookie(name, value, exdays) {
        const d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        const expires = `expires=${d.toUTCString()}`;
        document.cookie = `${name}=${value}; ${expires}; path=/`;
    }

    /**
     * The actual initialization function, fired once the DOM is ready.
     *
     * @param {HTMLElement} container
     */
    init(container) {

        this.dom = {
            container,
            ok: container.querySelector("button.cookiepolicy__clear")
        };

        this.defaults = {
            cookieName: "cookiepolicy",
            exdays: 365
        };

        if (this.getCookie(this.defaults.cookieName) === "") {

            addClass(this.dom.container, "cookiepolicy--active");

            addEvent(this.dom.ok, "click", e => {
                e.preventDefault();

                this.setCookie(this.defaults.cookieName, "true", this.defaults.exdays);

                removeClass(this.dom.container, "cookiepolicy--active");
            });
        }

    }

}

export default Cookiepolicy;
