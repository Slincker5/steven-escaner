<script setup>

import { ref } from 'vue'

const capital = ref("")
const diasTranscurridos = ref("")
const iva = ref(0.1733)
const ivaMoratorio = ref(0.002634)
const resultado = ref(null)


const interesCorriente = () => {
    const dias = diasTranscurridos.value === "" ? 30 : diasTranscurridos.value
    const operacion = ((capital.value*iva.value)/30) * dias
    resultado.value = {
        "interesCorriente": operacion.toFixed(2),
        "interesMoratorio": (operacion + interesMoratorio()).toFixed(2)
    }
}

const interesMoratorio = () => {
    const dias = diasTranscurridos.value === "" ? 30 : diasTranscurridos.value
    const operacion = (capital.value*ivaMoratorio.value) * (dias - 30)
    return operacion
}

const reiniciar = () => {
    resultado.value = null
    capital.value = ""
    diasTranscurridos.value = ""
}

</script>

<template>
    <div class="overflow-y-scroll">
        <h2 class="p-4 pb-2 font-medium uppercase  flex justify-between items-center">Calcular Intereses
            <Transition><button v-if="resultado" @click.prevent="reiniciar"><font-awesome-icon :icon="['fas', 'rotate-right']" /></button></Transition>
            
        </h2>
        <Transition>
                <div class="bg-gray-100" v-if="resultado">
                    <h3 class="text-gray-900 p-4 font-medium uppercase">Intereses: </h3>
                    <span v-if="diasTranscurridos < 30" class="block p-4 pt-0 text-green-500">${{ resultado.interesCorriente }}
                    </span>
                    <span v-else class="block p-4 pt-0 text-green-500">${{ resultado.interesMoratorio }}
                    </span>
                </div>
            </Transition>
        <form class="p-4" @submit.prevent="interesCorriente">

            
            <input type="number" placeholder="Capital"
                class="px-4 py-3 border border-solid border-[#ddd] block w-full mb-4" autocomplete="off"
                inputmode="numeric" v-model="capital">
            <input type="number" placeholder="Dias transcurridos"
                class="px-4 py-3 border border-solid border-[#ddd] block w-full mb-4" autocomplete="off"
                inputmode="numeric" v-model="diasTranscurridos">
            <input type="submit" class="bg-[#005297] block w-full mt-4 px-3 py-2 text-white font-medium rounded-md"
                value="Calcular interes">
        </form>
    </div>
</template>