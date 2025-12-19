<script setup>
import { storeValidarWhatsapp } from "@/store/storeValidarWhatsapp";
import { storeEstatusMensajes } from "@/store/storeEstatusMensajes";
const status = storeEstatusMensajes();
const validarWhatsapp = storeValidarWhatsapp();
validarWhatsapp.verificarNumeros();
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

      <!-- Totales -->
      <div class="p-2 flex flex-wrap items-center gap-6 text-sm font-medium">
        <div class="flex items-center gap-2 text-green-600">
          <span class="text-xs uppercase">CON WhatsApp:</span>
          <span>
            <i
              v-if="validarWhatsapp.state"
              class="fa-duotone fa-regular fa-spinner-scale fa-spin"
            ></i>
            <span v-else>
              {{ validarWhatsapp.resultado?.conWhatsApp?.total || 0 }}
            </span>
          </span>
        </div>

        <div class="flex items-center gap-2 text-red-600">
          <span class="text-xs uppercase">SIN WhatsApp:</span>
          <span>
            <i
              v-if="validarWhatsapp.state"
              class="fa-duotone fa-regular fa-spinner-scale fa-spin"
            ></i>
            <span v-else>
              {{ validarWhatsapp.resultado?.sinWhatsApp?.total || 0 }}
            </span>
          </span>
        </div>

        <div class="flex items-center gap-2 text-yellow-600">
          <span class="text-xs uppercase">NO VÁLIDOS:</span>
          <span>
            <i
              v-if="validarWhatsapp.state"
              class="fa-duotone fa-regular fa-spinner-scale fa-spin"
            ></i>
            <span v-else>
              {{ validarWhatsapp.resultado?.noValidos?.total || 0 }}
            </span>
          </span>
        </div>
      </div>
    </div>

    <!-- 🟨 CONTENIDO CON SCROLL -->
    <div class="flex-1 min-h-0 overflow-y-auto p-4 scroll-smooth bg-white">
      <TransitionGroup name="zoom" tag="div">
        <div
          v-for="(cliente, index) in status.clientes"
          :key="index"
          class="flex items-center justify-between p-3 border-b border-solid border-[#ddd] hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-center gap-3">
            <img
              :src="cliente.foto"
              class="w-[45px] h-[45px] rounded-full object-cover border border-gray-300"
            />
            <span class="font-medium text-gray-800">
              {{ cliente.numero }} - {{ index }}
            </span>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>
