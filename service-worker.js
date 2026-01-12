// Service Worker for offline caching and performance
const CACHE_NAME = "education-site-v1";
const RUNTIME_CACHE = "runtime-cache-v1";

// Assets to cache on install
const STATIC_CACHE_URLS = [
  "/",
  "/index.html",
  "/login.html",
  "/signup.html",
  "/style.css",
  "/style2.css",
  "/script.js",
  "/modules/cache-manager.js",
  "/modules/lazy-loader.js",
  "/p2-remove.png",
  "/whychoose.png",
  "/web.png",
  "/market.png",
  "/app_dev.png",
  "/java_logo.png",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Caching static assets");
        return cache.addAll(
          STATIC_CACHE_URLS.map((url) => new Request(url, { cache: "reload" }))
        );
      })
      .catch((error) => {
        console.error("Failed to cache:", error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version and update cache in background
        fetchAndCache(event.request);
        return cachedResponse;
      }

      // Not in cache, fetch from network
      return fetchAndCache(event.request);
    })
  );
});

// Fetch and cache helper function
async function fetchAndCache(request) {
  try {
    const response = await fetch(request);

    // Only cache successful responses
    if (!response || response.status !== 200 || response.type === "error") {
      return response;
    }

    // Clone the response
    const responseToCache = response.clone();

    // Determine which cache to use
    const cacheName =
      request.url.includes("cdn.jsdelivr") ||
      request.url.includes("cdnjs.cloudflare")
        ? STATIC_CACHE
        : RUNTIME_CACHE;

    caches.open(cacheName).then((cache) => {
      cache.put(request, responseToCache);
    });

    return response;
  } catch (error) {
    console.error("Fetch failed:", error);
    // Try to return from cache as fallback
    return caches.match(request);
  }
}

// Message event - handle cache management commands
self.addEventListener("message", (event) => {
  if (event.data.action === "skipWaiting") {
    self.skipWaiting();
  } else if (event.data.action === "clearCache") {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});
