import onReady from '../utils/events/onReady';
import { addEvent } from '../utils/events/events';

class MobileNavigation {


    constructor(container) {
        onReady(() => this.init(container));
    }

    init(container) {

        this.dom = {
            container,
            checkboxTrigger: container.querySelector("input[type=checkbox]"),
            backBtnTrigger: container.querySelector(".sitenav__item--back > label")
        };

        addEvent(this.dom.checkboxTrigger, "keypress", (e, element) => {
            if (e.which === 13 || e.which === 32) {
                element.click();
            }
        });

        addEvent(this.dom.backBtnTrigger, "keypress", (e, element) => {
            if (e.which === 13 || e.which === 32) {
                element.click();
            }
        });
    }

}


export default MobileNavigation;
