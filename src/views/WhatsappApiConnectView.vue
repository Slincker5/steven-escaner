<script setup>
import { ref } from "vue";
import axios from "axios";
import { useGetRoutes } from "@/composables/getRoutes";

const { getQr } = useGetRoutes();

const token = ref(localStorage.getItem("token"))
const qr = ref(false)
const status = ref(false)
const mostrar = ref(true)
const fallo = ref(null)
const obtenerQr = async () => {
  try {
    status.value = true
    const headers = {
      Authorization: "Bearer " + token.value,
    };
    const { data } = await axios.get(getQr, { headers })
    if (data.success === true) mostrar.value = false
    if (data.success === false) fallo.value = true
    qr.value = data.qr_base64
  } catch (error) {
    console.error(error)
  } finally {
    status.value = false
  }
}
</script>

<template>
  <div class="overflow-scroll">
    <div class="font-medium text-2xl md:text-3xl p-4">Iniciar sesión en WhatsApp</div>
    <div class="block md:flex items-center">
      <div class="md:flex align-center gap-x-4 p-4">
        <div class="w-[250px] h-[250px] rounded-md border-4 border-dashed border-black flex items-center justify-center">
          <template v-if="mostrar">
            <button class="bg-green-600 text-white py-2 px-4 rounded-sm" @click="obtenerQr" :disabled="status">
              {{ status ? 'Generando QR...' : fallo ? 'Reintentar nuevamente' : 'Obtener QR' }}
            </button>
          </template>
          <Transition name="zoom">
            <img
              v-if="!mostrar"
              :src="`data:image/png;base64,${qr}`"
              class="shadow-md shadow-black/30 max-w-[240px] max-h-[240px]"
            />
          </Transition>
        </div>

        <div>
          <h1 class="pt-4 md:pt-0 font-medium text-lg md:text-2xl">Bienvenidos a Autowhats</h1>
          <ul class="p-4">
            <li class="pt-0">✅ Mensajes automatizados</li>
            <li class="pt-4">✅ Envío de imágenes</li>
            <li class="pt-4">✅ Envío de imágenes con texto</li>
            <li class="pt-4">✅ Mensajes personalizados</li>
            <li class="pt-4">✅ Cargar base de usuarios</li>
          </ul>
        </div>
      </div>

      <div class="ml-auto hidden md:block">
        <img src="../../public/codigo-qr.png" class="w-[300px]" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.zoom-enter-active {
  transition: all 0.4s ease;
}
.zoom-enter-from {
  opacity: 0;
  transform: scale(0.8);
}
</style>
