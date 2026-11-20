const CACHE_NAME = 'tem-cache-v3';

const ASSETS = [
  './',
  './index.html',
  './ingresar.html',
  './perfil.html',
  './privacidad.html',
  './manifest.json',
  './plan/cursada.html',
  './plan/equipo.html',
  './plan/que-es.html',
  './cursos/index.html',
  './cursos/cuidate-online/index.html',
  './cursos/cuidate-online/nivel-1.html',
  './cursos/cuidate-online/nivel-2.html',
  './cursos/cuidate-online/nivel-3.html',
  './assets/css/styles.css',
  './assets/js/app.js',
  './assets/js/config.js',
  './assets/js/login.js',
  './assets/js/menu.js',
  './assets/js/perfil.js',
  './assets/js/store.js',
  './assets/img/Encabezado TEM.svg',
  './assets/img/escudo actos.svg',
  './assets/img/Logo-a-color.png',
  './assets/img/TEM-logo.png',
  './assets/img/icon-192.png',
  './assets/img/icon-512.png',
  './cursos/Herramientas-Digitales/index.html',
  './cursos/Herramientas-Digitales/clase-1.html',
  './cursos/Herramientas-Digitales/clase-2.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // No cachear llamadas externas (ej. Supabase)
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});