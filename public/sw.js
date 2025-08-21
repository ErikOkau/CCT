// Service Worker for CCT Guild Battle Analyzer
const CACHE_NAME = 'cct-analyzer-v2';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/img/cctLogo.png',
  '/img/Red_Velvet_Dragon.webp',
  '/img/Living_Licorice_Abyss.webp',
  '/img/Avatar_of_destiny_guild_battle_ready.webp',
  '/img/logo_gm3.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Fetch event - serve from cache if available
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all clients immediately
  event.waitUntil(self.clients.claim());
});

// Handle app installation
self.addEventListener('beforeinstallprompt', (event) => {
  console.log('App can be installed');
});

// Handle app installation completion
self.addEventListener('appinstalled', (event) => {
  console.log('App was installed');
});
