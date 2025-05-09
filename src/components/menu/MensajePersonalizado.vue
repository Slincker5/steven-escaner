<script setup>
import { ref } from 'vue'
import { storeMensajePersonalizado } from '@/store/storeMensajePersonalizado'
const mensaje = storeMensajePersonalizado()
const sms = ref("")

</script>

<template>
  <form class="p-4">
    {{ sms }}
    <label for="message" class="block mb-2 text-sm font-medium text-gray-900">Your message</label>
    <textarea
      id="message"
      rows="4"
      class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500  dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
      
      placeholder="Write your thoughts here..." v-model="sms" @input="mensaje.cambiarTextareaMensajePersonalizado(sms)" />
  </form>
</template>
