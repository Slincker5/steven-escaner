// service-worker.js

// Escuchando el evento 'install', pero no realizando ninguna acción
self.addEventListener("install", function (event) {
    // No se realiza ninguna acción aquí
  });
  
  self.addEventListener("fetch", function (event) {
    event.respondWith(fetch(event.request));
  });
  