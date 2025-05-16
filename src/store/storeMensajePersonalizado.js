import { defineStore } from "pinia";
import { ref, onMounted } from "vue";
import axios from "axios";
import { useGetRoutes } from "@/composables/getRoutes";

const { createCategory, listCategory } = useGetRoutes();
const token = ref(localStorage.getItem("token"));
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
      console.log(categoriaExistencia.value);
      cambiarEstadoCategoria(true);
    };
    const cerrarCrearCategoria = () => {
      console.log(categoriaExistencia.value);
      cambiarEstadoCategoria(false);
    };

    const editarExistenciaCategoria = (n) => {
      categoriaExistencia.value = n
    }

    const listaCategoria = async () => {
      try {
        const headers = {
          Authorization: "Bearer " + token.value,
          "Content-Type": "application/json",
        };
        const { data } = await axios.get(listCategory, { headers });
        if (data.length > 0) {
          cambiarEstadoCategoria(false);
          editarExistenciaCategoria(true)
          console.log(categoriaExistencia.value);
        } else {
          cambiarEstadoCategoria(true);
          editarExistenciaCategoria(false)

          console.log(categoriaExistencia.value);
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
