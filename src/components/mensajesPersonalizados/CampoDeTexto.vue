<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { io } from "socket.io-client";

import MensajePrueba from "../enviarMensajes/MensajePrueba.vue";
import SelectorPlantillas from "../enviarMensajes/SelectorPlantillas.vue";
import { storeEnvioAutomatizado } from "@/store/storeEnvioAutomatizado";
import { storeCargarBase } from "@/store/storeCargarBase";
import { storeHistorial } from "@/store/storeHistorial";
import { useAutowat } from "@/composables/useAutowat";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const { AUTOWAT_URL, token, get, post } = useAutowat();
const baseCargada = storeCargarBase();
const envioStore = storeEnvioAutomatizado();
const historialStore = storeHistorial();

const estadoEnviando = ref(false);
const mensajeActual = ref(null);
const countdownSegundos = ref(0);

// --- WebSocket ---
let socket = null;

const conectarSocket = () => {
  if (socket?.connected) return;

  socket = io(AUTOWAT_URL, { auth: { token } });

  // Cuenta regresiva segundo a segundo desde el backend
  socket.on("batch:countdown", (data) => {
    countdownSegundos.value = data.segundos;
    historialStore.segundosRestantes = data.segundos;
    historialStore.tiempo = historialStore.formatearTiempo
      ? historialStore.formatearTiempo(data.segundos)
      : formatTiempo(data.segundos);
  });

  // Cuando se esta enviando a un numero
  socket.on("batch:enviando", (data) => {
    mensajeActual.value = data.mensajeActual;
  });

  // Mensaje enviado exitosamente
  socket.on("batch:enviado", (data) => {
    historialStore.enviados = data.enviados;
    historialStore.sinWhatsapp = data.sinWhatsapp;
  });

  // Numero sin WhatsApp
  socket.on("batch:sin-whatsapp", (data) => {
    historialStore.enviados = data.enviados;
    historialStore.sinWhatsapp = data.sinWhatsapp;
  });

  // Error en un envio
  socket.on("batch:error", (data) => {
    historialStore.enviados = data.enviados;
    historialStore.sinWhatsapp = data.sinWhatsapp;
  });

  // Lote finalizado
  socket.on("batch:finalizado", (data) => {
    resetearEstado(data);
    toast.success(
      `Envio finalizado: ${data.enviados} enviados, ${data.sinWhatsapp} sin WhatsApp, ${data.errores} errores.`,
      {
        theme: "colored",
        autoClose: 5000,
        position: toast.POSITION.BOTTOM_LEFT,
        transition: toast.TRANSITIONS.ZOOM,
      },
    );
  });

  // Lote cancelado (por el usuario o por el admin)
  socket.on("batch:cancelado", (data) => {
    resetearEstado(data);
    toast.error(
      `Envio cancelado. ${data.enviados} enviados de ${data.total}.`,
      {
        theme: "colored",
        autoClose: 5000,
        position: toast.POSITION.BOTTOM_LEFT,
        transition: toast.TRANSITIONS.ZOOM,
      },
    );
  });
};

const resetearEstado = (data) => {
  estadoEnviando.value = false;
  historialStore.enviando = false;
  mensajeActual.value = null;
  countdownSegundos.value = 0;
  historialStore.enviados = data.enviados;
  historialStore.sinWhatsapp = data.sinWhatsapp;
  historialStore.segundosRestantes = 0;
  historialStore.tiempo = "00h 00min 00seg";
};

const desconectarSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Helper local para formatear tiempo
const pad2 = (n) => String(n).padStart(2, "0");
const formatTiempo = (totalSeg) => {
  const seg = Math.max(0, Math.floor(totalSeg));
  const h = Math.floor(seg / 3600);
  const m = Math.floor((seg % 3600) / 60);
  const s = seg % 60;
  return `${pad2(h)}h ${pad2(m)}min ${pad2(s)}seg`;
};

// --- Enviar toda la base al backend ---
const enviar = async () => {
  try {
    if (!envioStore.mensaje) {
      toast.error("Escribe un mensaje antes de enviar.", {
        theme: "colored",
        autoClose: 1500,
        position: toast.POSITION.BOTTOM_LEFT,
        transition: toast.TRANSITIONS.ZOOM,
      });
      return;
    }
    if (!baseCargada.base.length) {
      toast.error("Carga una base de contactos primero.", {
        theme: "colored",
        autoClose: 1500,
        position: toast.POSITION.BOTTOM_LEFT,
        transition: toast.TRANSITIONS.ZOOM,
      });
      return;
    }

    estadoEnviando.value = true;
    historialStore.fcambiarEstadoEnviar(true);
    historialStore.total = baseCargada.base.length;
    conectarSocket();

    const payload = {
      contactos: baseCargada.base.map((item) => ({
        numero: item.NUMERO || item.numero,
        nombre: item.NOMBRE || item.nombre,
        fecha: item.FECHA || item.fecha,
      })),
      mensaje: envioStore.mensaje,
      imagenUrl: envioStore.imagen || null,
    };

    const { data } = await post("/message/send-batch", payload);

    toast.success(`${data.mensaje} (${data.total} contactos)`, {
      theme: "colored",
      autoClose: 2000,
      position: toast.POSITION.BOTTOM_LEFT,
      transition: toast.TRANSITIONS.ZOOM,
    });
  } catch (error) {
    estadoEnviando.value = false;
    const status = error?.response?.status;
    if (status === 409) {
      toast.error("Ya hay un envio en proceso. Espera a que termine.", {
        theme: "colored",
        autoClose: 2000,
        position: toast.POSITION.BOTTOM_LEFT,
        transition: toast.TRANSITIONS.ZOOM,
      });
    } else {
      toast.error("Error al iniciar el envio.", {
        theme: "colored",
        autoClose: 1500,
        position: toast.POSITION.BOTTOM_LEFT,
        transition: toast.TRANSITIONS.ZOOM,
      });
    }
    console.log("ERROR: " + error);
  }
};

const cancelar = async () => {
  try {
    await post("/message/cancel-batch");
    estadoEnviando.value = false;
    mensajeActual.value = null;
    countdownSegundos.value = 0;
    toast.info("Envio cancelado.", {
      theme: "colored",
      autoClose: 1500,
      position: toast.POSITION.BOTTOM_LEFT,
      transition: toast.TRANSITIONS.ZOOM,
    });
  } catch (error) {
    console.log("Error cancelando:", error);
  }
};

// Al montar: conectar socket y verificar si hay envio en curso
onMounted(async () => {
  try {
    const { data } = await get("/message/batch-status");
    if (data.enProceso) {
      estadoEnviando.value = true;
      historialStore.enviando = true;
      historialStore.enviados = data.enviados;
      historialStore.sinWhatsapp = data.sinWhatsapp;
      historialStore.total = data.total;
      mensajeActual.value = data.mensajeActual;
      conectarSocket();
    }
  } catch (error) {
    console.log(error);
  }
});

onUnmounted(() => {
  desconectarSocket();
});
</script>
<template>
  <div class="flex flex-col h-screen">
    <!-- Header -->
    <div class="p-4 bg-white shrink-0">
      <h2 class="font-medium text-gray-900">
        <i class="fa-slab fa-regular fa-circle mr-2 text-blue-600"></i>
        Envio Automatizado
      </h2>
    </div>

    <!-- Cuadro de texto -->
    <div class="p-4 pt-0 shrink-0">
      <div
        class="p-4 bg-white rounded-xl shadow-lg shadow-black/10 border border-gray-200 transition-all duration-300"
      >
        <div class="flex items-center justify-between gap-4">
          <Transition name="zoom">
            <div
              class="w-20 h-20 shadow-md shadow-black/50 rounded-md relative"
              v-if="envioStore.imagen"
            >
              <button
                class="bg-red-600 absolute top-[-5px] right-[-5px] rounded-full w-5 h-5 items-center justify-center flex"
                @click="envioStore.quitarImagen(false)"
              >
                <i
                  class="fa-duotone fa-regular fa-xmark text-white text-xs"
                ></i>
              </button>
              <img
                :src="envioStore.imagen"
                class="w-20 h-20 shadow-md shadow-black/50 rounded-md object-cover"
              />
            </div>
          </Transition>
          <textarea
            id="message"
            rows="3"
            class="flex-1 p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Escribe tu mensaje..."
            v-model="envioStore.mensaje"
            required
          />
        </div>
        <div class="flex items-center justify-between mt-4">
          <div class="flex items-center gap-2">
            <!-- Input file oculto -->
            <input
              type="file"
              :ref="(el) => (envioStore.fileInput = el)"
              class="hidden"
              @change="envioStore.fCambioDeImagen"
            />

            <button
              type="button"
              class="hover:bg-gray-100 font-medium px-3 py-2 rounded-md transition-all text-sm text-gray-700 border border-gray-200"
              @click="envioStore.fAbrirAdministrador"
            >
              <i class="fa-duotone fa-regular fa-image mr-1 text-gray-500"></i> Imagen
            </button>

            <SelectorPlantillas />
          </div>
          <div class="flex items-center gap-4">
            <button
              class="font-medium px-4 py-2 text-orange-500 hover:bg-orange-100 rounded-md transition-all duration-500"
              @click="envioStore.fAbrirPrueba(true)"
            >
              Enviar prueba
            </button>
            <button
              v-if="estadoEnviando"
              class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-sm shadow-md text-white text-sm"
              @click.prevent="cancelar"
            >
              Cancelar envio
            </button>
            <button
              v-else
              class="bg-gray-600 hover:bg-gray-800 disabled:bg-gray-400 px-4 py-2 rounded-sm shadow-md text-white text-sm"
              @click.prevent="enviar"
              :disabled="!baseCargada.base.length || !envioStore.mensaje"
            >
              Enviar lote
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Lista de mensajes -->
    <MensajePrueba />
  </div>
</template>

<style>
/* Scroll invisible pero funcional */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
