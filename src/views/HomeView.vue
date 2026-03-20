<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import api from "@/services/api"
import { useGetRoutes } from "@/composables/getRoutes";
const rol = ref(localStorage.getItem("rol"))

const verificado = ref('')
const username = ref(localStorage.getItem("username"))


const { userProfile } = useGetRoutes();
let intervalo = null;

const getProfile = async() => {
  try {
    const { data } = await api.get(userProfile)
    verificado.value = data[0].verificado
  }catch(error){
    console.error(error)
  }
}

onMounted(() => {
  getProfile()
  intervalo = setInterval(() => {
    getProfile()
  }, 5000)
})

onUnmounted(() => {
  if (intervalo) clearInterval(intervalo)
})
</script>

<template>
  <div class="p-4 overflow-y-scroll">
    <div class="flex items-center justify-between bg-yellow-300 text-yellow-700 text-sm p-4 mb-4 rounded-md" v-if="rol === 'Admin'">Panel de aprobacion <router-link to="/lista-de-aprobacion" class="border border-solid border-yellow-600 px-3 pt-1 text-sm rounded-sm">Ver lista</router-link></div>

    <!-- CARD AUTOWHAT - PRODUCTO ESTRELLA -->
    <div class="relative overflow-hidden rounded-xl mb-6 shadow-xl shadow-blue-900/30">
      <!-- Background gradient -->
      <div class="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900"></div>
      <!-- Decoracion -->
      <div class="absolute top-[-40px] right-[-40px] w-[200px] h-[200px] bg-blue-500/20 rounded-full blur-2xl"></div>
      <div class="absolute bottom-[-30px] left-[-30px] w-[150px] h-[150px] bg-indigo-400/20 rounded-full blur-2xl"></div>

      <div class="relative z-10 p-6 md:p-8">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <!-- Badge -->
            <div class="inline-flex items-center gap-1.5 bg-green-500/20 border border-green-400/30 text-green-300 text-xs font-medium px-3 py-1 rounded-full mb-4">
              <i class="fa-duotone fa-regular fa-sparkles text-[10px]"></i>
              Producto estrella
            </div>

            <h2 class="text-2xl md:text-3xl font-bold text-white mb-2">AutoWhat</h2>
            <p class="text-blue-200 text-sm md:text-base mb-6 max-w-md">
              Envio masivo de mensajes por WhatsApp. Personaliza con variables, adjunta imagenes y automatiza la comunicacion con tus clientes.
            </p>

            <!-- Features -->
            <div class="grid grid-cols-2 gap-3 mb-6">
              <div class="flex items-center gap-2 text-blue-100 text-xs">
                <i class="fa-duotone fa-regular fa-messages text-blue-300"></i>
                Mensajes masivos
              </div>
              <div class="flex items-center gap-2 text-blue-100 text-xs">
                <i class="fa-duotone fa-regular fa-image text-blue-300"></i>
                Imagenes + texto
              </div>
              <div class="flex items-center gap-2 text-blue-100 text-xs">
                <i class="fa-duotone fa-regular fa-brackets-curly text-blue-300"></i>
                Variables dinamicas
              </div>
              <div class="flex items-center gap-2 text-blue-100 text-xs">
                <i class="fa-duotone fa-regular fa-gauge-high text-blue-300"></i>
                Progreso en tiempo real
              </div>
            </div>

            <!-- CTA -->
            <router-link to="/api-connect"
              class="inline-flex items-center gap-2 bg-white text-blue-800 font-semibold text-sm px-6 py-3 rounded-lg shadow-lg shadow-black/20 hover:bg-blue-50 transition-all duration-300">
              <i class="fa-duotone fa-regular fa-paper-plane"></i>
              Comenzar a enviar
              <i class="fa-duotone fa-regular fa-arrow-right text-xs"></i>
            </router-link>
          </div>

          <!-- Icono decorativo -->
          <div class="hidden md:flex items-center justify-center">
            <i class="fa-duotone fa-regular fa-paper-plane text-6xl text-white/10"></i>
          </div>
        </div>

        <!-- Stats bar -->
        <div class="flex items-center gap-6 mt-6 pt-6 border-t border-white/10">
          <div class="text-center">
            <div class="text-white font-bold text-lg">30s</div>
            <div class="text-blue-300 text-[10px] uppercase tracking-wider">Entre envios</div>
          </div>
          <div class="text-center">
            <div class="text-white font-bold text-lg"><i class="fa-duotone fa-regular fa-infinity text-sm"></i></div>
            <div class="text-blue-300 text-[10px] uppercase tracking-wider">Contactos</div>
          </div>
          <div class="text-center">
            <div class="text-white font-bold text-lg"><i class="fa-duotone fa-regular fa-bolt text-sm text-yellow-300"></i></div>
            <div class="text-blue-300 text-[10px] uppercase tracking-wider">WebSocket</div>
          </div>
          <div class="text-center">
            <div class="text-white font-bold text-lg"><i class="fa-duotone fa-regular fa-cloud text-sm"></i></div>
            <div class="text-blue-300 text-[10px] uppercase tracking-wider">En la nube</div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid gap-4">
      <div class="relative flex items-center justify-between rounded-md">
        <div class="fade absolute top-0 left-0 z-20 w-full h-full grid rejilla rounded-md">
  
          <div class="inventario">
            <h2 class="text-gray-200 p-4 text-lg font-medium">Inventario</h2>
            <div class="flex items-center justify-bectween">
  
              <p class="p-4 text-gray-400 pt-0 flex-1 text-sm">El módulo de inventario gestiona el stock, escanea artículos y los
                clasifica como escaneados o no escaneados.</p>
              <div class="p-4 pt-0"><router-link to="/inventario"
                  class="text-gray-100 border border-solid border-[#ddd] px-4 py-2 rounded-sm">Continuar</router-link>
              </div>
            </div>
          </div>
  
        </div>
        <img src="../../public/inventario.jpg" class="block w-full rounded-md h-[200px] object-cover">
  
      </div>

      <div class="relative flex items-center justify-between rounded-md">
        <div class="fade absolute top-0 left-0 z-20 w-full h-full grid rejilla rounded-md">
  
          <div class="inventario">
            <h2 class="text-gray-200 p-4 text-lg font-medium">Precio de Venta</h2>
            <div class="flex items-center justify-between">
  
              <p class="p-4 text-gray-400 pt-0 flex-1 text-sm">El módulo de ventas permite a los usuarios calcular y visualizar el margen de ganancias de manera precisa y eficiente.</p>
              <div class="p-4 pt-0"><router-link to="/precio-venta"
                  class="text-gray-100 border border-solid border-[#ddd] px-4 py-2 rounded-sm">Continuar</router-link>
              </div>
            </div>
          </div>
  
        </div>
        <img src="../../public/ventas.jpg" class="block w-full rounded-md h-[200px] object-cover">
  
      </div>


      <div class="relative flex items-center justify-between rounded-md">
        <div class="fade absolute top-0 left-0 z-20 w-full h-full grid rejilla rounded-md">
  
          <div class="inventario">
            <h2 class="text-gray-200 p-4 text-lg font-medium">Calcular Intereses</h2>
            <div class="flex items-center justify-between">
  
              <p class="p-4 text-gray-400 pt-0 flex-1 text-sm">El módulo de interés calcula de manera precisa cuánto se ha acumulado en intereses según los días transcurridos.</p>
              <div class="p-4 pt-0"><router-link to="/calcular-interes"
                  class="text-gray-100 border border-solid border-[#ddd] px-4 py-2 rounded-sm">Continuar</router-link>
              </div>
            </div>
          </div>
  
        </div>
        <img src="../../public/interes.jpg" class="block w-full rounded-md h-[200px] object-cover">
  
      </div>

      <div class="relative flex items-center justify-between rounded-md">
        <div class="fade absolute top-0 left-0 z-20 w-full h-full grid rejilla rounded-md">
  
          <div class="inventario">
            <h2 class="text-gray-200 p-4 text-lg font-medium">Meta</h2>
            <div class="flex items-center justify-between">
  
              <p class="p-4 text-gray-400 pt-0 flex-1 text-sm">El módulo de metas calcula el ingreso necesario para alcanzar los objetivos financieros establecidos.</p>
              <div class="p-4 pt-0"><router-link to="/inventario"
                  class="text-gray-100 border border-solid border-[#ddd] px-4 py-2 rounded-sm">Continuar</router-link>
              </div>
            </div>
          </div>
  
        </div>
        <img src="../../public/meta.jpg" class="block w-full rounded-md h-[200px] object-cover">
  
      </div>
    </div>
    <div class="fixed top-0 left-0 bg-white flex items-center justify-center z-50 w-full h-full" v-if="verificado == 0">

     <div class="p-6">
      <p class="text-lg font-light text-gray-500 block mb-6">Hola usuario <b>{{ username }}</b> para empezar a usar los servicios del sistema necesitas ser aprobado  por un administrador.</p>
      <div>
        <a href="https://wa.link/25af5u" class="border border-solid border-black px-3 py-2 text-md rounded-md hover:bg-black hover:text-white focus:bg-black focus:text-white transition-all">Solicitar aprobacion</a>
      </div>
     </div> 
    </div>
  </div> 
</template>
<style>
.sombra {
  box-shadow: 0px 0px 5px 1px rgba(0, 0, 0, .2);
}

.fade {
  background: rgb(0, 0, 0);
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.5446953781512605) 30%, rgba(0, 0, 0, 0.96) 70%);
}

.rejilla {
  grid-template-rows: 1fr 1fr;
}

.inventario {
  grid-row-start: 2;
}
</style>