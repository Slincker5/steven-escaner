<script setup>
import axios from "axios";
import { ref } from "vue";
import { useRouter } from 'vue-router'
const router = useRouter()

const mostrar = ref(true)
const qr = ref(false)
const status = ref(false)

const connect = async() => {
  try {
    const { data } = await axios.get("https://auto.autowat.site/auth")
    console.log(data.imagenQr)
    qr.value = data.imagenQr
    if(data.autenticado === true){
      router.push('/home-autowhat')
    }
  }catch(error){
    console.log(error)
  }
}

setInterval(() => {
  connect()
}, 3000);
</script>

<template>
  <div class="overflow-scroll">
    <div class="font-medium text-2xl md:text-3xl p-4">Iniciar sesión en WhatsApp</div>
    <div class="block md:flex items-center">
      <div class="md:flex align-center gap-x-6 p-4">
        <div
          class="w-[300px] h-[300px] rounded-md border-4 border-dashed border-black flex items-center justify-center  m-auto">
          
          <Transition name="zoom">
            <img :src="`${qr}`"
              class="shadow-md shadow-black/30 max-w-[300px] max-h-[300px]" />
          </Transition>
        </div>

        <div>
          <h1 class="pt-4 md:pt-0 font-medium text-lg md:text-3xl">Bienvenidos a Autowhats</h1>
          <ul class="p-4">
            {{  status }}
            <li class="pt-0 text-lg">✅ Mensajes automatizados</li>
            <li class="pt-4 text-lg">✅ Envío de imágenes</li>
            <li class="pt-4 text-lg">✅ Envío de imágenes con texto</li>
            <li class="pt-4 text-lg">✅ Mensajes personalizados</li>
            <li class="pt-4 text-lg">✅ Cargar base de usuarios</li>
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
