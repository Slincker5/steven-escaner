<script setup>
import { storeMenuAutowhat } from "@/store/storeMenuAutowhat";
import MenuAutoWhat from "@/components/menu/MenuAutoWhat.vue";
import MensajePersonalizado from "@/components/mensajesPersonalizados/MensajePersonalizado.vue";
import Preview from "@/components/Preview.vue";
import CargarBase from "@/components/globales/cargarBase/CargarBase.vue";
import VistaHistoriaEnvios from "@/components/enviarMensajes/vistaHistoriaEnvios.vue";
import CampoDeTexto from "@/components/mensajesPersonalizados/CampoDeTexto.vue";

const menu = storeMenuAutowhat();
</script>

<template>
  <div class="migrid">
    <!-- MENU IZQUIERDO -->
    <MenuAutoWhat />

    <!-- CONTENIDO PRINCIPAL (ocupa todo el espacio restante) -->
    <div class="relative flex flex-col min-h-0 h-screen bg-gray-50">
      <Transition name="zoom">
        <div v-if="menu.cargar_base" class="flex-1 min-h-0 flex flex-col">
          <CargarBase />
        </div>
      </Transition>

      <Transition name="zoom">
        <div v-if="menu.enviar_mensajes" class="flex-1 min-h-0 overflow-y-auto">
          <CampoDeTexto />
          <VistaHistoriaEnvios />
        </div>
      </Transition>

      <Transition name="zoom">
        <div
          v-if="menu.mensaje_personalizado"
          class="flex-1 min-h-0 overflow-y-auto"
        >
          <MensajePersonalizado />
          <Preview />
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.migrid {
  width: 100%;
  display: grid;
  grid-template-columns: auto 1fr;
  height: 100vh;
  overflow: hidden;
}

/* Animación zoom */
.zoom-enter-active,
.zoom-leave-active {
  transition: all 0.25s ease;
}
.zoom-enter-from,
.zoom-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

/* Scrollbar estético */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 4px;
}
</style>
