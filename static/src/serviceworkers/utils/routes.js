import forEach from "./forEach";


/**
 * Patterns to whitelist and ignore.
 *
 * @type {{whitelist: Map, ignore: RegExp[]}}
 */
const patterns = {
    whitelist: new Map(),
    ignore: []
};


/**
 * Max amount of cached items.
 *
 * @type {number}
 */
let maxCachedFetches = 30;


/**
 * Set max amount of cached items from fetch.
 *
 * @param {number} amount
 */
export function setMaxCachedFetches(amount) {

    maxCachedFetches = amount;

}


/**
 * Get max amount of cached items from fetch.
 *
 * @returns {number}
 */
export function getMaxCachedFetches() {

    return maxCachedFetches;

}


/**
 * When fetching data in the browser, the Service Worker functions as a proxy.
 * All requests to the browser goes through the SW first.
 * Here you can add patterns to listen for and cache.
 *
 * @param {RegExp|RegExp[]} newPatterns - One or more RegExp patterns to match
 * @param {Object} settings - Object with settings
 * @param {boolean} [settings.eventuallyFresh=false] - After returning a cached item, update cache from network
 * @param {number|Date} [settings.expirationDate] - Don't cache the item after this date (can be a timestamp or a Date object)
 * @param {boolean} [settings.hardCache=false] - Save item in a cache that doesn't update when the Service Worker is updated
 * @param {number} [settings.maxAge] - Max age in milliseconds. If cached item is older, then update it
 * @param {boolean} [settings.noCors=false] - Use only when caching external items that don't support CORS (or when you're on localhost)
 * @param {'cacheFirst'|'cacheNetworkRace'|'cacheOnly'|'networkFirst'|'networkOnly'} settings.strategy - Cache strategy
 */
export function addRoute(newPatterns, settings) {

    forEach(newPatterns, newPattern => {
        patterns.whitelist.set(newPattern, settings);
    });

}


/**
 * Remove patterns from router.
 *
 * @param {RegExp|RegExp[]} removePatterns - One or more RegExp patterns to remove
 */
export function removeRoute(removePatterns) {

    forEach(removePatterns, removePattern => {
        if (patterns.whitelist.has(removePattern)) {
            patterns.whitelist.delete(removePattern);
        }
    });

}


/**
 * Add RegExp patterns to an "ignore list".
 * URLs matching any pattern in the ignore list won't be cached by the router.
 *
 * @param {RegExp|RegExp[]} newPatterns - One or more RegExp patterns to blacklist
 */
export function ignoreRoutes(newPatterns) {

    patterns.ignore = patterns.ignore.concat(newPatterns);

}


/**
 * Remove patterns from the ignore list.
 *
 * @param {string|string[]} removePatterns - One or more RegExp patterns to remove
 */
export function removeIgnoredRoutes(removePatterns) {

    forEach(removePatterns, removePattern => {
        const removePatternIndex = patterns.ignore.indexOf(removePattern);

        if (removePatternIndex > -1) {
            patterns.ignore.splice(removePatternIndex, 1);
        }
    });

}


/**
 * Check if an URL matches any of the RegExp patterns.
 *
 * @param {string} url - URL to match against the ignore list and route patterns
 * @returns {null|Object} - Returns an object with settings (strategy and what not) or null if nothing was found
 */
export function matchPattern(url) {

    if (patterns.ignore.length) {

        // Check ignore list for match

        let ignoreHasMatch = false;
        forEach(patterns.ignore, pattern => {
            if (url.match(new RegExp(pattern))) {
                ignoreHasMatch = true;
            }
        });

        if (ignoreHasMatch) {
            return null;
        }
    }


    if (patterns.whitelist.size) {

        // Check whitelist for match

        let matchFound = null;
        patterns.whitelist.forEach((settings, pattern) => {
            if (!matchFound && url.match(pattern)) {
                matchFound = settings;
            }
        });

        if (matchFound) {
            return matchFound;
        }
    }


    return null;

}
