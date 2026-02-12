// sw.js (mínimo)
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// (Opcional) dejar pasar todo tal cual sin interceptar
self.addEventListener("fetch", () => {});
