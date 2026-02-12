<script setup>
import { storeEstatusMensajes } from "@/store/storeEstatusMensajes";
const status = storeEstatusMensajes();
</script>
<template>
  <div class="flex flex-col h-screen">
    <!-- 🟦 HEADER -->
    <div class="p-4 border-b border-dashed border-gray-300 sticky">
      <h2
        class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 pb-4"
      >
        <i class="fa-slab fa-regular fa-circle text-blue-600"></i>
        Progreso de envíos
      </h2>
    </div>
  </div>
</template>
