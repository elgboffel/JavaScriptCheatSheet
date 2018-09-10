/**
 * Make a UL list from an object
 * @param {Object} obj - Object to iterate through
 */
module.exports = function makeNavList(obj) {
    const keys = Object.keys(obj);
    let markup = '';

    keys.sort((a, b) => {
        const aKey = a.toLocaleLowerCase();
        const bKey = b.toLocaleLowerCase();
        return aKey === '_' ? 1 : aKey > bKey ? 1 : aKey < bKey ? -1 : 0;
    });

    keys.forEach(key => {
        if (key === "_") {
            obj[key].forEach(member => {
                markup += `<li class="navigation__item">${member}</li>`;
            });
        } else {
            const id = `nav-list-${key.replace(/[^\w\s!?]/g,'')}-${
                Math
                    .random()
                    .toString(36)
                    .substr(2, 9)
            }`;

            markup += `
                <li class="navigation__folder">
                    <input id="${id}" type="checkbox" autocomplete="off">
                    <label for="${id}">${key}</label>
                    ${makeNavList(obj[key])}
                </li>
            `;
        }
    });

    return `<ul>${markup}</ul>`;
};
