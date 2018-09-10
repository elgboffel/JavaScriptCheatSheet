import cachingStrategies from '../cache/cachingStrategies.json';
import { fetchCacheName, addToCache, getFromCacheObject, stashInCache } from '../cache/cacheControl';
import { handleOfflineRequest } from "../cache/offlineFallback";
import { trimCache } from '../cache/cleanup';
import { matchRedirect } from '../redirect';
import { matchPattern, getMaxCachedFetches } from '../routes';
import promiseAny from '../promiseAny';
import log from '../log';


/**
 * Check if a response exists and if the cached item has expired or reached its max age.
 *
 * @param {Response} response - The response from request
 * @param {Object} cacheData - Object with cache name and settings for the cached item
 * @returns {boolean}
 */
function checkResponseAndExpiration(response, cacheData) {

    const dateNow = Date.now();
    return response && (!cacheData.settings.expirationDate || new Date(cacheData.settings.expirationDate).getTime() > dateNow) && (!cacheData.settings.maxAge || dateNow - new Date(response.headers.get('Date')).getTime() <= cacheData.settings.maxAge);

}


/**
 * Trim fetch cache to max amount.
 *
 * @param {string} cacheName
 */
function trimFetchCache(cacheName) {

    // Only trim cache if this is the fetch cache
    if (cacheName === fetchCacheName) {
        trimCache(fetchCacheName, getMaxCachedFetches());
    }

}


/**
 * Handle fetch events.
 *
 * @param {Event} event
 */
export default function handleFetch(event) {

    const originalRequest = event.request;
    const url = new URL(originalRequest.url);
    let request;
    let urlHref = url.href;

    // Only handle GET requests - deal with other methods client-side by handling failed requests
    if (originalRequest.method !== 'GET') {
        return;
    }

    const redirect = matchRedirect(urlHref);
    if (redirect) {

        // Redirect request to another URL and add cache busting (for the HTTP cache)

        redirect.searchParams.set("cacheBusting", Date.now());

        log('fetch', `Fetch "${redirect}", redirected from "${urlHref}"`);
        request = new Request(redirect);
        urlHref = redirect;

    } else {

        // Bust some HTTP cache

        url.searchParams.set("cacheBusting", Date.now());
        request = new Request(url);
        log('fetch', `Fetch "${urlHref}"`);

    }

    // Get data (cache name and settings) if item already exists in cache
    const cacheData = getFromCacheObject(urlHref);
    if (cacheData) {

        // Item exists in cacheObject.

        if (cachingStrategies.cacheFirst === cacheData.settings.strategy || cachingStrategies.cacheOnly === cacheData.settings.strategy) {

            event.respondWith(caches.match(urlHref).then(response => {

                // Check if item exist in cache and hasn't expired
                if (checkResponseAndExpiration(response, cacheData)) {

                    // Got item from cache

                    log('return', `Return cached item instead of "${urlHref}"`);


                    if (cacheData.settings.eventuallyFresh) {

                        // Before returning cache, request the same item from the network as well.
                        // This produces "eventually fresh" responses, where the cached response
                        // is returned immediately, and then the cache is updated.
                        fetch(request)
                            .then(response => {

                                stashInCache(cacheData.cacheName, urlHref, response.clone()).then(() => {
                                    log('add', `Updated "${urlHref}" in "${cacheData.cacheName}"`);

                                    // Trim fetch cache
                                    trimFetchCache(cacheData.cacheName);
                                });

                                return response;

                            })
                            .catch(response => response);

                    }

                    return response;

                } else if (cachingStrategies.cacheOnly !== cacheData.settings.strategy) {

                    // No cache - try network

                    return fetch(request)
                        .then(response => {

                            // Got item from network

                            // Update cache
                            stashInCache(cacheData.cacheName, urlHref, response.clone()).then(() => {
                                log('add', `Updated "${urlHref}" in "${cacheData.cacheName}"`);

                                // Trim fetch cache
                                trimFetchCache(cacheData.cacheName);
                            });

                            log('return', `Return "${urlHref}" from network`);
                            return response;

                        })
                        // No network connection - show offline fallback
                        .catch(() =>
                            handleOfflineRequest(originalRequest)
                        );

                } else {

                    // The item's strategy is cacheOnly, but there is no cached item

                    return handleOfflineRequest(originalRequest);

                }
            }));


        } else if (cachingStrategies.networkFirst === cacheData.settings.strategy || cachingStrategies.networkOnly === cacheData.settings.strategy) {

            event.respondWith(fetch(request)
                .then(response => {

                    // Got item from network

                    // Update cache
                    stashInCache(cacheData.cacheName, urlHref, response.clone()).then(() => {
                        log('add', `Updated "${urlHref}" in "${cacheData.cacheName}"`);

                        // Trim fetch cache
                        trimFetchCache(cacheData.cacheName);
                    });

                    log('return', `Return "${urlHref}" from network`);
                    return response;

                })
                .catch(() => {
                    if (cachingStrategies.networkOnly !== cacheData.settings.strategy) {

                        // No network connection - Get item from cache

                        return caches.match(urlHref).then(response => {

                            // Check if item exist in cache and hasn't expired
                            if (checkResponseAndExpiration(response, cacheData)) {

                                // Got item from cache

                                log('return', `Return cached item instead of "${urlHref}"`);
                                return response;

                            } else {

                                // No cache - show offline fallback

                                return handleOfflineRequest(originalRequest);

                            }
                        });

                    } else {

                        // The item's strategy is networkOnly, but there is no network connection

                        return handleOfflineRequest(originalRequest);

                    }
                })
            );

        } else if (cachingStrategies.cacheNetworkRace === cacheData.settings.strategy) {

            // Request item from both cache and network and return whichever comes first

            event.respondWith(promiseAny([
                caches.match(urlHref).then(response => {

                    // Check if item exist in cache and hasn't expired
                    if (checkResponseAndExpiration(response, cacheData)) {

                        // Got item from cache

                        log('return', `Return "${urlHref}" from cache - winner of cache/network race`);
                        return response;

                    } else {

                        return Promise.rejected();

                    }
                }),
                fetch(request).then(response => {

                    // Update cache
                    stashInCache(cacheData.cacheName, urlHref, response.clone()).then(() => {
                        log('add', `Updated "${urlHref}" in "${cacheData.cacheName}"`);

                        // Trim fetch cache
                        trimFetchCache(cacheData.cacheName);
                    });

                    log('return', `Return "${urlHref}" from network - winner of cache/network race`);
                    return response;

                })
            // No cache or network connection - show offline fallback
            ]).catch(() =>
                handleOfflineRequest(originalRequest)

            ));

        }


    } else {

        // Item was not found in cache.
        // Check if a matching pattern exists in a route and get its settings.
        // If no pattern is found, return response from network or provide offline fallback.

        const matchingPattern = matchPattern(urlHref);

        event.respondWith(fetch(matchingPattern ? request : originalRequest)
            .then(response => {

                // Got item from network

                if (matchingPattern) {

                    // Item matches a pattern - add it to cache

                    const addItem = {};
                    addItem[urlHref] = matchingPattern;
                    addToCache(fetchCacheName, addItem).then(() => {
                        log('add', `Pattern in route matched! Cached "${urlHref}" item under "${fetchCacheName}"`);

                        // Trim fetch cache
                        trimFetchCache(fetchCacheName);
                    });

                }

                return response;

            })
            .catch(() =>

                // No network connection - show offline fallback
                handleOfflineRequest(originalRequest)

            ));

    }

}
