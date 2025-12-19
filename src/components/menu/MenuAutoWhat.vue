<script setup>
import { storeMenuAutowhat } from "@/store/storeMenuAutowhat";
import { useMenuAutowhat } from "@/composables/useMenuAutowhat";
import CerrarSesionWhatsapp from "@/components/CerrarSesionWhatsapp.vue";
const menu = storeMenuAutowhat();
const { photo, numero, nombre, logout, getInfo, getPhoto, log } =
  useMenuAutowhat();

getInfo();
getPhoto();
</script>
<template>
  <Transition>
    <CerrarSesionWhatsapp v-if="log"></CerrarSesionWhatsapp>
  </Transition>

  <nav class="w-[260px] bg-white shadow-lg shadow-black/20">
    <div class="bg-gray-50 pt-8">
      <div
        class="w-[90px] h-[90px] m-auto rounded-full shadow-md shadow-black/40 p-[2px] bg-white border border-solid border-[#ebebeb]"
      >
        <img :src="photo" class="w-full block object-cover rounded-full" />
      </div>
      <div class="font-medium text-lg text-center p-4 pt-2 pb-1 truncate">
        {{ nombre }}
      </div>
      <div class="flex items-center justify-between pb-4">
        <div
          class="font-medium text-center pl-4 pr-0 py-0 text-gray-700 text-xs"
        >
          <i class="fa-jelly-duo fa-regular fa-mobile"></i>+{{ numero }}
        </div>
        <div class="text-green-500 font-medium px-4 py-0 text-center text-xs">
          <i
            class="fa-jelly-duo fa-regular fa-signal-bars-good text-green-600"
          ></i>
          En linea
        </div>
      </div>
    </div>
    <ul>
      <li>
        <button
          class="w-full text-left block p-4 py-5 border-b border-solid border-[#e7e7e7] transition duration-500"
          :class="
            menu.cargar_base
              ? 'bg-blue-50 text-gray-900 text-sm hover:bg-gray-100'
              : 'bg-white text-gray-700 text-sm hover:bg-gray-50'
          "
          @click="menu.cargarBase(true)"
        >
          <i class="fa-jelly-duo fa-regular fa-arrow-up"></i> Cargar base
        </button>
      </li>
      <li>
        <button
          class="w-full text-left block p-4 py-5 border-b border-solid border-[#e7e7e7] text-gray-700 text-sm hover:bg-gray-100 transition duration-500"
          :class="
            menu.mensaje_personalizado
              ? 'bg-blue-50 text-gray-900 text-sm hover:bg-gray-100'
              : 'bg-white text-gray-700 text-sm hover:bg-gray-100'
          "
          @click="menu.enviarMensajes(true)"
        >
          <i class="fa-jelly-duo fa-regular fa-paper-plane"></i> Enviar mensajes
        </button>
      </li>
      <li>
        <button
          class="w-full text-left block p-4 py-5 border-b border-solid border-[#e7e7e7] transition duration-500"
          :class="
            menu.mensaje_personalizado
              ? 'bg-blue-50 text-gray-900 text-sm hover:bg-gray-100'
              : 'bg-white text-gray-700 text-sm hover:bg-gray-100'
          "
          @click="menu.cambiarMensajePersonalizado(true)"
        >
          <i class="fa-jelly-duo fa-regular fa-palette"></i> Mensajes
          personalizados
        </button>
      </li>
      <li>
        <button
          class="w-full text-left block p-4 py-5 border-b border-solid border-[#e7e7e7] text-gray-700 text-sm hover:bg-gray-100 transition-colors"
        >
          <i class="fa-jelly-duo fa-regular fa-list-ol"></i> Historial de
          enviados
        </button>
      </li>
      <li>
        <button
          class="w-full text-left block p-4 py-5 border-b border-solid border-[#e7e7e7] text-gray-700 text-sm hover:bg-gray-100 transition-colors"
          @click.prevent="logout"
        >
          <i class="fa-jelly-duo fa-regular fa-arrow-right-from-bracket"></i>
          Salir de whatsapp
        </button>
      </li>
    </ul>
  </nav>
</template>
