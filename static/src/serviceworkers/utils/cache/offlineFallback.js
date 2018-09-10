import cachingStrategies from './cachingStrategies.json';
import { precacheItems } from './index';
import log from '../log';


let offlineFallbackPage;
let offlineFallbackImage;


/**
 * Set offline fallback page.
 *
 * @param {string} path - Path to URL to use as an offline page
 */
export function setOfflinePage(path) {

    offlineFallbackPage = path;

    // Add file to precache
    precacheItems(path, {
        strategy: cachingStrategies.cacheOnly
    });

}


/**
 * Set offline fallback image.
 *
 * @param {Blob|string} image - Blob of or URL to image to fall back to when offline
 */
export function setOfflineImage(image) {
    if (image.constructor.name === 'Blob') {

        offlineFallbackImage = new Response(image, {
            status: 503,
            statusText: 'Service Unavailable',
            headers: {
                'Content-Type': 'image/svg+xml',
                'Cache-Control': 'no-store'
            }
        });

    } else if (typeof image === 'string') {

        offlineFallbackImage = image;

        // Add file to precache
        precacheItems(image, {
            strategy: cachingStrategies.cacheOnly
        });

    }
}


/**
 * Handle offline requests.
 *
 * @param {Object} request - Request to handle
 * @returns {Promise}
 */
export function handleOfflineRequest(request) {
    const url = new URL(request.url);

    if (request.headers.get('Accept').includes('text/html') && offlineFallbackPage) {


        // Return offline page

        log('offline', `Return offline page instead of "${url.pathname}"`);
        return caches.match(offlineFallbackPage);


    } else if (request.headers.get('Accept').includes('image') && offlineFallbackImage) {


        // Return offline image

        log('offline', `Return offline placeholder for image "${url.pathname}"`);
        if (offlineFallbackImage.constructor.name === 'Response') {

            // Return generated offline image
            return offlineFallbackImage.clone();

        } else {

            // Return offline image from cache
            return caches.match(offlineFallbackImage);
        }


    } else {


        // Return offline response HTTP 503

        log('offline', `Return offline response HTTP 503 instead of "${url.pathname}"`);
        return new Response('', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
                'Content-Type': 'text/html',
                'Cache-Control': 'no-store'
            })
        });
    }
}
