<script setup>
import { RouterLink, RouterView } from 'vue-router'

</script>

<template>
  <header class="p-4 py-5 w-full bg-[#005297] text-[#ffd107] sticky top-0 logo">MAXIEFECTIVO
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
