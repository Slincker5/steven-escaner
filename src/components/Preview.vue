<script setup>
import { storeMensajePersonalizado } from '@/store/storeMensajePersonalizado'
import { usePreview } from "@/composables/usePreview";

const mensaje = storeMensajePersonalizado()
const { hora, tiempo } = usePreview()

tiempo()
    setInterval(() => {
      tiempo()
    }, 1000)


</script>

<template>
  <div class="w-[255px] mt-6 m-auto relative">
    <!-- Imagen del celular completa con fondo incluido -->
    <img src="../../../public/mobile.png" class="w-full block relative z-10">

    <!-- Mensajes encima de la pantalla -->
    <div class="absolute top-[45px] left-[14px] w-[228px] h-[460px] z-20 overflow-hidden rounded-[20px]">
      <div class="flex flex-col justify-end h-full p-2">
        <div class="bg-[#d9fdd3] text-[#2a352a] text-[13px] px-3 py-2 rounded-xl shadow max-w-[85%] self-end absolute pb-5 pl-4 text-left" v-if="mensaje">
          {{ mensaje.textareaMensajePersonalizado }}
          <img src="../../public/check-read.png" class="w-[14px] absolute right-2 bottom-2">
          <div class="w-[14px] absolute right-11 bottom-1 text-xs font-light">{{ hora }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
