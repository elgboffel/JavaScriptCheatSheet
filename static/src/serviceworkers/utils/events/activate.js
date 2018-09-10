import { version as SERVICEWORKER_VERSION } from '../../../../../setup/serviceworker-version.json';
import { matchPattern } from '../routes';
import { addToCacheObject, fetchCacheName, staticCacheName } from '../cache/cacheControl';
import { clearExpiredFiles, clearRemovedCaches } from '../cache/cleanup';
import forEach from '../forEach';
import log from '../log';


let isActive = false;
let claimClients = false;


/**
 * Set the state of claimClients to true or false
 *
 * Clients.claim() sets this worker as the active worker for all clients that
 * match the workers scope and triggers an "oncontrollerchange" event
 *
 * @param {boolean} state - State to set claimClients to (true or false)
 */
export function setClaimClients(state) {

    claimClients = state;

}


/**
 * Get Service Worker activated state
 *
 * @returns {boolean}
 */
export function getActivatedState() {

    return isActive;

}


/**
 * Handle activate event
 *
 * @param {Event} event
 */
export default function handleActivate(event) {

    log('status', `Version ${SERVICEWORKER_VERSION} activating`);

    // This is a good place to clean up old caches
    event.waitUntil(clearRemovedCaches([fetchCacheName, staticCacheName]).then(() => {

        log('status', `Version ${SERVICEWORKER_VERSION} activated!`);

        // Set active state to true
        isActive = true;

        // Service worker is ready to handle fetches.
        // Make sure items that have already been cached from the fetch event
        // are put in the "cacheObject", so that we can easily find their settings.
        caches.open(fetchCacheName).then(cache => {
            cache.keys().then(itemsInFetchCache => {
                forEach(itemsInFetchCache, item => {
                    const matchingPattern = matchPattern(item.url);

                    if (typeof matchingPattern === 'object') {
                        addToCacheObject(fetchCacheName, item.url, matchingPattern);
                    }
                });
            });
        });

        clearExpiredFiles();

        if (claimClients) {
            // Take control of uncontrolled clients.
            return self.clients.claim();
        }

    }));

}
