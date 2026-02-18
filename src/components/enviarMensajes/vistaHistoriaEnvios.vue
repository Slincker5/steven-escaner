<script setup>
import { storeCargarBase } from "@/store/storeCargarBase";
import { storeHistorial } from "@/store/storeHistorial";
import BarraProgreso from "./BarraProgreso.vue";

const baseCargada = storeCargarBase();
const historialStore = storeHistorial()
</script>
<template>
  <div class="flex flex-col h-screen">
    <div class="p-4 border-b border-dashed border-gray-300 sticky">
      <h2
        class="text-lg font-semibold text-gray-900 flex items-center gap-2"
      >
        <i class="fa-slab fa-regular fa-circle text-blue-600"></i>
        Progreso de envíos
      </h2>
    </div>
    <Transition name="zoom"><div class="p-4 pb-0" v-if="historialStore.enviando"><BarraProgreso></BarraProgreso></div></Transition>
    <div class="flex items-center justify-between gap-4 p-4 pt-2">
      <div class="text-sm"><span class="text-gray-900 font-medium text-sm">Base de clientes: </span> {{ baseCargada.base.length }}</div>
      <Transition name="zoom"><div class="text-green-600 text-sm" v-if="historialStore.enviando"><span class=" font-medium text-sm">Sin whatsapp:</span>  {{ historialStore.sinWhatsapp }}</div></Transition>
      <Transition name="zoom"><div v-if="historialStore.enviando" class="text-sm"><span class="text-gray-900 font-medium text-sm">Progreso:</span> {{ Math.trunc(historialStore.fmodificarProgreso() / baseCargada.base.length * 100) }}%</div> </Transition>
    </div>
  </div>
</template>
