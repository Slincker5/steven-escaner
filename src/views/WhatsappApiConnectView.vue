<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from 'vue-router'
import { useAutowat } from "@/composables/useAutowat";
import { useSocket } from "@/composables/useSocket";
const router = useRouter()
const { get } = useAutowat();
const { conectado, conectar, on, off } = useSocket();

const qr = ref(false)
const status = ref(false)
let intervalo = null;

const connect = async() => {
  try {
    const { data } = await get("/auth")
    qr.value = data.imagenQr
    status.value = data.listo ? "Conectado" : data.autenticado ? "Autenticando..." : "Esperando QR..."
    if(data.listo === true){
      clearInterval(intervalo)
      router.push('/home-autowhat')
    }
  }catch(error){
    console.log(error)
  }
}

// Handlers de socket
const onQr = (data) => {
  qr.value = data.qr
  status.value = "Esperando QR..."
}

const onAuthenticated = () => {
  status.value = "Autenticado"
}

const onReady = () => {
  status.value = "Conectado"
  clearInterval(intervalo)
  router.push('/home-autowhat')
}

const onDisconnected = () => {
  status.value = "Desconectado"
  qr.value = false
}

const onAuthFailure = (data) => {
  status.value = "Error de autenticacion"
  console.error("Auth failure:", data)
}

onMounted(() => {
  // Peticion inicial para obtener estado actual
  connect()

  // Conectar socket si no esta conectado
  conectar()

  // Listeners de socket para tiempo real
  on("session:qr", onQr)
  on("session:authenticated", onAuthenticated)
  on("session:ready", onReady)
  on("session:disconnected", onDisconnected)
  on("session:auth_failure", onAuthFailure)

  // Fallback con polling cada 10 segundos
  intervalo = setInterval(() => {
    connect()
  }, 10000);
})

onUnmounted(() => {
  if (intervalo) clearInterval(intervalo)
  off("session:qr", onQr)
  off("session:authenticated", onAuthenticated)
  off("session:ready", onReady)
  off("session:disconnected", onDisconnected)
  off("session:auth_failure", onAuthFailure)
})
</script>

<template>
  <div class="overflow-scroll">
    <div class="font-medium text-2xl md:text-3xl p-4">Iniciar sesion en WhatsApp</div>
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
            <li class="pt-4 text-lg">✅ Envio de imagenes</li>
            <li class="pt-4 text-lg">✅ Envio de imagenes con texto</li>
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
