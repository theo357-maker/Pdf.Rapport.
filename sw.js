// Nom du cache. Changez ce nom à chaque mise à jour importante
const CACHE_NAME = 'rapports-ena-cache-v3'; // Version incrémentée

// Liste des fichiers essentiels à mettre en cache
const urlsToCache = [
  './',
  './index.html',
  './gestionnaire.html',
  './manifest.json',
  './icon-512x512.png',
  './icon-192x192.png',
  './icon-maskable-512x512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2'
];

// Installation du Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker: Installation...');
  
  // Sauter l'attente pour devenir actif immédiatement
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Mise en cache des fichiers de l\'application');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Service Worker: Échec de la mise en cache', error);
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker: Activation...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Supprimer les anciens caches
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Suppression de l\'ancien cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Prendre le contrôle de toutes les pages
  return self.clients.claim();
});

// Interception des requêtes
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(networkResponse => {
          // Mettre en cache les nouvelles ressources
          if (event.request.method === 'GET' && networkResponse.status === 200) {
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          }
          return networkResponse;
        });
      })
      .catch(error => {
        console.error('Service Worker: Erreur lors de la récupération', error);
      })
  );
});

// Écouter les messages pour forcer la mise à jour
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});