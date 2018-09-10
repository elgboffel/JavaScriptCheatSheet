const navigationToggle = document.getElementById('navigation');
const searchToggle = document.getElementById('search');
const searchInput = document.querySelector('.search__input');
const searchResults = document.querySelector('.search__results');

// Close search when navigation opens
navigationToggle.addEventListener('change', () => {
    searchToggle.checked = false;
});

// Close navigation when search opens
searchToggle.addEventListener('change', () => {
    navigationToggle.checked = false;
    searchInput.focus();
});

// Close navigation when hash in URL changes
window.addEventListener('hashchange', () => {
    navigationToggle.checked = false;
});

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function strictSearchRegExp(query) {
    return new RegExp(`(^|(?![\\s'";:.,([/]))${escapeRegExp(query)}(?=$|[\\s'";:.,)\\]/])`, 'gi');
}

function looseSearchRegExp(query) {
    return new RegExp(`${escapeRegExp(query)}`, 'gi');
}

function findContext(match, haystack) {
    const contextStart = haystack.substring(Math.max(0, match.index - 20), match.index);
    const contextEnd = haystack.substr(match.index + match[0].length, 150);
    const contextStartSplit = contextStart.split(' ');

    if (contextStartSplit.length > 1 && match.index > 30) {
        contextStartSplit.shift();
    }

    return `${contextStartSplit.join(' ')}<strong class="red">${match[0]}</strong>${contextEnd}`;
}

function highlightSearchStringInTitle(match, title) {
    return `${title.substring(0, match.index)}<strong class="red">${match[0]}</strong>${title.substring(match.index + match[0].length)}`;
}

export default function initializeSearch(searchJSON) {
    let searchThrottle;

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            window.clearTimeout(searchThrottle);

            searchThrottle = setTimeout(() => {
                while (searchResults.hasChildNodes()) {
                    searchResults.removeChild(searchResults.lastChild);
                }

                if (searchInput.value.length > 2) {
                    const query = searchInput.value;
                    const results = {
                        a: [],
                        b: [],
                        c: [],
                        d: [],
                        e: []
                    };
                    let resultsCount = 0;

                    Object.keys(searchJSON).forEach(key => {
                        const title = searchJSON[key].title;
                        const subTitles = searchJSON[key].subTitles;
                        const body = searchJSON[key].body;
                        const fileName = searchJSON[key].id;

                        const strictRegExp = strictSearchRegExp(query);
                        const looseRegExp = looseSearchRegExp(query);

                        let makeLowPrioritySearches = true;

                        const subTitlesResults = {
                            a: [],
                            b: []
                        };

                        subTitles.forEach(subTitle => {
                            // Reset last index in regular expressions
                            strictRegExp.lastIndex = 0;
                            looseRegExp.lastIndex = 0;

                            const matchSubTitleA = strictRegExp.exec(subTitle.title);
                            const matchSubTitleB = looseRegExp.exec(subTitle.title);

                            if (matchSubTitleA) {
                                subTitlesResults.a.push({title, context: highlightSearchStringInTitle(matchSubTitleA, subTitle.title), fileName: `${fileName}#${subTitle.id}`});
                            } else if (matchSubTitleB) {
                                subTitlesResults.b.push({title, context: highlightSearchStringInTitle(matchSubTitleB, subTitle.title), fileName: `${fileName}#${subTitle.id}`});
                            }
                        });

                        const matchA = strictRegExp.exec(title); // Match exact string in title
                        const matchB = looseRegExp.exec(title); // Match part of string in title

                        if (matchA) {
                            results.a.push({title: highlightSearchStringInTitle(matchA, title), fileName});
                            resultsCount += 1;
                            makeLowPrioritySearches = false;
                        } else if (matchB) {
                            results.b.push({title: highlightSearchStringInTitle(matchB, title), fileName});
                            resultsCount += 1;
                            makeLowPrioritySearches = false;
                        }

                        if (subTitlesResults.a.length || subTitlesResults.b.length) {
                            const combinedSubTitleResults = subTitlesResults.a.concat(subTitlesResults.b);
                            combinedSubTitleResults.forEach(result => results.c.push(result));
                            resultsCount += combinedSubTitleResults.length;
                            makeLowPrioritySearches = false;
                        }

                        if (makeLowPrioritySearches) {
                            // Reset last index in regular expressions
                            strictRegExp.lastIndex = 0;
                            looseRegExp.lastIndex = 0;

                            const matchD = strictRegExp.exec(body); // Match exact string in body
                            const matchE = looseRegExp.exec(body); // Match part of string in body

                            if (matchD) {
                                results.d.push({title, fileName, context: findContext(matchD, body)});
                                resultsCount += 1;
                            } else if (matchE) {
                                results.e.push({title, fileName, context: findContext(matchE, body)});
                                resultsCount += 1;
                            }
                        }
                    });

                    if (resultsCount) {
                        Object.keys(results).forEach(priority => {
                            results[priority].forEach(result => {
                                const element = document.createElement('div');
                                element.className = 'search__result';
                                element.innerHTML = `<a href="${result.fileName}"><b class="search__result-title">${result.title}</b>${result.context ? `<span>${result.context}</span>` : ''}</a>`;
                                searchResults.appendChild(element);
                            });
                        });
                    } else {
                        const element = document.createElement('div');
                        element.className = 'search__result search__result--nothing';
                        element.innerHTML = 'No search results';
                        searchResults.appendChild(element);
                    }
                }
            }, 500);
        });
    }
}
