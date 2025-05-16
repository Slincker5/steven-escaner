import { ref } from "vue";
import axios from "axios";
import { storeToRefs } from "pinia";
import { useGetRoutes } from "@/composables/getRoutes";
import { storeSeleccionarCategoria } from "@/store/storeSeleccionarCategoria";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const storeCategoria = storeSeleccionarCategoria();
const { categoriaSeleccionada } = storeToRefs(storeCategoria);

const { createMesagge, listMessagge } = useGetRoutes();
const token = ref(localStorage.getItem("token"));

export const useMensajePersonalizado = () => {
  const sms = ref("");

  const agregarMensaje = async () => {
    try {
      const dataMensaje = {
        mensaje: sms.value,
        categoria: "",
      };
      if (sms.value === "") {
        toast.warn("El campo mensaje no puede estar vacio", {
          theme: "colored",
          autoClose: 1500,
          position: toast.POSITION.BOTTOM_LEFT,
          transition: toast.TRANSITIONS.ZOOM,
        });
        return false;
      } else if (categoriaSeleccionada.value === "Selecciona categoria") {
        storeCategoria.modificarCategoriaErrorSeleccion(false)
        toast.warn("Debes selecionar una categoria para el mensaje.", {
          theme: "colored",
          autoClose: 1500,
          position: toast.POSITION.BOTTOM_LEFT,
          transition: toast.TRANSITIONS.ZOOM,
        });
        return false;
      }

      const headers = {
        Authorization: "Bearer " + token.value,
        "Content-Type": "application/json",
      };
      const { data } = await axios.post(createMesagge, dataMensaje, {
        headers,
      });
      toast.success(data.message, {
        theme: "colored",
        autoClose: 1500,
        position: toast.POSITION.BOTTOM_LEFT,
        transition: toast.TRANSITIONS.ZOOM,
      });
    } catch (error) {
      console.error(error);
    }
  };
  return { sms, agregarMensaje };
};
