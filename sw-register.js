// This is the main thread, but we have to register the service worker to run the service worker in its own thread.
// We have to check for service worker, since some browsers don't support service workers
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('serviceworker.js');
}