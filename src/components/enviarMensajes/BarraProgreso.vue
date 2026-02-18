<script setup>
import { computed, ref } from "vue";
import { storeCargarBase } from "@/store/storeCargarBase";
import { storeHistorial } from "@/store/storeHistorial";

const baseCargada = storeCargarBase();
const historialStore = storeHistorial();
historialStore.ftiempoEstimado();
const { base } = baseCargada;
</script>
<template>
  <div class="text-gray-500 text-sm flex items-center justify-between pb-2">
    <span class="text-gray-500 text-sm">Tiempo estimado:</span> {{ historialStore.tiempo }}
  </div>
  <div class="relative">
<progress
    :max="base.length"
    :value="historialStore.fmodificarProgreso()"
    class="bar"
  ></progress>
  <div class="textoEnviado"> faltan {{ base.length - historialStore.fmodificarProgreso() }} por enviar</div>
  </div>
  
</template>

<style>
.bar {
  width: 100%;
  height: 14px;
  appearance: none;
  -webkit-appearance: none;
  border: none;
  border-radius: 999px;
  overflow: hidden;
}

.bar::-webkit-progress-bar{
  background: rgba(0,0,0,.10);
  border-radius: 999px;
}

/* Value (relleno) - Chrome/Safari/Edge */
.bar::-webkit-progress-value{
  background: linear-gradient(90deg, #22c55e, #16a34a);
  border-radius: 999px;
  transition: width .25s ease;
}

/* Value (relleno) - Firefox */
.bar::-moz-progress-bar{
  background: linear-gradient(90deg, #22c55e, #16a34a);
  border-radius: 999px;
  transition: width .25s ease;
}

.textoEnviado {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font: 600 10px/1 system-ui, -apple-system, Segoe UI, Roboto, Arial;
  color: rgba(0,0,0,.75);
  pointer-events: none; /* para no bloquear clicks */
  user-select: none;
}
</style>
