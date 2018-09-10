

/**
 * Map with patterns to redirect to another URL.
 *
 * @type {Map}
 */
const redirects = new Map();


/**
 * Redirect URLs matching a RegExp pattern to another destination.
 *
 * @param {RegExp} newPattern - RegExp with pattern to match
 * @param {string} destination - URL to redirect to
 */
export function redirect(newPattern, destination) {

    redirects.set(newPattern, new URL(destination, self.location.origin));

}


/**
 * Check if an URL matches any of the RegExp patterns.
 *
 * @param {string} url - URL to match against RegExp patterns
 * @returns {null|Object} - Returns an object with settings (strategy and what not) or null if nothing was found
 */
export function matchRedirect(url) {

    let matchFound = null;

    if (redirects.size) {

        // Check redirects for match

        redirects.forEach((urlToRedirectTo, pattern) => {
            if (!matchFound && url.match(pattern)) {
                matchFound = urlToRedirectTo;
            }
        });

    }

    return matchFound;

}
