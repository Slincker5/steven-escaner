import { defineStore } from "pinia";
import { ref } from "vue";

export const storeSeleccionarCategoria = defineStore(
  "seleccionarCategoria",
  () => {
    const categoriaSeleccionada = ref("Selecciona categoria");
    const categoriaErrorSeleccion = ref(true);
    const categoriaUuid = ref(null)
    const listadoDeCategorias = ref([]);

    const modificarSeleccionCategoria = (n) => {
      categoriaSeleccionada.value = n;
    };

    const modificarListadoCategorias = (n) => {
      listadoDeCategorias.value = n;
    };

    const modificarCategoriaErrorSeleccion = (n) => {
      categoriaErrorSeleccion.value = n;
    };

    const modificarCategoriaUuid = (n) => {
      categoriaUuid.value = n
    }
    return {
      categoriaSeleccionada,
      modificarSeleccionCategoria,
      listadoDeCategorias,
      modificarListadoCategorias,
      categoriaErrorSeleccion,
      modificarCategoriaErrorSeleccion,
      categoriaUuid,
      modificarCategoriaUuid
    };
  }
);
