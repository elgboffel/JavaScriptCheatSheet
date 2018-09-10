import Prism from 'prismjs';
import initializeSearch from './modules/search';

document.querySelectorAll('.prettyprint.source').forEach(element => {
    Prism.highlightElement(element);
});

window.addEventListener('message', event => {
    if (typeof event.data.searchData !== 'undefined') {
        initializeSearch(event.data.searchData);
    }
});
