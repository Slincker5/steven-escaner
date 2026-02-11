const CACHE_NAME = "cache-v1";
const CACHE_FILES = ["/", "index.html"];
let lotePendiente = null;

/* =====================
   INSTALL / ACTIVATE
===================== */
self.addEventListener("install", (event) => {
  console.log("Instalando SW...");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Activando SW...");
  event.waitUntil(
    (async () => {
      await self.clients.claim();
      console.log("Nuevo SW activo y controlando clientes");
    })()
  );
});

/* =====================
   MESSAGE / SYNC
===================== */
self.addEventListener("message", async (event) => {
  if (event.data?.tag === "sync-lote") {
    lotePendiente = event.data;
    console.log("SW recibió y guardó lote", lotePendiente);
  }
});

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-lote") {
    event.waitUntil(procesarLote());
  }
});

/* =====================
   PROCESAR LOTE
===================== */
const procesarLote = async () => {
  if (!lotePendiente) {
    console.warn("No hay datos pendientes");
    return;
  }

  const { clientes, api, mensaje, tieneImagen } = lotePendiente;

  await self.registration.showNotification("AUTOWHATS", {
    icon: "https://steven-scan.netlify.app/android-chrome-192x192.png",
    body: "Se están enviando mensajes.",
  });

  for (const cliente of clientes) {
    try {
      const ruta = tieneImagen ? "/messages/media" : "/message/send";
      const body = {
        numero: cliente.numero,
        message: mensaje,
        caption: mensaje,
        imageUrl: tieneImagen,
      };

      const res = await fetch(api + ruta, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      
      const fotoRes = await fetch(
        `${api}/profile-pic?number=${cliente.numero}`
      );
      let fotoUrl = "https://multimarcas.app/usuario.png";
      if (fotoRes.status === 200) {
        const fotoData = await fotoRes.json();
        fotoUrl = fotoData?.data?.url;
      }

      const [client] = await self.clients.matchAll({ type: "window" });
      if (client) client.postMessage({
        cliente: cliente.nombre,
        numero: cliente.numero,
        foto: fotoUrl
      });
      await esperar(20000);
    } catch (err) {
      console.error("Error con", cliente.numero, err);
    }
  }
  await self.registration.showNotification("✅ Lote completado", {
    icon: "https://steven-scan.netlify.app/android-chrome-512x512.png",
    body: "Todos los mensajes se enviaron correctamente.",
  });
};

function esperar(ms) {
  return new Promise((res) => setTimeout(res, ms));
}
