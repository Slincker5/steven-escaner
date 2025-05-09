<script setup>
import { storeMenuAutowhat } from '@/store/storeMenuAutowhat'
import { useMenuAutowhat } from "@/composables/useMenuAutowhat";
import CerrarSesionWhatsapp from "@/components/CerrarSesionWhatsapp.vue";
const menu = storeMenuAutowhat()
const {
    photo,
    phone,
    getProfileInfo,
    logout,
    logStatus
} = useMenuAutowhat();

getProfileInfo();

logStatus();
setInterval(() => {
    logStatus();
}, 4000);

</script>
<template>
    <Transition>
        <CerrarSesionWhatsapp v-if="menu.sesion"></CerrarSesionWhatsapp>
    </Transition>

    <nav class="w-[260px] bg-white shadow-lg shadow-black/20">
        <div class="bg-gray-50 pt-8">
            <div
                class="w-[90px] h-[90px] m-auto rounded-full shadow-md shadow-black/40 p-[2px] bg-white border border-solid border-[#ebebeb]">
                <img :src="photo" class="w-full block object-cover rounded-full">
            </div>
            <div class="font-medium text-lg text-center p-4 pb-1 truncate">+{{ phone }}</div>
            <div class="text-green-500 font-medium p-4 pt-0 text-sm text-center">En linea
            </div>
        </div>
        <ul>
            <li><button
                    class="w-full text-left block p-4 py-5 border-b border-solid border-[#e7e7e7] text-gray-700 text-sm hover:bg-gray-100 transition-colors"><font-awesome-icon
                        :icon="['fas', 'database']" /> Cargar base</button></li>
            <li><button
                    class="w-full text-left block p-4 py-5 border-b border-solid border-[#e7e7e7] text-gray-700 text-sm hover:bg-gray-100 transition-colors"><font-awesome-icon
                        :icon="['fas', 'paper-plane']" /> Enviar mensajes</button></li>
            <li><button
                    class="w-full text-left block p-4 py-5 border-b border-solid border-[#e7e7e7] text-gray-700 text-sm hover:bg-gray-100 transition-colors"
                    @click="menu.cambiarMensajePersonalizado(true)"><font-awesome-icon :icon="['fas', 'file-pen']" />
                    Mensajes personalizados</button></li>
            <li><button
                    class="w-full text-left block p-4 py-5 border-b border-solid border-[#e7e7e7] text-gray-700 text-sm hover:bg-gray-100 transition-colors"><font-awesome-icon
                        :icon="['fas', 'clock-rotate-left']" /> Historial de enviados</button></li>
            <li><button
                    class="w-full text-left block p-4 py-5 border-b border-solid border-[#e7e7e7] text-gray-700 text-sm hover:bg-gray-100 transition-colors"
                    @click.prevent="logout"><font-awesome-icon :icon="['fas', 'power-off']" /> Cerrar
                    sesion</button></li>
        </ul>
    </nav>
</template>