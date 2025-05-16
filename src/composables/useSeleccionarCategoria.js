import { ref } from 'vue'
import { storeToRefs } from 'pinia';
import axios from 'axios'
import { useGetRoutes } from "@/composables/getRoutes";
import { storeSeleccionarCategoria } from '@/store/storeSeleccionarCategoria'

const { listCategory } = useGetRoutes();

const categoria = storeSeleccionarCategoria();
const { categoriaSeleccionada, listadoDeCategorias } = storeToRefs(categoria)

export const useSeleccionarCategoria = () => {

const token = ref(localStorage.getItem("token"))
const mostrarOpciones = ref(false)

const toggleOpciones = () => {
    listadoCategoria()
    mostrarOpciones.value = !mostrarOpciones.value
}

const seleccionarOpcion = (opcion, uuid) => {
    categoria.modificarSeleccionCategoria(opcion)
    mostrarOpciones.value = false
    categoria.modificarCategoriaErrorSeleccion(true)
    categoria.modificarCategoriaUuid(uuid)
}

const listadoCategoria = async () => {
    try {
        const headers = {
            Authorization: "Bearer " + token.value,
            "Content-Type": "application/json",
        };
        const { data } = await axios.get(listCategory, { headers })
        categoria.modificarListadoCategorias(data)
    } catch (error) {
        console.error(error)
    }
}
  return {
    categoriaSeleccionada,
    listadoDeCategorias,
    mostrarOpciones,
    toggleOpciones,
    seleccionarOpcion,
    listadoCategoria
  };
};
