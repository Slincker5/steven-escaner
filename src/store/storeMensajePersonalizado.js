import { defineStore } from "pinia";
import { ref, onMounted } from "vue";
import api from "@/services/api";
import { useGetRoutes } from "@/composables/getRoutes";

const { createCategory, listCategory } = useGetRoutes();
export const storeMensajePersonalizado = defineStore(
  "MensajePersonalizado",
  () => {
    const lista = ref(false);
    const textareaMensajePersonalizado = ref("Escribe tu mensaje");
    const categoriaExistencia = ref(false);
    const cambiarTextareaMensajePersonalizado = (n) => {
      textareaMensajePersonalizado.value = n;
    };
    const cambiarEstadoCategoria = (n) => {
      lista.value = n;
    };

    const abrirCrearCategoria = () => {
      cambiarEstadoCategoria(true);
    };
    const cerrarCrearCategoria = () => {
      cambiarEstadoCategoria(false);
    };

    const editarExistenciaCategoria = (n) => {
      categoriaExistencia.value = n
    }

    const listaCategoria = async () => {
      try {
        const { data } = await api.get(listCategory);
        if (data.length > 0) {
          cambiarEstadoCategoria(false);
          editarExistenciaCategoria(true)
        } else {
          cambiarEstadoCategoria(true);
          editarExistenciaCategoria(false)
        }
      } catch (error) {
        console.error(error);
      }
    };

    return {
      textareaMensajePersonalizado,
      cambiarTextareaMensajePersonalizado,
      lista,
      cambiarEstadoCategoria,
      abrirCrearCategoria,
      cerrarCrearCategoria,
      listaCategoria,
      categoriaExistencia
    };
  }
);
