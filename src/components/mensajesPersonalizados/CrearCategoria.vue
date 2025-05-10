<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useGetRoutes } from "@/composables/getRoutes";
import { storeMensajePersonalizado } from '@/store/storeMensajePersonalizado'
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";


const { createCategory, listCategory } = useGetRoutes();
const token = ref(localStorage.getItem("token"))
const categoria = ref("")

const yaAnimado = ref(false)
const agregarCategoria = async () => {
    try {
        const dataCategory = {
            "titulo": categoria.value
        }

        const headers = {
            Authorization: "Bearer " + token.value,
            "Content-Type": "application/json",
        };
        const { data } = await axios.post(createCategory, dataCategory, { headers })
        if (data.status === "OK") {
            toast.success(data.message, {
                theme: "colored",
                autoClose: 1500,
                position: toast.POSITION.BOTTOM_LEFT,
                transition: toast.TRANSITIONS.ZOOM,
            });
            listaCategoria()
        } else {
            toast.error(data.message, {
                theme: "colored",
                autoClose: 1500,
                position: toast.POSITION.BOTTOM_LEFT,
                transition: toast.TRANSITIONS.ZOOM,
            });
        }
    } catch (error) {
        console.error(error)
    }
}

const lista = ref(true)

const listaCategoria = async () => {
    try {
        const headers = {
            Authorization: "Bearer " + token.value,
            "Content-Type": "application/json",
        };
        const { data } = await axios.get(listCategory, { headers })
        if (data.length) lista.value = false
    } catch (error) {
        console.error(error)
    }
}

listaCategoria()
//const { createMesagge, listMessagge } = useGetRoutes();
</script>

<template>
    <Transition name="zoom" appear v-if="!yaAnimado">
        <div class="absolute w-full h-screen top-0 left-0 flex pt-6 items-start justify-center bg-black/30 backdrop-blur-md shadow-lg"
            v-if="lista">
            <div class="bg-white w-[60%] p-4 shadow-sm shadow-black/50 rounded-md">
                <h2 class="text-gray-900 font-medium text-lg pb-4">
                    Crear Categoria
                </h2>
                <form>
                    <input type="text"
                        class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 uppercase"
                        placeholder="Ej. COBROS, INANCTIVOS, REFILL.." v-model="categoria">
                    <div class="flex justify-end"><button
                            class="bg-gray-600 border border-solid border-gray-700 hover:bg-gray-500 px-4 py-2 rounded-sm shadow-md shadow-black/40 text-white text-sm inline-block mt-6"
                            @click.prevent="listaCategoria">Ver</button><button
                            class="bg-gray-600 border border-solid border-gray-700 hover:bg-gray-500 px-4 py-2 rounded-sm shadow-md shadow-black/40 text-white text-sm inline-block mt-6"
                            @click.prevent="agregarCategoria">Crear
                            categoria</button></div>
                </form>
            </div>
        </div>
    </Transition>

</template>
