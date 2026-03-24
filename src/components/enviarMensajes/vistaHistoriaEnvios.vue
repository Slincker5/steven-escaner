<script setup>
import { ref, nextTick, onMounted, onUnmounted } from "vue";
import { storeCargarBase } from "@/store/storeCargarBase";
import { storeHistorial } from "@/store/storeHistorial";
import { useAutowat } from "@/composables/useAutowat";
import { useSocket } from "@/composables/useSocket";
import { useGetRoutes } from "@/composables/getRoutes";
import * as XLSX from "xlsx";
import BarraProgreso from "./BarraProgreso.vue";

const baseCargada = storeCargarBase();
const historialStore = storeHistorial();
const { get } = useAutowat();
const { conectar, desconectar, on, off } = useSocket();
const { batchReport } = useGetRoutes();

const ultimoBatchId = ref(null);
const descargando = ref(false);

const logContainer = ref(null);
const logs = ref([]);
const countdown = ref(0);

const LOGS_KEY = "autowat_logs";
const guardarLogs = () => {
  try {
    const ultimos = logs.value.slice(-100);
    localStorage.setItem(LOGS_KEY, JSON.stringify(ultimos));
  } catch (e) {}
};
const cargarLogs = () => {
  try {
    const data = localStorage.getItem(LOGS_KEY);
    if (data) logs.value = JSON.parse(data);
  } catch (e) {}
};

const hora = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
};

const agregarLog = (tipo, data) => {
  logs.value.push({
    tipo,
    hora: hora(),
    numero: data.numero || "",
    nombre: data.nombre || "",
    indice: data.indice || 0,
    total: data.total || 0,
    error: data.error || "",
  });
  if (logs.value.length > 200) logs.value.shift();
  guardarLogs();
  nextTick(() => {
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight;
    }
  });
};

const onEnviando = (data) => {
  agregarLog("enviando", data);
  countdown.value = 0;
};

const onEnviado = (data) => {
  const ultimo = logs.value[logs.value.length - 1];
  if (ultimo && ultimo.tipo === "enviando" && ultimo.numero === data.numero) {
    ultimo.tipo = "enviado";
    ultimo.hora = hora();
    guardarLogs();
  } else {
    agregarLog("enviado", data);
  }
  historialStore.enviados = data.enviados;
  historialStore.sinWhatsapp = data.sinWhatsapp;
};

const onSinWhatsapp = (data) => {
  const ultimo = logs.value[logs.value.length - 1];
  if (ultimo && ultimo.tipo === "enviando" && ultimo.numero === data.numero) {
    ultimo.tipo = "sin-whatsapp";
    ultimo.hora = hora();
    guardarLogs();
  } else {
    agregarLog("sin-whatsapp", data);
  }
  historialStore.enviados = data.enviados;
  historialStore.sinWhatsapp = data.sinWhatsapp;
};

const onError = (data) => {
  const ultimo = logs.value[logs.value.length - 1];
  if (ultimo && ultimo.tipo === "enviando" && ultimo.numero === data.numero) {
    ultimo.tipo = "error";
    ultimo.hora = hora();
    ultimo.error = data.error;
    guardarLogs();
  } else {
    agregarLog("error", data);
  }
};

const onCountdown = (data) => {
  countdown.value = data.segundos;
  historialStore.segundosRestantes = data.segundos;
  historialStore.tiempo = historialStore.formatearTiempo(data.segundos);
};

const onInicio = (data) => {
  logs.value = [];
  agregarLog("sistema", { nombre: "Envio iniciado", total: data.total, numero: `${data.total} contactos` });
};

const onFinalizado = (data) => {
  agregarLog("finalizado", { nombre: "Envio finalizado", numero: `${data.enviados} enviados, ${data.sinWhatsapp} sin WA, ${data.errores} errores` });
  countdown.value = 0;
  historialStore.enviando = false;
  if (data.batchId) ultimoBatchId.value = data.batchId;
};

const descargarReporte = async () => {
  if (!ultimoBatchId.value || descargando.value) return;
  descargando.value = true;
  try {
    const { data } = await get(batchReport(ultimoBatchId.value));
    if (!data.numeros || data.numeros.length === 0) {
      agregarLog("sistema", { nombre: "Sin numeros para reportar", numero: "" });
      return;
    }
    const rows = data.numeros.map((n, i) => ({ "#": i + 1, Numero: n.numero, Nombre: n.nombre }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sin WhatsApp");
    XLSX.writeFile(wb, `sin-whatsapp-${ultimoBatchId.value}.xlsx`);
  } catch (e) {
    agregarLog("error", { nombre: "Error descargando reporte", error: e.message });
  } finally {
    descargando.value = false;
  }
};

const onCancelado = (data) => {
  agregarLog("cancelado", { nombre: "Envio cancelado", numero: `${data.enviados} de ${data.total}` });
  countdown.value = 0;
  historialStore.enviando = false;
};

const conectarSocket = () => {
  conectar();

  on("message:batch:enviando", onEnviando);
  on("message:batch:enviado", onEnviado);
  on("message:batch:sin-whatsapp", onSinWhatsapp);
  on("message:batch:error", onError);
  on("message:batch:countdown", onCountdown);
  on("message:batch:inicio", onInicio);
  on("message:batch:finalizado", onFinalizado);
  on("message:batch:cancelado", onCancelado);
};

onMounted(async () => {
  cargarLogs();
  conectarSocket();
  // Recuperar estado si hay envio en curso
  try {
    const { data } = await get("/message/batch-status");
    if (data.enProceso) {
      historialStore.enviando = true;
      historialStore.enviados = data.enviados;
      historialStore.sinWhatsapp = data.sinWhatsapp;
      historialStore.total = data.total;
    }
  } catch (e) {}
  nextTick(() => {
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight;
    }
  });
});

onUnmounted(() => {
  off("message:batch:enviando", onEnviando);
  off("message:batch:enviado", onEnviado);
  off("message:batch:sin-whatsapp", onSinWhatsapp);
  off("message:batch:error", onError);
  off("message:batch:countdown", onCountdown);
  off("message:batch:inicio", onInicio);
  off("message:batch:finalizado", onFinalizado);
  off("message:batch:cancelado", onCancelado);
});
</script>

<template>
  <div class="flex flex-col h-screen">
    <!-- Header -->
    <div class="p-4 border-b border-gray-200 bg-white shrink-0">
      <h2 class="font-medium text-gray-900 flex items-center gap-2">
        <i class="fa-duotone fa-regular fa-satellite-dish text-gray-400"></i>
        Progreso en vivo
      </h2>
    </div>

    <!-- Barra progreso -->
    <Transition name="zoom">
      <div class="p-4 pb-0 shrink-0" v-if="historialStore.enviando">
        <BarraProgreso />
      </div>
    </Transition>

    <!-- Stats -->
    <div class="flex items-center justify-between gap-2 px-4 py-2 text-[11px] text-gray-500 border-b border-gray-100 shrink-0">
      <span><i class="fa-duotone fa-regular fa-users text-gray-400 mr-1"></i>Base: <b class="text-gray-700">{{ baseCargada.base.length || historialStore.total }}</b></span>
      <span v-if="historialStore.enviando"><i class="fa-duotone fa-regular fa-check text-gray-400 mr-1"></i>Enviados: <b class="text-gray-700">{{ historialStore.enviados }}</b></span>
      <span v-if="historialStore.enviando"><i class="fa-duotone fa-regular fa-xmark text-gray-400 mr-1"></i>Sin WA: <b class="text-gray-700">{{ historialStore.sinWhatsapp }}</b></span>
      <span v-if="historialStore.enviando && historialStore.total > 0"><b class="text-gray-700">{{ Math.trunc(historialStore.fmodificarProgreso() / historialStore.total * 100) }}%</b></span>
    </div>

    <!-- Log -->
    <div ref="logContainer" class="flex-1 overflow-y-auto bg-[#1e1e1e] min-h-0">
      <div class="p-3 space-y-0.5">
        <!-- Empty state -->
        <div v-if="!logs.length" class="flex flex-col items-center justify-center py-12 text-gray-600">
          <i class="fa-duotone fa-regular fa-terminal text-2xl mb-3 text-gray-700"></i>
          <span class="text-xs text-gray-600">Esperando envios...</span>
        </div>

        <!-- Log entries -->
        <div
          v-for="(log, i) in logs"
          :key="i"
          class="flex items-start gap-2 text-[11px] leading-relaxed font-mono py-0.5 animate-fadeIn"
        >
          <!-- Hora -->
          <span class="text-gray-600 shrink-0 w-[50px]">{{ log.hora }}</span>

          <!-- Icono estado -->
          <span class="shrink-0 w-3 text-center mt-[2px]">
            <i v-if="log.tipo === 'enviando'" class="fa-duotone fa-regular fa-spinner-third fa-spin text-gray-500 text-[9px]"></i>
            <i v-else-if="log.tipo === 'enviado'" class="fa-duotone fa-regular fa-check text-gray-500 text-[9px]"></i>
            <i v-else-if="log.tipo === 'sin-whatsapp'" class="fa-duotone fa-regular fa-xmark text-gray-500 text-[9px]"></i>
            <i v-else-if="log.tipo === 'error'" class="fa-duotone fa-regular fa-triangle-exclamation text-gray-500 text-[9px]"></i>
            <i v-else-if="log.tipo === 'sistema'" class="fa-duotone fa-regular fa-bolt text-gray-500 text-[9px]"></i>
            <i v-else-if="log.tipo === 'finalizado'" class="fa-duotone fa-regular fa-flag-checkered text-gray-500 text-[9px]"></i>
            <i v-else-if="log.tipo === 'cancelado'" class="fa-duotone fa-regular fa-octagon-exclamation text-gray-500 text-[9px]"></i>
          </span>

          <!-- Contenido -->
          <div class="flex-1 min-w-0">
            <template v-if="log.tipo === 'sistema' || log.tipo === 'finalizado' || log.tipo === 'cancelado'">
              <span class="text-gray-400">{{ log.nombre }}</span>
              <span class="text-gray-600 ml-1">{{ log.numero }}</span>
            </template>

            <template v-else>
              <span class="text-gray-600">[{{ log.indice }}/{{ log.total }}]</span>
              <span class="text-gray-300 ml-1">{{ log.nombre }}</span>
              <span class="text-gray-600 ml-1">{{ log.numero }}</span>
              <span v-if="log.tipo === 'enviado'" class="text-gray-500 ml-1">enviado</span>
              <span v-else-if="log.tipo === 'sin-whatsapp'" class="text-gray-500 ml-1">sin whatsapp</span>
              <span v-else-if="log.tipo === 'error'" class="text-gray-500 ml-1">error</span>
              <span v-else-if="log.tipo === 'enviando'" class="text-gray-500 ml-1">enviando...</span>
            </template>
          </div>
        </div>

        <!-- Boton descargar reporte -->
        <div v-if="ultimoBatchId && !historialStore.enviando" class="flex items-center gap-2 py-2 mt-1">
          <span class="text-gray-600 w-[50px]"></span>
          <button
            @click="descargarReporte"
            :disabled="descargando"
            class="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-700 transition-colors disabled:opacity-50"
          >
            <i :class="descargando ? 'fa-duotone fa-regular fa-spinner-third fa-spin' : 'fa-duotone fa-regular fa-file-excel'" class="text-[9px]"></i>
            {{ descargando ? 'Descargando...' : 'Descargar sin WhatsApp' }}
          </button>
        </div>

        <!-- Countdown -->
        <div v-if="countdown > 0 && historialStore.enviando" class="flex items-center gap-2 text-[11px] font-mono py-1 mt-1">
          <span class="text-gray-600 w-[50px]"></span>
          <span class="w-3 text-center"><i class="fa-duotone fa-regular fa-timer text-gray-500 text-[9px]"></i></span>
          <span class="text-gray-500">siguiente en {{ countdown }}s</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(3px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.15s ease-out;
}
</style>
