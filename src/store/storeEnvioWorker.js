import { defineStore } from "pinia";
import { ref, toRaw } from "vue";
import axios from "axios";
import { storeEnvioAutomatizado } from "@/store/storeEnvioAutomatizado";
import { storeValidarWhatsapp } from "@/store/storeValidarWhatsapp";

const envioStore = storeEnvioAutomatizado();
const validar = storeValidarWhatsapp();

export const storeEnvioWorker = defineStore("EnvioWorker", () => {
  // Estado principal

  const token = ref(localStorage.getItem("token"));
  const API_HTTP = "https://auto.autowat.site";

  // funciones del store
  const enviar = async (numero) => {
    try {
      const ruta = envioStore.packageMessage?.imageUrl
        ? "/messages/media"
        : "/message";

      const dataN = {
        numero: numero,
        mensaje: envioStore.modalSms
      }
      envioStore.packageMessage.number = numero;
      envioStore.packageMessage.caption = envioStore.modalSms;
      envioStore.packageMessage.message = envioStore.modalSms;
      const { data } = await axios.post(
        `${API_HTTP}${ruta}`,
        dataN
      );
      return {
        info: data,
        mensaje: envioStore.packageMessage.message,
      };
    } catch (error) {
      console.log(error);
    }
  };

  validar.verificarNumeros();

const iniciarEnvioEnBackground = async () => {
  try {
    // Convierte todos los datos a estructuras planas
    const clientes = JSON.parse(JSON.stringify(toRaw(validar.resultado.conWhatsApp.clients)));
    const mensaje = JSON.parse(JSON.stringify(toRaw(envioStore.modalSms)));
    const tieneImagen = JSON.parse(JSON.stringify(toRaw(envioStore.packageMessage.imageUrl)));

    if ("serviceWorker" in navigator && "SyncManager" in window) {
      const reg = await navigator.serviceWorker.ready;

      // ✅ Solo datos planos y clonables
      const payload = { tag: "sync-lote", clientes, api: API_HTTP, mensaje, tieneImagen };
      reg.active.postMessage(payload);

      await reg.sync.register("sync-lote");

      console.log("Tarea de envío registrada en segundo plano");
      alert("El envío continuará incluso si cierras o recargas.");
    } else {
      console.warn("Background Sync no soportado");
    }
  } catch (error) {
    console.error("Error en iniciarEnvioEnBackground:", error);
  }
};

  // Retorno del store ----------------
  return {
    token,
    iniciarEnvioEnBackground
  };
});
