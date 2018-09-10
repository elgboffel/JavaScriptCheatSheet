import { cacheObject } from './cacheControl';
import forEach from '../forEach';
import log from '../log';


/**
 * Clear URLs that have reached their expiration date.
 */
export function clearExpiredFiles() {

    caches.keys().then(keys => {
        forEach(keys, cacheName => {
            caches.open(cacheName).then(cache => {
                cache.keys().then(itemKeys => {
                    forEach(itemKeys, item => {

                        if (cacheName in cacheObject && item.url in cacheObject[cacheName]) {
                            if (cacheObject[cacheName].expirationDate && new Date(cacheObject[cacheName].expirationDate).getTime() <= Date.now()) {

                                // Cached item still exists, but has expired

                                cache.delete(item).then(() => {
                                    log('delete', `Cleared expired item "${item.url}" from "${cacheName}"`);
                                });

                                delete cacheObject[cacheName];

                            }
                        }

                    });
                });
            });
        });
    });

}


/**
 * Remove all caches.
 *
 * @param {string|string[]} [ignoreCacheNames=[]]
 * @returns {Promise}
 */
export function clearCaches(ignoreCacheNames = []) {

    // Make sure ignoreCacheNames is an array
    const ignoreCacheNamesArray = [].concat(ignoreCacheNames);

    return caches.keys().then(keys => Promise.all(keys
        .filter(key => ignoreCacheNamesArray.indexOf(key) === -1)
        .map(key => caches.delete(key).then(() =>
            log('delete', `Removed cache "${key}"`)
        ))
    ));

}


/**
 * Remove caches whose names are no longer in the cacheObject.
 *
 * @param {string|string[]} [ignoreCacheNames=[]]
 * @returns {Promise}
 */
export function clearRemovedCaches(ignoreCacheNames = []) {

    // Make sure ignoreCacheNames is an array
    const ignoreCacheNamesArray = [].concat(ignoreCacheNames);

    return caches.keys().then(keys => Promise.all(keys
        .filter(key => !(key in cacheObject) && ignoreCacheNamesArray.indexOf(key) === -1)
        .map(key => caches.delete(key).then(() =>
            log('delete', `Removed old cache "${key}"`)
        ))
    ));

}


/**
 * Limit the number of items in a specified cache.
 *
 * @param {string} cacheName - Name of the cache to trim
 * @param {number} maxItems - Max number of items to keep in cache
 */
export function trimCache(cacheName, maxItems) {

    caches.open(cacheName).then(cache => {
        cache.keys().then(keys => {
            if (keys.length > maxItems) {
                cache.delete(keys[0]).then(trimCache(cacheName, maxItems));
            }
        });
    });

}
