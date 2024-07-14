<script setup>
import { ref } from 'vue'
import axios from "axios";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import Cargando from "@/components/Cargando.vue";
import EscanerVainilla from "@/components/EscanerVainilla.vue";


const cargando = ref(false)
const fileInput = ref(null);
const modal = ref(false)

const abrirModal = () => {
  modal.value = true
}

const cerrarModal = () => {
  modal.value = false
}

async function uploadFile() {
  if (!fileInput.value.files.length) return;

  const formData = new FormData();
  formData.append("xlsx_file", fileInput.value.files[0]);

  try {
    cargando.value = true
    const { data } = await axios.post(
      "https://steven.multimarcas.app/api/document/upload",
      formData
    );

    if (data.status === "OK") {
      toast.success(data.message, {
        theme: "colored",
        autoClose: 1500,
        position: toast.POSITION.BOTTOM_LEFT,
        transition: toast.TRANSITIONS.ZOOM,
      });
    }

    // Maneja la respuesta de éxito aquí
  } catch (error) {
    console.error("Error al subir el archivo:", error);
    // Maneja el error aquí
  } finally {
    cargando.value = false
  }
}

const escaneados = ref([])
const noEscaneados = ref([])


const getListScan = async () => {
  try {

    const { data } = await axios.get('https://steven.multimarcas.app/api/document/list')
    escaneados.value = data
  } catch (error) {
    console.log(error)
  }
}

const getList = async () => {
  try {
    const { data } = await axios.get('https://steven.multimarcas.app/api/document/productos-restantes')
    noEscaneados.value = data
  } catch (error) {
    console.log(error)
  }
}

getList()
getListScan()

const startScannerNew = async (barcode) => {
  try {
    const dataPackage = {
      articulo: barcode
    };
    const { data } = await axios.put('https://steven.multimarcas.app/api/document/escanear', dataPackage, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    toast.success(data.message, {
      theme: "colored",
      autoClose: 1500,
      position: toast.POSITION.BOTTOM_LEFT,
      transition: toast.TRANSITIONS.ZOOM,
    });
    getList()
    getListScan()
  } catch (error) {
    console.log(error);
  }
};
</script>

<template>
  <div class="p-4">
    <Cargando :enviando="cargando" :textoCarga="'Cargando base de datos ..'"></Cargando>
    <button
      class="w-full py-2 px-3 center font-medium text-gray-700 border-2 border-dashed border-[#555] block uppercase"
      @click="abrirModal">cargar inventario</button>

    <Transition>
      <div class="fixed top-0 left-0 w-full h-full bg-black/40 flex items-center justify-center" v-if="modal">
        <div class="p-4 bg-white w-[90%]">
          <h2 class="font-medium mb-4 flex items-center justify-between">CARGAR INVENTARIO <button
              class="font-extrabold" @click="cerrarModal">X</button></h2>
          <form @submit.prevent="uploadFile">
            <input type="file" name="xlsx_file" ref="fileInput">
            <input type="submit" class="bg-blue-500 block w-full mt-4 px-3 py-2 text-white font-medium"
              value="CARGAR DOCUMENTO" </form>
        </div>
      </div>
    </Transition>
    <EscanerVainilla @startScannerNew="startScannerNew">
    </EscanerVainilla>
    <div class="py-4 font-medium flex items-center justify-between" v-if="noEscaneados">
      <router-link to="/">NO ESCANEADOS <span class="font-medium">({{ noEscaneados.length }})</span></router-link>
      <router-link to="/escaneados">
        ESCANEADOS <span class="font-medium">({{ escaneados.length }})</span>
      </router-link>

    </div>
    <div class="md:grid md:grid-cols-3 gap-4">

      <div v-if="noEscaneados" v-for="articulo in noEscaneados" class="p-4 border border-solid border-[#ddd] mb-4">
        <div class="truncate font-medium">{{ articulo.descripcion }}</div>
        <div class="py-2 text-sm">BARRA: {{ articulo.articulo }}</div>
        <div class="flex items-center justify-between"><span class="text-sm">Costo: {{ articulo.costo }}</span> <span
            class="text-sm">Precio: {{ articulo.precio }}</span> <span class="text-sm">Antiguedad: {{
              articulo.antiguedad }}</span></div>
      </div>
    </div>

  </div>

</template>
