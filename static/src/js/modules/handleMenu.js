/**
 * Author's name: Peter Krogh - pkr
 * Client name: AKQA
 * Date of creation: 1-02-2018
 * HandleMenu:
 * This handleMenu is handling each offcanvas menu for modules and snippets in our modules branch
 */

import onReady from '../utils/events/onReady';
import forEach from '../utils/forEach';
import { addEvent } from '../utils/events/events';
import { toggle } from '../utils/dom/classList';

class HandleMenu {

    constructor(container) {
        // Run initializing code once the DOM is ready.
        onReady(() => this.init(container));
    }

    init(container) {

        this.dom = {
            container,
            toggleBtn: container.querySelectorAll(".toggle-btn")
        };

        // Add click event for each toggleBtn
        forEach(this.dom.toggleBtn, elem => {
            addEvent(elem, "click", e => {
                e.preventDefault();
                // Toggle offcanvas and label with a class for making an effect when active
                toggle(elem.previousElementSibling, "active");
                toggle(elem.nextElementSibling, "active");
            });
        });

    }

}
export default HandleMenu;
