<script setup>
import { storeToRefs } from 'pinia'
import { storeMensajePersonalizado } from '@/store/storeMensajePersonalizado'
import { useCrearCategoria } from "@/composables/useCrearCategoria";

const mensaje = storeMensajePersonalizado();
const { lista, categoriaExistencia } = storeToRefs(mensaje)
const {
    categoria, agregarCategoria
} = useCrearCategoria();

mensaje.listaCategoria()
</script>

<template>
    <div class="absolute w-full h-screen top-0 left-0 flex pt-6 items-start justify-center bg-black/30 backdrop-blur-md shadow-lg z-40"
        v-if="lista">
        <div class="bg-white w-[60%] p-4 shadow-sm shadow-black/50 rounded-md">
            <h2 class="text-gray-900 font-medium text-lg pb-4 flex items-center justify-between">
                Crear Categoria
                <button v-if="categoriaExistencia" @click="mensaje.cerrarCrearCategoria"><font-awesome-icon
                        :icon="['fas', 'xmark']" /></button>
            </h2>
            <form>
                <input type="text"
                    class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 uppercase"
                    placeholder="Ej. COBROS, INACTIVOS, REFILL.." v-model="categoria">
                <div class="flex justify-end"><button
                        class="bg-gray-600 border border-solid border-gray-700 hover:bg-gray-500 px-4 py-2 rounded-sm shadow-md shadow-black/40 text-white text-sm inline-block mt-6"
                        @click.prevent="agregarCategoria">Crear
                        categoria</button></div>
            </form>
        </div>
    </div>

</template>
