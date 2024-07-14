<script setup>
import { RouterLink, RouterView } from 'vue-router'

</script>

<template>
  <header class="flex items-stretch justify-between"><span
      class="p-4 py-5 w-full bg-[#005297]  text-[#ffd107] logo">MAXIEFECTIVO</span>
  </header>


  <RouterView />
</template>


<style>
@font-face {
    font-family: 'maxiefectivo';
    src: url('../public/maxiefectivo.ttf') format('truetype');
}

.logo {
    font-family: 'maxiefectivo';
}

</style>
