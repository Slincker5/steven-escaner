<script setup>
import { storeCargarBase } from "@/store/storeCargarBase";
import { storeHistorial } from "@/store/storeHistorial";

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
    <div class="flex items-center justify-between">
      <div class="p-4"><span>Base actual: </span> {{ baseCargada.base.length }}</div>
      <Transition><div>Progreso: {{ historialStore.enviados }}/{{ baseCargada.base.length }} enviados</div></Transition>  
    </div>
  </div>
</template>
