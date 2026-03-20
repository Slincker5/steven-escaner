import { ref } from 'vue'
import { storeToRefs } from 'pinia';
import api from '@/services/api'
import { useGetRoutes } from "@/composables/getRoutes";
import { storeSeleccionarCategoria } from '@/store/storeSeleccionarCategoria'

const { listCategory } = useGetRoutes();

const categoria = storeSeleccionarCategoria();
const { categoriaSeleccionada, listadoDeCategorias } = storeToRefs(categoria)

export const useSeleccionarCategoria = () => {

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
        const { data } = await api.get(listCategory)
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
