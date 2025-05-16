import { ref } from "vue";
import axios from "axios";
import { storeMensajePersonalizado } from "@/store/storeMensajePersonalizado";
import { useSeleccionarCategoria } from "@/composables/useSeleccionarCategoria";
import { useGetRoutes } from "@/composables/getRoutes";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const { listadoCategoria } = useSeleccionarCategoria();
const mensaje = storeMensajePersonalizado();
const { createCategory } = useGetRoutes();
const token = ref(localStorage.getItem("token"));

export const useCrearCategoria = () => {
  const categoria = ref("");

  const agregarCategoria = async () => {
    try {
      const dataCategory = {
        titulo: categoria.value,
      };

      const headers = {
        Authorization: "Bearer " + token.value,
        "Content-Type": "application/json",
      };
      const { data } = await axios.post(createCategory, dataCategory, {
        headers,
      });
      if (data.status === "OK") {
        listadoCategoria();
        categoria.value = "";
        toast.success(data.message, {
          theme: "colored",
          autoClose: 1500,
          position: toast.POSITION.BOTTOM_LEFT,
          transition: toast.TRANSITIONS.ZOOM,
        });
        mensaje.listaCategoria();
      } else {
        toast.error(data.message, {
          theme: "colored",
          autoClose: 1500,
          position: toast.POSITION.BOTTOM_LEFT,
          transition: toast.TRANSITIONS.ZOOM,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return { categoria, agregarCategoria };
};
