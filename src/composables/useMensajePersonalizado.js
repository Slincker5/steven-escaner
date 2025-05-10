import { ref } from "vue";
import axios from "axios";
import { useGetRoutes } from "@/composables/getRoutes";

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

      const headers = {
        Authorization: "Bearer " + token.value,
        "Content-Type": "application/json",
      };
      const { data } = await axios.post(createMesagge, dataMensaje, {
        headers,
      });
      if (data.status === "error") sinCategoria.value = true;
    } catch (error) {
      console.error(error);
    }
  };
  return { sms, agregarMensaje };
};
