<script setup>
import { ref } from "vue";
import axios from "axios";
import { useGetRoutes } from "@/composables/getRoutes";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import Cargando from "@/components/Cargando.vue";
import EscanerVainilla from "@/components/EscanerVainilla.vue";
import ModalSkuManual from "@/components/ModalSkuManual.vue";

const { uploadFile, listProducts, remainingProducts, scanner, exportStatus } =
  useGetRoutes();
const cargando = ref(false);
const exportando = ref(false)
const fileInput = ref(null);
const modal = ref(false);
const modalSku = ref(false);
const fileName = ref("");
const token = ref(localStorage.getItem("token"));

const abrirModalSku = () => {
  modalSku.value = true;
};

const cerrarModalSku = () => {
  modalSku.value = false;
};

const abrirModal = () => {
  modal.value = true;
};

const cerrarModal = () => {
  modal.value = false;
};

const selectFile = () => {
  fileInput.value.click();
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  fileName.value = file ? file.name : "";
};

async function uploadFiles() {
  if (!fileInput.value.files.length) return;

  const formData = new FormData();
  formData.append("xlsx_file", fileInput.value.files[0]);

  try {
    const headers = {
      Authorization: "Bearer " + token.value,
    };
    cargando.value = true;
    const { data } = await axios.post(uploadFile, formData, { headers });

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
    console.log("Error al subir el archivo:", error);
    // Maneja el error aquí
  } finally {
    cargando.value = false;
    cerrarModal();
    getList();
  }
}
const exportarEstado = async () => {
  try {
    const headers = {
      Authorization: "Bearer " + token.value,
    };
    exportando.value = true;

    // Configurar axios para recibir el archivo como blob
    const response = await axios.post(exportStatus, null, {
      headers,
      responseType: "blob", // Esto permite recibir el archivo como un blob
    });

    // Crear una URL para el blob y simular la descarga
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    // Obtener la fecha y hora actual en el formato YYYY-MM-DD-HHMMSS
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}-${String(
      now.getHours()
    ).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(
      now.getSeconds()
    ).padStart(2, "0")}`;

    // Asignar el nombre del archivo para la descarga
    link.setAttribute("download", `TRIGGER-${formattedDate}.xlsx`);
    // Agregar el enlace al DOM y simular un clic
    document.body.appendChild(link);
    link.click();

    // Limpiar el enlace después de la descarga
    document.body.removeChild(link);
  } catch (error) {
    console.log("Error al descargar el archivo:", error);
    // Maneja el error aquí
  } finally {
    exportando.value = false; // Detiene el indicador de carga
  }
};

const modalResultado = ref(false);
const escaneados = ref([]);
const noEscaneados = ref([]);
const item = ref([]);

const cerrarModalResultado = () => {
  modalResultado.value = false;
};

const getListScan = async () => {
  try {
    const headers = {
      Authorization: "Bearer " + token.value,
      "Content-Type": "application/json",
    };
    const { data } = await axios.get(listProducts, { headers });
    escaneados.value = data;
  } catch (error) {
    console.log(error);
  }
};

const getList = async () => {
  try {
    const headers = {
      Authorization: "Bearer " + token.value,
      "Content-Type": "application/json",
    };
    const { data } = await axios.get(remainingProducts, { headers });
    noEscaneados.value = data;
  } catch (error) {
    console.log(error);
  }
};

getList();
getListScan();

const startScannerNew = async (barcode) => {
  try {
    const headers = {
      Authorization: "Bearer " + token.value,
      "Content-Type": "application/json",
    };
    const dataPackage = {
      articulo: barcode,
    };
    const { data } = await axios.put(scanner, dataPackage, { headers });

    if (data.status === "error") {
      toast.error(data.message, {
        theme: "colored",
        autoClose: 1500,
        position: toast.POSITION.BOTTOM_LEFT,
        transition: toast.TRANSITIONS.ZOOM,
      });
    } else {
      modalResultado.value = true;
      item.value = data.articulos;
      getList();
      getListScan();
    }
  } catch (error) {
    console.log(error);
  }
};
</script>

<template>
  <div class="w-full overflow-y-auto">
    <Cargando
      :enviando="cargando"
      :textoCarga="'Cargando base de datos ..'"
    ></Cargando>
    <Cargando
      :enviando="exportando"
      :textoCarga="'Exportando estado'"
    ></Cargando>
    <Transition>
      <div
        class="fixed top-0 left-0 w-full h-full bg-black/70 flex items-center justify-center z-40"
        v-if="modal"
      >
        <div
          class="p-4 bg-white w-[90%] overflow-hidden rounded-md shadow-md shadow-black/80"
        >
          <h2 class="font-medium mb-4 flex items-center justify-between">
            CARGAR INVENTARIO
            <button @click="cerrarModal">
              <font-awesome-icon :icon="['fas', 'xmark']" />
            </button>
          </h2>
          <form @submit.prevent="uploadFiles">
            <input
              type="file"
              name="xlsx_file"
              accept=".xls, .xlsx"
              ref="fileInput"
              @change="handleFileChange"
              class="hidden"
            />
            <button
              type="button"
              @click="selectFile"
              class="flex items-center justify-center border-[2px] border-dashed border-[#7a7a7a] w-full h-40"
            >
              <div>
                <img
                  src="../../public/upload.png"
                  class="w-[80px] block m-auto"
                />
                <span class="uppercase block pt-4 text-sm"
                  >Selecciona tu documento</span
                >
              </div>
            </button>
            <div v-if="fileName" class="mt-4 truncate">
              <b class="font-medium">Seleccion:</b> {{ fileName }}
            </div>
            <input
              type="submit"
              class="bg-[#005297] block w-full mt-4 px-3 py-2 text-white font-medium"
              value="CARGAR DOCUMENTO"
            />
          </form>
        </div>
      </div>
    </Transition>

    <ModalSkuManual
      :modalSku="modalSku"
      @getList="getList"
      @getListScan="getListScan"
      @abrirModalSku="abrirModalSku"
      @cerrarModalSku="cerrarModalSku"
      @startScannerNew="startScannerNew"
    ></ModalSkuManual>

    <div
      class="flex items-stretch w-full gap-1 p-4 overflow-x-auto bg-white whitespace-nowrap acciones shadow-white/80 shadow-md gap-x-4 sticky top-0 left-0"
    >
      <button
        class="w-full py-2 px-3 text-center font-medium text-black border border-solid border-[#000] shadow-md shadow-black/20 block uppercase center rounded-sm"
        @click="abrirModal"
      >
        <font-awesome-icon :icon="['fas', 'plus']" /> Cargar base
      </button>

      <EscanerVainilla @startScannerNew="startScannerNew"> </EscanerVainilla>

      <button
        class="w-full py-2 px-3 text-center font-medium text-black border border-solid border-[#000] shadow-md shadow-black/20 block uppercase center rounded-sm"
        @click="abrirModalSku()"
      >
        <font-awesome-icon :icon="['fas', 'plus']" /> INGRESAR SKU
      </button>

      <button
        class="w-full py-2 px-3 text-center font-medium text-black border border-solid border-[#000] shadow-md shadow-black/20 block uppercase center rounded-sm"
        @click="exportarEstado()"
        v-if="noEscaneados.length !== 0 || escaneados.length !== 0"
      >
        <font-awesome-icon :icon="['fas', 'file-export']" /> EXPORTAR ESTADO
      </button>
    </div>
    <div
      class="p-4 py-0 font-medium flex items-center justify-between"
      v-if="noEscaneados"
    >
      <router-link to="/inventario"
        >NO ESCANEADOS
        <span class="font-medium"
          >({{ noEscaneados.length }})</span
        ></router-link
      >
      <router-link to="/escaneados">
        ESCANEADOS <span class="font-medium">({{ escaneados.length }})</span>
      </router-link>
    </div>
    <div class="md:grid md:grid-cols-3 gap-4 p-4">
      <div
        v-if="noEscaneados && noEscaneados.length > 0"
        v-for="articulo in noEscaneados"
        class="p-4 border border-solid border-[#ddd] mb-4"
      >
        <div class="truncate font-medium">
          <font-awesome-icon :icon="['fas', 'tag']" />
          {{ articulo.descripcion }}
        </div>
        <div class="py-2 text-sm">SKU: {{ articulo.articulo }}</div>
        <div class="flex items-center justify-between">
          <span class="text-sm"
            ><b class="font-medium">Costo:</b> {{ articulo.costo }}</span
          >
          <span class="text-sm"
            ><b class="font-medium">Precio:</b> {{ articulo.precio }}</span
          >
          <span class="text-sm"
            ><b class="font-medium">Antiguedad:</b>
            {{ articulo.antiguedad }}</span
          >
        </div>
      </div>
      <div
        class="p-4 flex items-center justify-center h-56 font-normal text-gray-700 text-lg"
        v-else
      >
        <font-awesome-icon
          :icon="['fas', 'face-sad-cry']"
          class="text-lg inline-block mr-3"
        />
        La base de datos esta vacia
      </div>
    </div>

    <div
      class="fixed top-0 left-0 w-full h-full bg-black/70 flex items-center justify-center z-40"
      v-if="modalResultado"
    >
      <div
        class="bg-white w-[90%] overflow-hidden rounded-md shadow-md shadow-black/80"
      >
        <h2
          class="text-green-600 font-medium uppercase p-4 pb-0 flex items-center justify-between"
        >
          PRODUCTO ESCANEADO CON EXITO!!
          <button class="text-black" @click.prevent="cerrarModalResultado">
            <font-awesome-icon :icon="['fas', 'xmark']" />
          </button>
        </h2>
        <div class="font-medium truncate p-4">
          {{ item[0].descripcion }}
        </div>
        <div class="px-4 pb-4"><b>SKU:</b> {{ item[0].articulo }}</div>
        <div class="px-4 pb-4"><b>Costo:</b> {{ item[0].costo }}</div>
        <div class="px-4 pb-4"><b>Precio:</b> {{ item[0].precio }}</div>
        <div class="px-4 pb-4"><b>Antiguedad:</b> {{ item[0].antiguedad }}</div>

        <div class="p-4 pt-0">
          <EscanerVainilla @startScannerNew="startScannerNew"></EscanerVainilla>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.acciones::-webkit-scrollbar {
  display: none;
  /* Oculta la barra de desplazamiento en navegadores WebKit (como Chrome/Safari) */
}
</style>
