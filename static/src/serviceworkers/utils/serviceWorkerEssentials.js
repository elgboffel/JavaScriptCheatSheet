import handleInstall from './events/install';
import handleActivate from './events/activate';
import handleFetch from './events/fetch';
import handleMessage from './events/message';


/**
 * Listen for install event and handle it.
 */
self.addEventListener('install', handleInstall);


/**
 * Listen for activate event and handle it.
 */
self.addEventListener('activate', handleActivate);


/**
 * Listen for fetch events and handle them.
 */
self.addEventListener('fetch', handleFetch);


/**
 * Listen for messages from frontend.
 * Send message with: navigator.serviceWorker.controller.postMessage( ... );
 */
self.addEventListener('message', handleMessage);
