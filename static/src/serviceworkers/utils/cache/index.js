import { cacheObject } from './cacheControl';
import { onInstall, onInstalled } from '../events/install';
import forEach from '../forEach';


/**
 * Add one or more items to cache.
 *
 * @param {string|string[]} collection - One or more URLs to cache
 * @param {Object} settings - Object with settings
 * @param {boolean} [settings.eventuallyFresh=false] - After returning a cached item, update cache from network
 * @param {number|Date} [settings.expirationDate] - Don't cache the item after this date (can be a timestamp or a Date object)
 * @param {boolean} [settings.hardCache=false] - Save item in a cache that doesn't update when the Service Worker is updated
 * @param {number} [settings.maxAge] - Max age in milliseconds. If cached item is older, then update it
 * @param {boolean} [settings.noCors=false] - Use only when caching external items that don't support CORS (or when you're on localhost)
 * @param {boolean} [settings.precache=false] - Cache URL as a dependency when Serice Worker is installing
 * @param {'cacheFirst'|'cacheNetworkRace'|'cacheOnly'|'networkFirst'|'networkOnly'} settings.strategy - Cache strategy
 */
export function cacheItems(collection, settings) {

    const urls = [];
    forEach(collection, item => {

        // Make relative URLs absolute (works with both internal and external URLs)
        const url = new URL(item, self.location.origin);

        // Push URLs to array
        urls.push(url.href);

    });


    if (settings.precache === true) {

        // Precache URLs (during installation)
        onInstall(urls, settings);

    } else {

        // Cache URLs when service worker is installed
        onInstalled(urls, settings);

    }

}


/**
 * Add one or more items to precache
 *
 * @param {string|string[]} collection - One or more URLs to cache
 * @param {Object} settings - Object with settings
 * @param {boolean} [settings.eventuallyFresh=false] - After returning a cached item, update cache from network
 * @param {number|Date} [settings.expirationDate] - Don't cache the item after this date (can be a timestamp or a Date object)
 * @param {boolean} [settings.hardCache=false] - Save item in a cache that doesn't update when the Serice Worker is updated
 * @param {number} [settings.maxAge] - Max age in milliseconds. If cached item is older, then update it
 * @param {boolean} [settings.noCors=false] - Use only when caching external items that don't support CORS (or when you're on localhost)
 * @param {'cacheFirst'|'cacheNetworkRace'|'cacheOnly'|'networkFirst'|'networkOnly'} settings.strategy - Cache strategy
 */
export function precacheItems(collection, settings) {

    settings.precache = true;
    cacheItems(collection, settings);

}


/**
 * Remove an URL from a specified cache
 *
 * @param {string} cacheName - Name of cache to remove URLs from
 * @param {string|string[]} urls - URLs to remove
 * @returns {Promise}
 */
export function uncacheItems(cacheName, urls) {

    return caches.open(cacheName).then(cache => {

        const promises = [];
        forEach(urls, url => {
            if (url in cacheObject) {
                delete cacheObject[url];
            }

            promises.push(cache.delete(url));
        });

        return Promise.all(promises);

    });

}
