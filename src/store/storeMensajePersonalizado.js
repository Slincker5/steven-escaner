
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const storeMensajePersonalizado = defineStore('MensajePersonalizado', () => {

  const textareaMensajePersonalizado = ref("Escribe tu mensaje")
  const cambiarTextareaMensajePersonalizado = (n) => {
    textareaMensajePersonalizado.value = n
  }

  return { textareaMensajePersonalizado, cambiarTextareaMensajePersonalizado }
})
