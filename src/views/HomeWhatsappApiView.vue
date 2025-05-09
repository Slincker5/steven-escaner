<script setup>
import { storeMenuAutowhat } from '@/store/storeMenuAutowhat'
import MenuAutoWhat from "@/components/menu/MenuAutoWhat.vue";
import MensajePersonalizado from "@/components/menu/MensajePersonalizado.vue";
import Preview from "@/components/Preview.vue";
const menu = storeMenuAutowhat()

</script>
<template>
    <div class="migrid">
        <MenuAutoWhat></MenuAutoWhat>
        <div>
            <MensajePersonalizado v-if="menu.mensaje_personalizado"></MensajePersonalizado>
            <div v-else>contenido</div>
        </div>
        <div class="w-[400px] bg-white">
            <Transition>
                <Preview v-if="menu.mensaje_personalizado"></Preview>
            </Transition>
        </div>
    </div>
</template>
<style>
.migrid {
    display: grid;
    grid-template-columns: auto 1fr auto;
    height: 100vh;
    background: yellow;
}
</style>