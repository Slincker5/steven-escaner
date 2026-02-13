import { defineStore } from "pinia";
import { ref } from "vue"

export const storeHistorial = defineStore("storeHistorial", () => {
    const enviando = ref(false)
    const enviados = ref(0)

    const fcambiarEstadoEnviar = (n) => {
        enviando.value = n
    } 

    const fcambiarEstadoEnviados = () => {
        enviados.value ++
    }
    return {
        enviados,
        enviando,
        fcambiarEstadoEnviar,
        fcambiarEstadoEnviados
    }
})