<script setup>
import { ref } from "vue";
import MensajePrueba from "../enviarMensajes/MensajePrueba.vue";
import { storeEnvioWorker } from "@/store/storeEnvioWorker";
import { storeEnvioAutomatizado } from "@/store/storeEnvioAutomatizado";
import { storeEstatusMensajes } from "@/store/storeEstatusMensajes";
const envioStore = storeEnvioAutomatizado()
const wsFunciones = storeEnvioWorker()
const status = storeEstatusMensajes()

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("message", (event) => {
    status.agregarCliente(event.data)
  });
}

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
                @click="envioStore.deleteImage(false)"
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
            v-model="envioStore.modalSms"
          />
        </div>
        <div class="flex items-center justify-between mt-4">
          <div>
            <!-- Input file oculto -->
            <input
              type="file"
              :ref="(el) => (envioStore.fileInput = el)"
              class="hidden"
              @change="envioStore.handleFileChange"
            />

            <!-- Botón personalizado -->
            <button
              type="button"
              class="hover:bg-gray-300 font-medium px-4 py-2 rounded-md transition-all duration-500 text-sm"
              @click="envioStore.openFileDialog"
            >
              <i class="fa-jelly-duo fa-regular fa-image"></i> Cargar imagen
            </button>
          </div>
          <div class="flex items-center gap-4">
            <button
              class="font-medium px-4 py-2 text-orange-500 hover:bg-orange-100 rounded-md transition-all duration-500"
              @click="envioStore.changeStateModalTest(true)"
            >
              Enviar prueba
            </button>
            <button
              class="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-sm shadow-md text-white text-sm"
              @click.prevent="wsFunciones.iniciarEnvioEnBackground"
            >
              Enviar lote
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Categorías -->
    <div
      class="flex flex-wrap gap-2 p-4 bg-gray-50 border-b border-gray-200 shrink-0"
    >
      <button
        v-for="categoria in envioStore.categorias"
        :key="categoria.uuid"
        @click="envioStore.getMessage(categoria.uuid)"
        class="font-medium uppercase bg-gray-200 text-gray-600 px-3 py-1 rounded-md hover:bg-gray-700 hover:text-white transition-all duration-500"
      >
        {{ categoria.titulo }}
      </button>
    </div>

    <!-- Lista de mensajes -->
    <div
      class="flex-1 overflow-y-auto p-4 pb-20 bg-gray-100 space-y-4 no-scrollbar"
      v-if="envioStore.plantillas.length > 0"
    >
      <div v-for="mensaje in envioStore.plantillas" :key="mensaje.uuid">
        <div class="bg-[#f0eded] p-4 rounded-lg">
          <div class="relative max-w-full sm:max-w-[70%] md:max-w-[60%]">
            <div
              class="bg-white text-gray-800 rounded-2xl px-4 py-3 text-xs sm:text-sm shadow"
            >
              {{ mensaje.mensaje }}
            </div>
            <span
              class="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-r-8 border-r-white"
            ></span>
          </div>
        </div>

        <div
          class="flex items-center justify-end p-2 bg-gray-50 border rounded-sm"
        >
          <button
            class="font-medium bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-700 hover:text-white transition-all duration-500 text-sm"
            @click="envioStore.seleccionarPlantilla(mensaje.mensaje)"
          >
            Seleccionar
          </button>
        </div>
      </div>
    </div>
    <div
      class="flex-1 overflow-y-auto p-4 pb-20 bg-gray-100 space-y-4 no-scrollbar relative"
      v-else
    >
      <div class="mt-20 text-lg font-medium text-center">
        <i class="fa-jelly fa-regular fa-face-frown"></i> No hay plantillas para
        esta categoria
      </div>
    </div>
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
