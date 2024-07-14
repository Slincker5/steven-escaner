<script setup>
import { RouterLink, RouterView } from 'vue-router'
import EscanerVainilla from "@/components/EscanerVainilla.vue";

const startScannerNew = async (barcode) => {
  try {
    const dataPackage = {
      articulo: barcode
    };
    const { data } = await axios.post(`https://steven.multimarcas.app/api/document/escanear`, dataPackage)

  } catch (error) {
    console.log(error);
  }
};
</script>

<template>
  <header class="flex items-stretch justify-between"><span
      class="p-4 py-5 w-full bg-blue-500  text-yellow-300 font-extrabold">MAXIEFECTIVO</span>
    <EscanerVainilla @startScannerNew="startScannerNew">
    </EscanerVainilla>
  </header>


  <RouterView />
</template>
