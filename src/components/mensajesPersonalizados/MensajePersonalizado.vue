<script setup>
import CrearCategoria from "@/components/mensajesPersonalizados/CrearCategoria.vue";
import SeleccionarCategoria from "@/components/mensajesPersonalizados/SeleccionarCategoria.vue";

import emoji  from "@/components/emoji.vue";
import { storeMensajePersonalizado } from "@/store/storeMensajePersonalizado";
import { useMensajePersonalizado } from "@/composables/useMensajePersonalizado";
import { ref } from 'vue'
const mensaje = storeMensajePersonalizado();
const {
  sms, agregarMensaje
} = useMensajePersonalizado();
</script>

<template>
  <div class="relative">
    <CrearCategoria></CrearCategoria>
    <form class="p-4">
      <label for="message" class="p-4 pt-0 border-b mb-4 border-dashed border-[#ddd] flex items-center justify-between">
        <h2 class="text-sm font-medium text-gray-900">Mensaje Personalizados</h2>
        <div>
          <button
            class="border border-solid border-gray-500 rounded-md text-gray-500 shadow-sm shadow-black/35 px-4 py-1"
            @click.prevent="mensaje.abrirCrearCategoria">Agregar
            Categoria</button>
        </div>
      </label>
      <textarea id="message" rows="4"
        class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500  dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
        placeholder="Escribe tu mensaje..." v-model="sms" @input="mensaje.cambiarTextareaMensajePersonalizado(sms)" />
      <div class="flex items-center justify-between mt-6">
        <button
          class="bg-gray-600 border border-solid border-gray-700 hover:bg-gray-500 px-4 py-2 rounded-sm shadow-md shadow-black/40 text-white text-sm inline-block"
          @click.prevent="agregarMensaje">Agregar
          mensaje</button>
        <SeleccionarCategoria></SeleccionarCategoria>
      </div>
    </form>
    
    <emoji></emoji>
  </div>
</template>
