<script setup>

import { ref } from 'vue'

const costo = ref("")
const precio = ref("")

const margenDolar = ref("")
const margenPorcentaje = ref("-Infinity")
const porcent = ref("")
const operacion = ref(false)

const treintaPorciento = (costo) => {
    const resultado = (costo / 0.7) * 1.13
    return resultado.toFixed(2)
}

const porcentaje = (op2, op1) => {
    const resultado = op2 / op1 * 100
    return resultado.toFixed(2)
}

const sgp = (costo, precio) => {
    operacion.value = true
    const operacionUno = precio / 1.13
    const operacionDos = operacionUno - costo
    margenDolar.value = operacionDos.toFixed(2)
    margenPorcentaje.value = porcentaje(operacionDos, operacionUno)
    porcent.value = treintaPorciento(costo)

}

const reiniciar = () => {
    operacion.value = false
    precio.value = ""
    costo.value = ""
}
</script>

<template>
    <div class="overflow-y-scroll">
        <h2 class="p-4 pb-2 font-medium uppercase  flex justify-between items-center">Precio de venta
            <button @click.prevent="reiniciar"><font-awesome-icon :icon="['fas', 'rotate-right']" /></button>
        </h2>
        <Transition>
            <div class="bg-gray-100" v-if="operacion">
                <h3 class="text-gray-900 p-4 font-medium uppercase">Resultados: </h3>
                <span v-if="margenPorcentaje !== '-Infinity'" class="block p-4 pt-0">
                    <b class="font-medium uppercase text-gray-700">Margen en dolares:</b> <span class="text-green-500">${{ margenDolar }}</span>
                </span>
                <span v-if="margenPorcentaje !== '-Infinity'" class="block p-4 pt-0">
                    <b class="font-medium uppercase text-gray-700">Margen en porcentaje:</b> <span class="text-green-500">{{ margenPorcentaje }}%</span>
                </span>
                <span v-if="margenPorcentaje == '-Infinity' && margenDolar.length !== 0" class="block p-4 pt-0">
                    <b class="font-medium uppercase text-gray-700">El 30% es:</b> <span class="text-green-500">${{ porcent }}</span>
                </span>
            </div>
        </Transition>
        <form class="p-4" @submit.prevent="sgp(costo, precio)">
            <input type="number" placeholder="Costo del articulo"
                class="px-4 py-3 border border-solid border-[#ddd] block w-full mb-4" autocomplete="off"
                inputmode="numeric" v-model="costo">
            <input type="number" placeholder="Precio del articulo"
                class="px-4 py-3 border border-solid border-[#ddd] block w-full mb-4" autocomplete="off"
                inputmode="numeric" v-model="precio">
            <input type="submit" class="bg-[#005297] block w-full mt-4 px-3 py-2 text-white font-medium rounded-md"
                value="Calcular ganancia">
        </form>
    </div>
</template>