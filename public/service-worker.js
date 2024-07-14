// Escuchando el evento 'install', pero no realizando ninguna acción
self.addEventListener("install", function (event) {
    // No se realiza ninguna acción aquí
  });
  
  // Intercepta las solicitudes de red y simplemente las redirige a la red
  self.addEventListener("fetch", function (event) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(`
          <!DOCTYPE html>
          <html lang="es">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Offline</title>
            <style>
              body { display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: Arial, sans-serif; background-color: #f0f0f0; }
              .container { text-align: center; }
              h1 { color: #333; }
              p { color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Sin conexión a Internet</h1>
              <p>Parece que no estás conectado a Internet. Por favor, verifica tu conexión e inténtalo de nuevo.</p>
            </div>
          </body>
          </html>
        `, {
          headers: { 'Content-Type': 'text/html' }
        });
      })
    );
  });
  