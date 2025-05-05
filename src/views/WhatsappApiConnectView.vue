<script setup>

import { ref } from "vue";
import axios from "axios";
import { useGetRoutes } from "@/composables/getRoutes";

const { getQr, logoutWhatsapp } = useGetRoutes();

const token = ref(localStorage.getItem("token"))
const qr = ref(false)
const obtenerQr = async () => {
  try {
    const headers = {
      Authorization: "Bearer " + token.value,
    };
    const { data } = await axios.get(getQr, { headers })
    qr.value = data.qr_base64
  } catch (error) {
    console.error(error)
  }
}

obtenerQr()
</script>
<template>
  <div class="overflow-scroll">
    <div class="font-medium text-2xl md:text-3xl p-4">Iniciar sesion en Whatsapp</div>
    <div class="md:flex align-center gap-x-4 p-4">
      <div><img :src="`data:image/png;base64,${qr}`" class="shadow-md shadow-black/30"></div>
      <div>
        <h1 class="pt-4 md:pt-0 font-medium text-lg md:text-2xl">
          Bienvenidos a Autowhats
        </h1>
        <ul class="p-4">
          <li class="pt-0">✅ Mensajes automatizados</li>
          <li class="pt-4">✅ Envio de imagenes</li>
          <li class="pt-4">✅ Envio de imagenes con texto</li>
          <li class="pt-4">✅ Mensajes personalizados</li>
          <li class="pt-4">✅ Cargar base usuarios</li>
        </ul>
      </div>
    </div>
  </div>
</template>