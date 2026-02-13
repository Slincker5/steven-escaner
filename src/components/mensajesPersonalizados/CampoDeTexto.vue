<script setup>
import { ref } from "vue";

import axios from "axios";
import MensajePrueba from "../enviarMensajes/MensajePrueba.vue";
import { storeEnvioAutomatizado } from "@/store/storeEnvioAutomatizado";
import { storeCargarBase } from "@/store/storeCargarBase";
import { storeHistorial } from "@/store/storeHistorial";

const baseCargada = storeCargarBase();
const envioStore = storeEnvioAutomatizado();
const historialStore = storeHistorial();

const estadoEnviando = ref(false);
const enviarLote = async (numero, mensaje, nombre, fecha) => {
  try {
    const ruta =
      envioStore.imagen === false ? "/message/send" : "/message/media";
    const API_HTTP = `https://auto.autowat.site${ruta}`;
    const datos = {
      numero: numero,
      mensaje: mensaje,
      nombre: nombre,
      fecha: fecha,
    };
    if (!envioStore.packageMessage.imagenUrl) {
      datos.imagenUrl = envioStore.imagen;
    }
    if (!envioStore.imagen) {
      datos.imagenUrl = envioStore.imagen;
    }
    const { data } = await axios.post(API_HTTP, datos);
    historialStore.fcambiarEstadoEnviados("1");
  } catch (error) {
    console.log(error);
  }
};

const enviarConPromesa = (numero, mensaje, nombre, fecha) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(enviarLote(numero, mensaje, nombre, fecha));
    }, 30000);
  });
};

const sendMessage = async (numero, mensaje, nombre, fecha) => {
  try {
    estadoEnviando.value = true;
    const mensaje2 = await enviarConPromesa(numero, mensaje, nombre, fecha);
    console.log(mensaje2);
  } catch (error) {
    console.log(error);
  } finally {
    estadoEnviando.value = false;
  }
};

const enviar = async () => {
  historialStore.fcambiarEstadoEnviar(true);
  for (const item of baseCargada.base) {
    await sendMessage(item.numero, envioStore.mensaje, item.nombre, item.fecha);
  }
};
</script>
<template>
  <div class="flex flex-col h-screen">
    <!-- Header -->
    <div class="p-4 bg-white shrink-0">
      <h2 class="font-medium text-gray-900">
        <i class="fa-slab fa-regular fa-circle mr-2 text-blue-600"></i>
        Envio Automatizado {{ baseCargada.base }}
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
          />
        </div>
        <div class="flex items-center justify-between mt-4">
          <div>
            <!-- Input file oculto -->
            <input
              type="file"
              :ref="(el) => (envioStore.fileInput = el)"
              class="hidden"
              @change="envioStore.fCambioDeImagen"
            />

            <!-- Botón personalizado -->
            <button
              type="button"
              class="hover:bg-gray-300 font-medium px-4 py-2 rounded-md transition-all duration-500 text-sm"
              @click="envioStore.fAbrirAdministrador"
            >
              <i class="fa-jelly-duo fa-regular fa-image"></i> Cargar imagen
            </button>
          </div>
          <div class="flex items-center gap-4">
            <button
              class="font-medium px-4 py-2 text-orange-500 hover:bg-orange-100 rounded-md transition-all duration-500"
              @click="envioStore.fAbrirPrueba(true)"
            >
              Enviar prueba
            </button>
            <button
              class="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-sm shadow-md text-white text-sm"
              @click.prevent="enviar"
              :disabled="estadoEnviando"
            >
              Enviar lote
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Lista de mensajes -->
    <Transition name="zoom"><MensajePrueba></MensajePrueba> </Transition>
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
