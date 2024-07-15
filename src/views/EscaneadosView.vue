<script setup>
import { ref } from 'vue'
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/es";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.locale("es");
dayjs.extend(relativeTime);

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
    console.log(data)
  } catch (error) {
    console.log(error)
  }
}

getList()
getListScan()
</script>

<template>
  <div class="p-4 overflow-y-auto">


    <div class="py-4 font-medium flex items-center justify-between" v-if="noEscaneados">
      <router-link to="/">NO ESCANEADOS <span class="font-medium">({{ noEscaneados.length }})</span></router-link>
      <router-link to="/escaneados">
        ESCANEADOS <span class="font-medium">({{ escaneados.length }})</span>
      </router-link>

    </div>
    <div v-if="escaneados && escaneados.length > 0" v-for="articulo in escaneados"
      class="p-4 border border-solid border-[#ddd] mb-4">
      <div class="truncate font-medium"><font-awesome-icon :icon="['fas', 'tag']" /> {{ articulo.descripcion }}</div>
      <div class="py-2 text-sm">SKU: {{ articulo.articulo }}</div>
      <div class="py-2 text-sm">Escaneado: {{ dayjs(articulo.fecha).fromNow() }}</div>
      <div class="flex items-center justify-between"><span class="text-sm"><b class="font-medium">Costo:</b> {{
        articulo.costo }}</span> <span class="text-sm"><b class="font-medium">Precio:</b> {{ articulo.precio }}</span>
        <span class="text-sm"><b class="font-medium">Antiguedad:</b> {{
          articulo.antiguedad }}</span></div>
    </div>
    <div class="p-4 flex items-center justify-center h-56  font-normal text-gray-700 text-lg" v-else>
      <font-awesome-icon :icon="['fas', 'face-sad-cry']" class="text-lg inline-block mr-3" /> Sin articulos escaneados aun
    </div>

  </div>

</template>
