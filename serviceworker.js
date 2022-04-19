// In devtools, you can use 'Update on reload' in service worker tab, so that when change something in the service worker,
// the new service worker will automatically be registered.
// You can also use the Offline flag in the service worker devtools to test if the worker is working offline

// Define all assets that you want to cache.
// Forward slash represents index.html.
// We don't need to cache the icons or manifest, since the browser already installs it when we open the app,
// and we don't use them in our app, so they are more like metadata.
// NB: the service worker can cache assets from the WHOLE APP, but it can only serve that file for our scope, our PWA
const assets = [
  "/",
  "styles.css",
  "app.js",
  "sw-register.js",
  "https://fonts.gstatic.com/s/materialicons/v67/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2",
];

const CACHE_NAME = "assets";

// Self instead of this for service worker
self.addEventListener("install", (e) => {
  // waitUntill tells the serviceWorker not to stop after 40s, but after the caches.open process is done.
  // Usually we don't need this, but only for big files that might require more than 40s to download
  e.waitUntil(
    // This is the cache API
    caches.open(CACHE_NAME).then((cache) => {
      cache.addAll(assets);
    })
  );
});

// Since service workers are a low level API, you would have to write the whole server yourself.
// Instead you can use Workbox, a google tool to make it more easy.
self.addEventListener("fetch", (e) => {
  // respondWith will bypass going to the network. So here on /test it will go to the service worker, else it'll go to the server
  if (e.request.url.endsWith("/test")) {
    const response = new Response(
      `Hello, this is a response with ${e.request.url}`
    );

    e.respondWith(response);
  } else {
    // Check if request is cached.
    // We have to call respondWidth with the fetch promise. Otherwise, if we call it within
    // the catch.match promise, the fetch listener will finish before the response is given
    // (since getting the cache is async),and this will create an error
    e.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        // Checks if the request has an entry in the cache.
        // Cache storage API is a dictionary with key the HTTP request, and value the response.
        return cache.match(e.request).then((cachedResponse) => {
          // This pattern is called cache-first
          if (cachedResponse) {
            // It's a catch hit, so we serve from the catch
            return cachedResponse;
          } else {
            // It's a catch miss, so we go to the network
            return fetch(e.request);
          }
        });
      })
    );
  }
});
