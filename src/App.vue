<script setup>
import { ref } from "vue";
import { RouterLink, RouterView } from "vue-router";
const token = ref(localStorage.getItem("token"));
const redireccionar = (url) => {
  window.location.href = url;
};
const logout = () => {
  localStorage.removeItem("user_uuid");
  localStorage.removeItem("username");
  localStorage.removeItem("token");
  localStorage.removeItem("rol");
  redireccionar("/login");
};
</script>

<template>
  <div
    class="grid w-full h-full bg-white grid-rows-auto-1fr-auto fixed md:static top-0 left-0 md:max-w-screen-lg m-auto"
  >
    <header
      class="p-4 py-5 w-full bg-[#005297] sticky top-0 flex items-center justify-between"
    >
      <router-link class="text-[#ffd107] logo" to="/">MAXIEFECTIVO</router-link>
      <button class="text-white" v-if="token" @click.prevent="logout">
        Cerrar sesion
      </button>
    </header>

    <RouterView />
  </div>
</template>

<style>
@font-face {
  font-family: "maxiefectivo";
  src: url("../public/maxiefectivo.ttf") format("truetype");
}

.logo {
  font-family: "maxiefectivo";
}
</style>
