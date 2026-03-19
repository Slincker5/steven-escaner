<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useGetRoutes } from "@/composables/getRoutes";
import { storeEnvioAutomatizado } from "@/store/storeEnvioAutomatizado";

const { listCategory, listMessagge } = useGetRoutes();
const envioStore = storeEnvioAutomatizado();

const token = ref(localStorage.getItem("token"));
const headers = { Authorization: "Bearer " + token.value, "Content-Type": "application/json" };

const abierto = ref(false);
const categorias = ref([]);
const mensajes = ref([]);
const categoriaActiva = ref(null);
const cargando = ref(false);

const cargarCategorias = async () => {
  try {
    const { data } = await axios.get(listCategory, { headers });
    categorias.value = Array.isArray(data) ? data : [];
  } catch (e) { console.log(e); }
};

const seleccionarCategoria = async (cat) => {
  categoriaActiva.value = cat.uuid;
  cargando.value = true;
  try {
    const { data } = await axios.post(listMessagge, { categoria: cat.uuid }, { headers });
    mensajes.value = Array.isArray(data) ? data : [];
  } catch (e) { console.log(e); }
  cargando.value = false;
};

const usarPlantilla = (msg) => {
  envioStore.mensaje = msg.mensaje;
  abierto.value = false;
};

const toggle = () => {
  abierto.value = !abierto.value;
  if (abierto.value && !categorias.value.length) {
    cargarCategorias();
  }
};

onMounted(cargarCategorias);
</script>

<template>
  <div class="relative">
    <button
      type="button"
      class="hover:bg-gray-100 font-medium px-3 py-2 rounded-md transition-all text-sm text-gray-700 border border-gray-200"
      @click="toggle"
    >
      <i class="fa-duotone fa-regular fa-rectangle-list mr-1 text-gray-500"></i>
      Plantillas
    </button>

    <!-- Dropdown -->
    <div
      v-if="abierto"
      class="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl shadow-black/10 z-40 overflow-hidden"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50">
        <span class="text-sm font-medium text-gray-700">
          <i class="fa-duotone fa-regular fa-bookmark mr-1 text-gray-400"></i>
          Mensajes guardados
        </span>
        <button @click="abierto = false" class="text-gray-400 hover:text-gray-600">
          <i class="fa-duotone fa-regular fa-xmark"></i>
        </button>
      </div>

      <div class="flex max-h-64">
        <!-- Categorias -->
        <div class="w-28 border-r border-gray-100 overflow-y-auto shrink-0">
          <button
            v-for="cat in categorias"
            :key="cat.uuid"
            @click="seleccionarCategoria(cat)"
            class="w-full text-left px-3 py-2.5 text-xs truncate transition-colors border-b border-gray-50"
            :class="categoriaActiva === cat.uuid ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50'"
          >
            <i class="fa-duotone fa-regular fa-tag mr-1 text-gray-400 text-[10px]"></i>
            {{ cat.titulo }}
          </button>
          <div v-if="!categorias.length" class="p-3 text-[10px] text-gray-400 text-center">
            Sin categorias
          </div>
        </div>

        <!-- Mensajes -->
        <div class="flex-1 overflow-y-auto">
          <div v-if="!categoriaActiva" class="p-4 text-xs text-gray-400 text-center">
            Selecciona una categoria
          </div>
          <div v-else-if="cargando" class="p-4 text-xs text-gray-400 text-center">
            <i class="fa-duotone fa-regular fa-spinner-third fa-spin mr-1"></i> Cargando...
          </div>
          <div v-else-if="!mensajes.length" class="p-4 text-xs text-gray-400 text-center">
            Sin mensajes en esta categoria
          </div>
          <button
            v-else
            v-for="msg in mensajes"
            :key="msg.uuid"
            @click="usarPlantilla(msg)"
            class="w-full text-left p-3 text-xs text-gray-700 hover:bg-blue-50 transition-colors border-b border-gray-50 leading-relaxed"
          >
            <div class="line-clamp-3">{{ msg.mensaje }}</div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
