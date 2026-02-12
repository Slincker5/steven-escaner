<script setup>

import { useAgregarBase } from "@/composables/useAgregarBase";
const { fileInfo, onFileChange, inputBase, cargar, subirBaseAlServidor } =
  useAgregarBase();
</script>

<template>
  <div class="p-4">
    <div>
      <h2 class="font-medium text-gray-900 p-4">
        <i class="fa-slab fa-regular fa-circle mr-2"></i>Cargar Base
      </h2>

      <div
        class="flex items-center justify-between bg-gray-50 p-4 mb-8 shadow-sm shadow-black/30 border border-solid border-gray-200 rounded-md"
        v-if="fileInfo"
      >
        <i class="fa-jelly-duo fa-regular fa-file text-2xl"></i>
        <div class="flex-1 px-4 font-medium text-sm text-gray-900">
          {{ fileInfo.nombre }}
        </div>
        <div class="font-semibold text-sm">{{ fileInfo.pesoKb }}</div>
      </div>

      <input
        type="file"
        accept=".xlsx"
        ref="inputBase"
        class="hidden"
        @change="onFileChange"
      />
      <button
        class="w-full bg-gray-600 border border-solid border-gray-700 hover:bg-gray-500 px-4 py-2 rounded-sm shadow-md shadow-black/40 text-white text-sm inline-block"
        @click="cargar"
      >
        <i class="fa-slab fa-regular fa-arrow-up-from-bracket"></i> Seleccionar
        archivo
      </button>

      <a
        href="plantilla.xlsx"
        class="w-full mt-4 bg-green-500 border border-solid border-green-600 hover:bg-green-700 px-4 py-2 rounded-sm shadow-md shadow-black/40 text-white text-sm inline-block text-center"
      >
        <i class="fa-jelly-duo fa-regular fa-paper-plane"></i> Descargar
        plantilla </a
      ><button v-if="fileInfo"
        class="w-full mt-4 bg-green-500 border border-solid border-green-600 hover:bg-green-700 px-4 py-2 rounded-sm shadow-md shadow-black/40 text-white text-sm inline-block"
        @click="subirBaseAlServidor"
      >
        <i class="fa-jelly-duo fa-regular fa-arrow-down"></i> Cargar base
      </button>
    </div>
  </div>
</template>
