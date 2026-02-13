<script setup>
import axios from "axios";
import { ref, Transition } from "vue";
import { storeEnvioAutomatizado } from "@/store/storeEnvioAutomatizado";
import CargandoForm from "../globales/CargandoForm.vue";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const envioStore = storeEnvioAutomatizado();

const API_HTTP = "https://auto.autowat.site";
const numero = ref("503");
const sendTest = ref(false);
const enviando = ref(false);
const enviar = async () => {
  try {
    enviando.value = true;
    const ruta =
      envioStore.packageMessage.imagenUrl === null
        ? "/message/media"
        : "/message/send";

    envioStore.packageMessage.numero = numero.value;
    envioStore.packageMessage.mensaje = envioStore.mensaje;
    if (!envioStore.packageMessage.imagenUrl) {
      envioStore.packageMessage.imagenUrl = envioStore.imagen;
    }
    const { data } = await axios.post(
      `${API_HTTP}${ruta}`,
      envioStore.packageMessage,
    );
    toast.success(
      `Mensaje de prueba enviado a ${envioStore.packageMessage.numero}`,
      {
        theme: "colored",
        autoClose: 1500,
        position: toast.POSITION.BOTTOM_LEFT,
        transition: toast.TRANSITIONS.ZOOM,
      },
    );
  } catch (error) {
    const status = error?.response?.status;
    console.log(error);
    if (status === 429) {
      toast.success(`Solo puedes enviar 2 mensajes por minuto.`, {
        theme: "colored",
        autoClose: 1500,
        position: toast.POSITION.BOTTOM_LEFT,
        transition: toast.TRANSITIONS.ZOOM,
      });
    }
  } finally {
    enviando.value = false;
  }
};
</script>
<template>
  <div
    class="fixed w-full h-full bg-black/10 top-0 left-0 flex justify-center items-center z-50"
    v-if="envioStore.varAbriModalPrueba"
  >
    <div
      class="bg-white w-96 p-4 shadow-md shadow-black/50 rounded-md relative"
    >
      <Transition name="zoom">
        <div
          class="left-0 top-0 absolute w-full h-full bg-blue-500 flex items-center justify-center text-white font-medium text-xl"
          v-if="sendTest"
        >
          <i
            class="fa-duotone fa-solid fa-spinner-third fa-spin mr-2 text-xl"
          ></i>
          Enviando
        </div>
      </Transition>
      <h1
        class="font-medium text-gray-900 mb-4 flex items-center justify-between"
      >
        <span
          ><i class="fa-jelly fa-regular fa-phone"></i> Envio de prueba</span
        >
        <button @click="envioStore.fAbrirPrueba(false)">
          <i class="fa-jelly fa-regular fa-xmark"></i>
        </button>
      </h1>
      <input
        class="p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Numero de prueba"
        v-model="numero"
      />
      <div class="flex items-center justify-end mt-4">
        <button
          class="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-sm shadow-md text-white text-sm"
          @click="enviar"
        >
          Enviar mensaje
        </button>
      </div>
    </div>
  </div>
  <CargandoForm
    :enviando="enviando"
    textoCarga="Enviando mensaje de prueba, espera..."
  ></CargandoForm>
</template>
