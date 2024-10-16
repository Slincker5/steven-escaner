<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useGetRoutes } from "@/composables/getRoutes";
import CargandoFrom from "@/components/globales/CargandoForm.vue";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const { authLogin } = useGetRoutes();
const enviando = ref(false);
// PARA USUARIOS ACTUALES
const username = ref("");
const pass = ref("");

const redireccionar = (url) => {
  window.location.href = url;
};

const login = async () => {
  try {
    enviando.value = true;
    let credenciales = {
      username: username.value,
      pass: pass.value,
    };
    const { data } = await axios.post(authLogin, credenciales);

    if (data.status === "OK") {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user_uuid", data.user_uuid);
      localStorage.setItem("username", data.username);
      localStorage.setItem("verificado", data.verificado);
      localStorage.setItem("rol", data.rol);
      redireccionar("/");
    } else {
      enviando.value = false;
      toast.error(data.message, {
        theme: "colored",
        autoClose: 1500,
        position: toast.POSITION.BOTTOM_LEFT,
        transition: toast.TRANSITIONS.ZOOM,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const statusPass = ref(false);
let showPass;
onMounted(() => {
  const inputPass = document.getElementById("inputPass");
  showPass = () => {
    statusPass.value = !statusPass.value;
    if (statusPass.value) {
      inputPass.type = "text";
    } else {
      inputPass.type = "password";
    }
  };
});
</script>
<template>
  <div class="p-4">
    <h1 class="pb-4 font-medium text-xl">Iniciar sesion</h1>
    <form class=" pt-0" @submit.prevent="login">
      <CargandoFrom
        :enviando="enviando"
        :textoCarga="' Inciando sesion ..'"
      ></CargandoFrom>
      <div
        class="flex items-center justify-between border border-solid border-[#ddd]"
      >
        <div class="px-4 py-3 bg-gray-200 text-neutral-600">
          <font-awesome-icon :icon="['fas', 'user']" />
        </div>
        <input
          class="block w-full px-4 py-3 outline-none appearance-none focus:text-neutral-900 focus:font-medium text-neutral-500 placeholder:text-neutral-500"
          type="text"
          placeholder="N° tienda"
          autocomplete="off"
          v-model="username"
          required
        />
      </div>

      <div
        class="flex items-center justify-between border border-solid border-[#ddd] mt-8"
      >
        <div class="px-4 py-3 bg-gray-200 text-neutral-600">
          <font-awesome-icon :icon="['fas', 'key']" />
        </div>
        <input
          class="block w-full px-4 py-3 outline-none appearance-none focus:text-neutral-900 focus:font-medium text-neutral-600 placeholder:text-neutral-500"
          type="password"
          placeholder="Contraseña"
          autocomplete="off"
          v-model="pass"
          id="inputPass"
          required
        />
        <a
          href="#"
          class="px-4 py-3 bg-white text-neutral-600"
          @click.prevent="showPass"
        >
          <font-awesome-icon :icon="['fas', 'eye-slash']" v-if="statusPass" />
          <font-awesome-icon :icon="['fas', 'eye']" v-else />
        </a>
      </div>
      <br />
      <input
        type="submit"
        class="block my-4 w-full px-4 py-2 text-sm font-medium rounded text-white bg-[#005297] hover:bg-[#37474F] border border-solid border-[#303E46] shadow-lg"
        value="Iniciar sesion"
      />
    </form>
    <router-link to="/register"  class="block text-center w-full px-4 py-2 text-sm font-medium rounded text-white bg-[#005297] hover:bg-[#37474F] border border-solid border-[#303E46] shadow-lg">Crear Cuenta</router-link>
  </div>
</template>
