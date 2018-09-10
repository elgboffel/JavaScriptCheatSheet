import { version as SERVICEWORKER_VERSION } from '../../../../../setup/serviceworker-version.json';
import { addToCache, staticCacheName } from '../cache/cacheControl';
import { getActivatedState } from './activate';
import forEach from '../forEach';
import log from '../log';


let skipWaiting = false;
let itemsToPrecache = {};
let itemsToCache = {};


/**
 * Add promises to resolve on installation (as dependencies).
 *
 * @param {string|string[]} newUrls - URLs to cache on install
 * @param {Object} settings - Object with settings
 * @param {boolean} [settings.eventuallyFresh=false] - After returning a cached item, update cache from network
 * @param {number|Date} [settings.expirationDate] - Don't cache the item after this date (can be a timestamp or a Date object)
 * @param {boolean} [settings.hardCache=false] - Save item in a cache that doesn't update when the Serice Worker is updated
 * @param {number} [settings.maxAge] - Max age in milliseconds. If cached item is older, then update it
 * @param {boolean} [settings.noCors=false] - Use only when caching external items that don't support CORS (or when you're on localhost)
 * @param {'cacheFirst'|'cacheNetworkRace'|'cacheOnly'|'networkFirst'|'networkOnly'} settings.strategy - Cache strategy
 */
export function onInstall(newUrls, settings) {

    let objectKey = staticCacheName;
    if (settings.hardCache !== true) {
        objectKey += `--${SERVICEWORKER_VERSION}`;
    }

    if (!(objectKey in itemsToPrecache)) {
        itemsToPrecache[objectKey] = {};
    }

    forEach(newUrls, url => {
        itemsToPrecache[objectKey][url] = settings;
    });

    if (getActivatedState()) {
        installPrecache();
    }

}


/**
 * Add promises to resolve after installation (not as dependencies).
 *
 * @param {string|string[]} newUrls - URLs to cache when installed
 * @param {Object} settings - Object with settings
 * @param {boolean} [settings.eventuallyFresh=false] - After returning a cached item, update cache from network
 * @param {number|Date} [settings.expirationDate] - Don't cache the item after this date (can be a timestamp or a Date object)
 * @param {boolean} [settings.hardCache=false] - Save item in a cache that doesn't update when the Serice Worker is updated
 * @param {number} [settings.maxAge] - Max age in milliseconds. If cached item is older, then update it
 * @param {boolean} [settings.noCors=false] - Use only when caching external items that don't support CORS (or when you're on localhost)
 * @param {'cacheFirst'|'cacheNetworkRace'|'cacheOnly'|'networkFirst'|'networkOnly'} settings.strategy - Cache strategy
 */
export function onInstalled(newUrls, settings) {

    let objectKey = staticCacheName;
    if (settings.hardCache !== true) {
        objectKey += `--${SERVICEWORKER_VERSION}`;
    }

    if (!(objectKey in itemsToCache)) {
        itemsToCache[objectKey] = {};
    }

    forEach(newUrls, url => {
        itemsToCache[objectKey][url] = settings;
    });

    if (getActivatedState()) {
        installCache();
    }

}


/**
 * Set the state of skipWaiting to true or false
 *
 * Service workers require a navigation event (reload or going to a new page)
 * to activate, but skipWaiting() activates the service worker immediately.
 *
 * If there's already a service worker, skipWaiting() kicks it out and uses this one.
 * This means that this new service worker might be controlling pages that were loaded
 * with an older version. Some of your page's fetches will have been handled by the
 * old service worker, but this new SW will be handling all new fetches.
 *
 * If this might break thing, deactivate skipWaiting.
 *
 * @param {boolean} state - State to set skiWaiting to (true or false)
 */
export function setSkipWaiting(state) {

    skipWaiting = state;

}


/**
 * Add URLs for precaching to cache (run this during installation)
 *
 * @returns {Promise}
 */
function installPrecache() {

    const cachings = [];

    forEach(itemsToPrecache, (itemsArray, key) => {
        cachings.push(addToCache(key, itemsArray).then(items => {
            const cachedItemsCount = items.cached.length;
            const notCachedItemsCount = items.notCached.length;

            if (cachedItemsCount) {
                log('add', `Precached ${cachedItemsCount} item${cachedItemsCount === 1 ? '' : 's'} under "${key}"`, items.cached);
            }

            if (notCachedItemsCount) {
                log('add', `${notCachedItemsCount} item${notCachedItemsCount === 1 ? ' was' : 's were'} already precached under "${key}"`, items.notCached);
            }
        }));
    });

    // Reset object with items to precache
    itemsToPrecache = {};

    return Promise.all(cachings);

}


/**
 * Add URLs to cache (run this after installation)
 *
 * @returns {Promise}
 */
function installCache() {

    const cachings = [];

    forEach(itemsToCache, (itemsArray, key) => {
        cachings.push(addToCache(key, itemsArray).then(items => {

            const cachedItemsCount = items.cached.length;
            const notCachedItemsCount = items.notCached.length;

            if (cachedItemsCount) {
                log('add', `Cached ${cachedItemsCount} item${cachedItemsCount === 1 ? '' : 's'} under "${key}"`, items.cached);
            }

            if (notCachedItemsCount) {
                log('add', `${notCachedItemsCount} item${notCachedItemsCount === 1 ? ' was' : 's were'} already cached under "${key}"`, items.notCached);
            }

        }));
    });

    // Reset object with items to cache
    itemsToCache = {};

    return Promise.all(cachings);

}


/**
 * Handle install event
 *
 * @param {Event} event
 */
export default function handleInstall(event) {

    log('status', `Version ${SERVICEWORKER_VERSION} installing`);

    if (skipWaiting) {
        // Skip waiting
        self.skipWaiting();
    }

    // Install service worker
    event.waitUntil(installPrecache().then(() => {

        log('status', `Version ${SERVICEWORKER_VERSION} installed!`);

        // Cache items that weren't necessary for the SW to be installed
        installCache();

    }));

}
