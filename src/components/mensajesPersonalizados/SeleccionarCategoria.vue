<script setup>

import { storeToRefs } from 'pinia'
import { storeMensajePersonalizado } from '@/store/storeMensajePersonalizado'
import { useSeleccionarCategoria } from "@/composables/useSeleccionarCategoria";
import { storeSeleccionarCategoria } from '@/store/storeSeleccionarCategoria'
const categoria = storeSeleccionarCategoria();
const { categoriaSeleccionada, listadoDeCategorias, categoriaErrorSeleccion } = storeToRefs(categoria)
const mensaje = storeMensajePersonalizado();
const { lista, categoriaExistencia } = storeToRefs(mensaje)
const { mostrarOpciones, toggleOpciones, seleccionarOpcion
} = useSeleccionarCategoria();
</script>

<template>
    <div class="relative inline-block" v-if="mensaje.categoriaExistencia">
        <button @click.prevent="toggleOpciones"
            class="border border-solid px-3 py-2 text-sm rounded-md font-medium shadow-sm shadow-black/40 uppercase textoCategoria transition-colors" :class="categoriaErrorSeleccion === true ? 'border-[#797979] text-gray-900' : 'border-red-500 text-red-400'">
            {{ categoriaSeleccionada }}
        </button>

        <nav v-show="mostrarOpciones"
            :class="['absolute left-0 mt-2 w-48 h-44 overflow-y-scroll bg-white border border-gray-300 rounded-md shadow-lg z-30 uppercase noscroll', mostrarOpciones ? 'bounce-in' : '']">
            <ul v-for="item in listadoDeCategorias">
                <li @click.prevent="seleccionarOpcion(item.titulo)"
                    class="text-ellipsis text-nowrap overflow-hidden px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">
                    <font-awesome-icon :icon="['fas', 'tag']" /> {{ item.titulo }}
                </li>
            </ul>
        </nav>

    </div>
</template>
<style scoped>
@keyframes bounceIn {
    0% {
        opacity: 0;
        transform: scale(0.9) translateY(-10%);
    }

    60% {
        opacity: 1;
        transform: scale(1.05) translateY(2%);
    }

    100% {
        transform: scale(1) translateY(0);
    }
}

.bounce-in {
    animation: bounceIn 400ms ease-out;
}

.textoCategoria {
    position: relative;
}

.textoCategoria::after {
    content: 'Categoria:';
    display: inline-block;
    position: absolute;
    font-size: 10px;
    color: #555;
    top: -20px;
    left: 0;
    right: 0;
    font-weight: 600;
    text-transform: capitalize;
}

.noscroll::-webkit-scrollbar {
  display: none;              /* Chrome, Safari */
}
</style>
