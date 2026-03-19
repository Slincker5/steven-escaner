<script setup>
import CrearCategoria from "@/components/mensajesPersonalizados/CrearCategoria.vue";
import SeleccionarCategoria from "@/components/mensajesPersonalizados/SeleccionarCategoria.vue";
import emoji from "@/components/emoji.vue";
import { storeMensajePersonalizado } from "@/store/storeMensajePersonalizado";
import { useMensajePersonalizado } from "@/composables/useMensajePersonalizado";

const mensaje = storeMensajePersonalizado();
const { sms, agregarMensaje } = useMensajePersonalizado();

const insertarVariable = (variable) => {
  sms.value += variable;
  mensaje.cambiarTextareaMensajePersonalizado(sms.value);
};

const onEmojiSelected = (emoji) => {
  sms.value += emoji;
};
</script>

<template>
  <div class="relative">
    <CrearCategoria />
    <form class="p-4">
      <div class="flex items-center justify-between pb-4 border-b border-dashed border-gray-300 mb-4">
        <h2 class="font-medium text-gray-900">
          <i class="fa-duotone fa-regular fa-palette mr-2 text-blue-600"></i>
          Mensajes Personalizados
        </h2>
        <button
          class="flex items-center gap-2 border border-solid px-3 py-2 text-sm rounded-md font-medium shadow-sm shadow-black/20 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          @click.prevent="mensaje.abrirCrearCategoria"
        >
          <i class="fa-duotone fa-regular fa-folder-plus text-gray-500"></i>
          Nueva Categoria
        </button>
      </div>

      <div class="p-4 bg-white rounded-xl shadow-lg shadow-black/10 border border-gray-200">
        <!-- Variables rapidas -->
        <div class="flex items-center gap-2 mb-3">
          <span class="text-xs text-gray-400 font-medium">Variables:</span>
          <button
            type="button"
            class="px-2 py-1 text-xs bg-gray-50 text-gray-600 border border-gray-200 rounded hover:bg-gray-100 transition-colors"
            @click="insertarVariable('{{nombre}}')"
          >
            <i class="fa-duotone fa-regular fa-user text-[10px] mr-1 text-gray-400"></i>nombre
          </button>
          <button
            type="button"
            class="px-2 py-1 text-xs bg-gray-50 text-gray-600 border border-gray-200 rounded hover:bg-gray-100 transition-colors"
            @click="insertarVariable('{{fecha}}')"
          >
            <i class="fa-duotone fa-regular fa-calendar text-[10px] mr-1 text-gray-400"></i>fecha
          </button>
        </div>

        <!-- Textarea -->
        <textarea
          id="message"
          rows="4"
          class="block p-3 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 resize-none"
          placeholder="Hola {{nombre}}, te recordamos que tu fecha de pago es {{fecha}}..."
          v-model="sms"
          @input="mensaje.cambiarTextareaMensajePersonalizado(sms)"
        />

        <!-- Footer -->
        <div class="flex items-center justify-between mt-4">
          <SeleccionarCategoria />
          <button
            class="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-md shadow-md text-white text-sm transition-colors"
            @click.prevent="agregarMensaje"
          >
            <i class="fa-duotone fa-regular fa-floppy-disk"></i>
            Guardar mensaje
          </button>
        </div>
      </div>
    </form>

    <emoji @emoji-selected="onEmojiSelected" />
  </div>
</template>
