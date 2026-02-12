<script setup>
import { storeMenuAutowhat } from "@/store/storeMenuAutowhat";
import MenuAutoWhat from "@/components/menu/MenuAutoWhat.vue";
import MensajePersonalizado from "@/components/mensajesPersonalizados/MensajePersonalizado.vue";
import Preview from "@/components/Preview.vue";
import CargarBase from "@/components/globales/cargarBase/CargarBase.vue";
import ListadoBase from "@/components/globales/cargarBase/ListadoBase.vue";
import VistaHistoriaEnvios from "@/components/enviarMensajes/vistaHistoriaEnvios.vue";
import CampoDeTexto from "@/components/mensajesPersonalizados/CampoDeTexto.vue";

const menu = storeMenuAutowhat();

</script>

<template>
  <div class="migrid">
    <!-- 🟦 MENU IZQUIERDO -->
    <MenuAutoWhat />

    <!-- 🟨 CONTENIDO CENTRAL -->
    <div class="relative flex flex-col min-h-0 h-screen bg-gray-50">
      <Transition name="zoom">
        <div v-if="menu.cargar_base" class="flex-1 min-h-0 overflow-y-auto">
          <ListadoBase />
        </div>
      </Transition>

      <Transition name="zoom">
        <div v-if="menu.enviar_mensajes" class="flex-1 min-h-0 overflow-y-auto">
          <CampoDeTexto />
        </div>
      </Transition>

      <Transition name="zoom">
        <div
          v-if="menu.mensaje_personalizado"
          class="flex-1 min-h-0 overflow-y-auto"
        >
          <MensajePersonalizado />
        </div>
      </Transition>
    </div>

    <!-- 🟩 PANEL DERECHO (ASIDE) -->
    <div class="w-[400px] bg-white shadow-lg shadow-black/20 flex flex-col min-h-0">
      <Transition name="zoom">
        <div v-if="menu.cargar_base" class="flex-1 min-h-0 overflow-y-auto">
          <CargarBase />
        </div>
      </Transition>

      <Transition name="zoom">
        <div v-if="menu.enviar_mensajes" class="flex-1 min-h-0 overflow-y-auto">
          <VistaHistoriaEnvios />
        </div>
      </Transition>

      <Transition name="zoom">
        <div v-if="menu.mensaje_personalizado" class="flex-1 min-h-0 overflow-y-auto">
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
  grid-template-columns: auto 1fr auto;
  height: 100vh;
  overflow: hidden; /* evita que el body agregue scroll */
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

/* Scroll suave */
.scroll-smooth {
  scroll-behavior: smooth;
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
