import cachingStrategies from './cachingStrategies.json';
import forEach from '../forEach';
import log from '../log';


/**
 * Name of static cache.
 *
 * @type {string}
 */
export const staticCacheName = 'static';


/**
 * Name of fetch cache.
 *
 * @type {string}
 */
export const fetchCacheName = 'fetches';


/**
 * Object containing all the different caches and their items.
 * Caching will be handled from this object, thus them being referenced here doesn't mean they have been cached already.
 *
 * @type {Array}
 */
export const cacheObject = [];


/**
 * Add items to cache.
 * Create cache if it doesn't exist.
 *
 * @param {string} name - Name of the cache to add items to
 * @param {Object} items - URLs to cache
 * @returns {Promise}
 */
export function addToCache(name, items) {

    return caches.open(name).then(cache => {

        const promises = [];
        const itemsToCache = [];
        const itemsNotToCache = [];

        forEach(items, (settings, item) => {

            // Check if strategy is not set or invalid
            if (!settings.strategy || !(settings.strategy in cachingStrategies)) {
                log('error', 'Caching failed - No valid strategy was set', item);
                return;
            }

            // Item hasn't expired
            if (!settings.expirationDate || new Date(settings.expirationDate).getTime() > Date.now()) {

                // Save item data in cacheObject
                addToCacheObject(name, item, settings);

                // Add promises to array
                promises.push(cache.match(item).then(response => {
                    if (!response || (settings.maxAge && Date.now() - new Date(response.headers.get('Date')).getTime() > settings.maxAge)) {

                        // Item does not exist in this cache - or already exists but has reached its max age

                        if (settings.strategy !== cachingStrategies.networkOnly) {

                            // Cache item unless its strategy is networkOnly

                            if (settings.noCors) {
                                itemsToCache.push(new Request(item, { mode: 'no-cors' }));
                            } else {
                                itemsToCache.push(item);
                            }
                        }

                    } else {

                        // Item already exists in this cache and hasn't expired
                        itemsNotToCache.push(item);

                    }
                }));
            }
        });


        // Put items in cache and return number of items cached and not cached

        return Promise.all(promises).then(() => cache.addAll(itemsToCache)
            .then(() => ({
                cached: itemsToCache,
                notCached: itemsNotToCache
            }))
            .catch(() => {

                let allItemsAreNoCorsRequests = true;
                forEach(itemsToCache, item => {
                    if (item.constructor.name !== 'Request' || item.mode !== 'no-cors') {
                        allItemsAreNoCorsRequests = false;
                    }
                });

                // If all items to be cached are Request in "no-cors" mode, don't trust this catch.
                // Requests made in "no-cors" mode don't resolve.
                if (!allItemsAreNoCorsRequests) {
                    log('error', 'Caching failed - Maybe a nonexistent file was requested', items);
                }

                return {
                    cached: 0,
                    notCached: 0
                };
            })
        );
    });

}


/**
 * Stash an item in a cache
 *
 * @param {string} cacheName - Name of cache to add item to
 * @param {string|Request} item - URL or Request to cache
 * @param {Response} response - The response to match up to the URL/Request
 * @returns {Promise}
 */
export function stashInCache(cacheName, item, response) {

    // We're using PUT here instead of ADD, since PUT can cache opaque responses.
    // Responses for "no-cors" requests are opaque responses.
    return caches.open(cacheName).then(cache => cache.put(item, response));

}


/**
 * Add an item to cacheObject
 *
 * @param {string} cacheName - Cache name to add URL to
 * @param {string} url - URL to add to cacheObject
 * @param {Object} settings - Object with settings
 * @param {boolean} [settings.eventuallyFresh=false] - After returning a cached item, update cache from network
 * @param {number|Date} [settings.expirationDate] - Don't cache the item after this date (can be a timestamp or a Date object)
 * @param {boolean} [settings.hardCache=false] - Save item in a cache that doesn't update when the Serice Worker is updated
 * @param {number} [settings.maxAge] - Max age in milliseconds. If cached item is older, then update it
 * @param {boolean} [settings.noCors=false] - Use only when caching external items that don't support CORS (or when you're on localhost)
 * @param {'cacheFirst'|'cacheNetworkRace'|'cacheOnly'|'networkFirst'|'networkOnly'} settings.strategy - Cache strategy
 */
export function addToCacheObject(cacheName, url, settings) {

    if (!(cacheName in cacheObject)) {
        cacheObject[cacheName] = {};
    }

    cacheObject[cacheName][url] = settings;

}


/**
 * Find out if an item exists in one of the caches in cacheObject.
 *
 * @param {string} url - URL to find
 * @returns {null|{cacheName: string, settings: Object}}
 */
export function getFromCacheObject(url) {

    let existsInCache = null;

    forEach(cacheObject, (objectItems, cacheName) => {
        if (!existsInCache) {
            forEach(objectItems, (settings, objectItem) => {
                if (!existsInCache && objectItem === url) {
                    existsInCache = {
                        cacheName,
                        settings
                    };
                }
            });
        }
    });

    return existsInCache;

}
