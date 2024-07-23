<script setup>
import { RouterLink, RouterView } from 'vue-router'

</script>

<template>
  <div
    class="grid w-full h-full bg-white grid-rows-auto-1fr-auto fixed md:static top-0 left-0 md:max-w-screen-lg m-auto">
    <header class="p-4 py-5 w-full bg-[#005297] sticky top-0"><router-link class="text-[#ffd107] logo"to="/">MAXIEFECTIVO</router-link>
    </header>


    <RouterView />
  </div>

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
