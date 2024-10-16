<script setup>
import { ref } from "vue";
import axios from "axios";
import { useGetRoutes } from "@/composables/getRoutes";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const { userList, userNoPhoto, approveUser } = useGetRoutes();
const token = ref(localStorage.getItem("token"));
const usuarios = ref([]);

const obtenerUsuarios = async () => {
  try {
    const headers = {
      Authorization: "Bearer " + token.value,
      "Content-Type": "application/json",
    };

    const { data } = await axios.get(userList, { headers });
    usuarios.value = data;
    console.log(data);
  } catch (error) {
    console.log(error);
  }
};

obtenerUsuarios();

const btnAprobar = async (usuario) => {
  try {
    const headers = {
      Authorization: "Bearer " + token.value,
      "Content-Type": "application/json",
    };

    let datos = {
      usuario: usuario,
    };

    const { data } = await axios.post(approveUser, datos, { headers });
    if (data.status === "OK") {
      toast.success(data.message, {
        theme: "colored",
        autoClose: 1500,
        position: toast.POSITION.BOTTOM_LEFT,
        transition: toast.TRANSITIONS.ZOOM,
      });
      obtenerUsuarios();
    } else {
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
</script>
<template>
  <div>
    <h1 class="font-medium text-lg p-4">LISTA DE USUARIOS</h1>

    <div
      class="border-b border-solid border-[#ddd] flex items-center justify-between"
      v-for="user in usuarios.filter((user) => user.verificado === 0)"
      :key="user.user_uuid"
      v-if="usuarios.filter((user) => user.verificado === 0).length > 0"
    >
      <div class="p-4">
        <img
          :src="userNoPhoto"
          class="inline-block rounded-full w-[30px] mr-2"
        />
        <span class="font-medium">{{ user.username }}</span>
      </div>
      <div class="p-4">
        <button
          class="bg-green-500 text-white py-1 px-3 border border-solid border-green-700 rounded-md text-center text-sm"
          @click.prevent="btnAprobar(user.user_uuid)"
        >
          <font-awesome-icon :icon="['fas', 'check']" /> Aprobar
        </button>
      </div>
    </div>
    <div
      class="flex items-center justify-center h-60 text-gray-600 text-lg"
      v-else
    >
      Sin usuarios pendientes
    </div>
  </div>
</template>
