<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useGetRoutes } from "@/composables/getRoutes";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

//rutas de formularios

const { authRegister } = useGetRoutes();

//datos del registro
const username = ref("");
const pass = ref("");
const repass = ref("");
const statusPass = ref(false);

// funciones
const redireccionar = (url) => {
  window.location.href = url;
};


const togglePass = () => {
  statusPass.value === false
    ? (statusPass.value = true)
    : (statusPass.value = false);
};

const registro = async () => {
  try {
    const param = {
      username: username.value,
      pass: pass.value,
      repass: repass.value
    };
    const { data } = await axios.post(authRegister, param);
    if (data.status === "OK") {
      toast.success(data.message, {
      theme: "colored",
      autoClose: 1500,
      position: toast.POSITION.BOTTOM_LEFT,
      transition: toast.TRANSITIONS.ZOOM,
    });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user_uuid", data.user_uuid);
      localStorage.setItem("username", data.username);
      localStorage.setItem("verificado", data.verificado);
      localStorage.setItem("rol", data.rol);
      redireccionar("/");
    }else{
      toast.error(data.message, {
      theme: "colored",
      autoClose: 1500,
      position: toast.POSITION.BOTTOM_LEFT,
      transition: toast.TRANSITIONS.ZOOM,
    });
    }
  } catch (error) {
    console.error(error);
  }
};
</script>
<template>
  <div class="bg-white">
    <h1 class="p-4 py-6 pb-0 text-base font-medium text-black uppercase">
      Crear cuenta
    </h1>

    <div class="p-4">
      <div
        class="flex items-center justify-between border border-solid border-[#ddd]"
      >
        <div class="px-4 py-3 bg-gray-200 text-neutral-600">
          <font-awesome-icon :icon="['fas', 'user']" />
        </div>
        <input
          class="block w-full px-4 py-3 outline-none appearance-none focus:text-neutral-900 focus:font-medium text-neutral-600 placeholder:text-neutral-500"
          type="text"
          placeholder="N° de tienda"
          autocomplete="off"
          v-model="username"
          required
        />
      </div>

      <div
        class="mt-4 flex items-center justify-between border border-solid border-[#ddd]"
      >
        <div class="px-4 py-3 bg-gray-200 text-neutral-600">
          <font-awesome-icon :icon="['fas', 'key']" />
        </div>
        <input
          class="block w-full px-4 py-3 outline-none appearance-none focus:text-neutral-900 focus:font-medium text-neutral-600 placeholder:text-neutral-500"
          :type="statusPass ? 'text' : 'password'"
          placeholder="Crea una contraseña"
          autocomplete="off"
          v-model="pass"
          required
        />
        <button
          class="px-4 py-3 bg-white text-neutral-600"
          @click.prevent="togglePass"
        >
          <font-awesome-icon
            :icon="statusPass ? 'fas fa-eye-slash' : 'fas fa-eye'"
          />
        </button>
      </div>
      <div
      class="mt-4 flex items-center justify-between border border-solid border-[#ddd]"
    >
      <div class="px-4 py-3 bg-gray-200 text-neutral-600">
        <font-awesome-icon :icon="['fas', 'key']" />
      </div>
      <input
        class="block w-full px-4 py-3 outline-none appearance-none focus:text-neutral-900 focus:font-medium text-neutral-600 placeholder:text-neutral-500"
        :type="statusPass ? 'text' : 'password'"
        placeholder="Repite la contraseña"
        autocomplete="off"
        v-model="repass"
        required
      />
      <button
        class="px-4 py-3 bg-white text-neutral-600"
        @click.prevent="togglePass"
      >
        <font-awesome-icon
          :icon="statusPass ? 'fas fa-eye-slash' : 'fas fa-eye'"
        />
      </button>
    </div>
      <button
        class="transition py-3 px-4 bg-[#1b126d] text-white mt-6 text-sm w-full disabled:bg-[#6a67bb]"
        @click="registro"
      >
        Terminar registro
      </button>
    </div>
  </div>
</template>
