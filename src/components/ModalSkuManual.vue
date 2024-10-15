<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import Cargando from "@/components/Cargando.vue";
import EscanerVainilla from "@/components/EscanerVainilla.vue";

defineProps(["modalSku"]);
const emit = defineEmits(["abrirModalSku", "getList", "getListScan", "cerrarModalSku", "startScannerNew"]);

const item = ref([]);
const modalResultado = ref(false);
const sku = ref();
const cargando = ref(false)

const sendSkuManual = async () => {
    try {
        cargando.value = true
        const dataPackage = {
            articulo: sku.value
        };
        const { data } = await axios.put('https://steven.multimarcas.app/api/document/escanear', dataPackage, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (data.status === "error") {
            toast.error(data.message, {
                theme: "colored",
                autoClose: 1500,
                position: toast.POSITION.BOTTOM_LEFT,
                transition: toast.TRANSITIONS.ZOOM,
            });
        } else {
            emit('cerrarModalSku');
            modalResultado.value = true;
            item.value = data.articulos;
            emit('getList');
            emit('getListScan');
        }
    } catch (error) {
        console.log(error);
    } finally {
        cargando.value = false
    }
};

const cerrarModalResultado = () => {
  modalResultado.value = false;
};
</script>

<template>
    <div class="fixed top-0 left-0 w-full h-full bg-black/70 flex items-center justify-center z-40" v-if="modalResultado">
        <div class="bg-white w-[90%] overflow-hidden rounded-md shadow-md shadow-black/80">
            <h2 class="text-green-500 font-medium uppercase p-4 pb-0 flex items-center justify-between">PRODUCTO ESCANEADO CON EXITO!! 
                <button class="text-black" @click.prevent="cerrarModalResultado">
                    <font-awesome-icon :icon="['fas', 'xmark']" />
                </button>
            </h2>
            <div class="font-medium truncate p-4">
                {{ item[0].descripcion }}
            </div>
            <div class="px-4 pb-4">
                <b>SKU:</b> {{ item[0].articulo }}
            </div>
            <div class="px-4 pb-4">
                <b>Costo:</b> {{ item[0].costo }}
            </div>
            <div class="px-4 pb-4">
                <b>Precio:</b> {{ item[0].precio }}
            </div>
            <div class="px-4 pb-4">
                <b>Antiguedad:</b> {{ item[0].antiguedad }}
            </div>
            <div class="gap-4 p-4 pt-0 flex items-center justify-between">
                
                <button class="truncate w-full py-2 px-3 text-center font-medium text-black border border-solid border-[#000] shadow-md shadow-black/20 block uppercase center rounded-sm"
                    @click="emit('abrirModalSku')">
                    <font-awesome-icon :icon="['fas', 'plus']" /> INGRESAR SKU
                </button>
            </div>
        </div>
    </div>
    <Cargando :enviando="cargando" :textoCarga="'Procesando producto ..'"></Cargando>
    <Transition>
        <div class="fixed top-0 left-0 w-full h-full bg-black/70 flex items-center justify-center z-40" v-if="modalSku">
            <div class="p-4 bg-white w-[90%] overflow-hidden rounded-md shadow-md shadow-black/80">
                <h2 class="font-medium mb-4 flex items-center justify-between">
                    INGRESAR SKU
                    <button @click.prevent="emit('cerrarModalSku')">
                        <font-awesome-icon :icon="['fas', 'xmark']" />
                    </button>
                </h2>
                <form @submit.prevent="sendSkuManual">
                    <input type="number" placeholder="Ingrese sku" class="px-4 py-3 border border-solid border-[#ddd] block w-full" autocomplete="off" inputmode="numeric" v-model="sku" required>
                    <input type="submit" class="bg-[#005297] block w-full mt-4 px-3 py-2 text-white font-medium rounded-md" value="BUSCAR PRODUCTO">
                </form>
            </div>
        </div>
    </Transition>
</template>
