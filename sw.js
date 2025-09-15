const CACHE_NAME = 'schedule-v3'; // Обновил версию кэша
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/schedule.json',
  '/images/favicon_io/favicon-32x32.png',
  // Добавьте другие важные файлы, если они есть
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Если ресурс есть в кэше, возвращаем его
        if (response) {
          return response;
        }
        // Иначе, делаем запрос к сети
        return fetch(event.request);
      })
  );
});