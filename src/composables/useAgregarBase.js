import api from "@/services/api";
import { storeCargarBase } from "@/store/storeCargarBase";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

export const useAgregarBase = () => {
  const baseCargada = storeCargarBase();

  const getBase = async () => {
    try {
      const { data } = await api.get(
        "https://steven.multimarcas.app/api/base/list",
      );
      if (data.length > 0) {
        baseCargada.editarBase(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const limpiarNumero = (n) => {
    if (!n) return "";
    return String(n).replace(/\D/g, "");
  };

  const subirBaseAlServidor = async () => {
    const clientes = baseCargada.base.map((item) => ({
      cliente: item.CLIENTE,
      nombre: item.NOMBRE,
      numero: limpiarNumero(item.NUMERO),
      fecha: item.FECHA,
    }));

    if (clientes.length === 0) return;

    try {
      const { data } = await api.post(
        "https://steven.multimarcas.app/api/base/create",
        clientes,
      );
      toast.success(data.message, {
        theme: "colored",
        autoClose: 1500,
        position: toast.POSITION.BOTTOM_LEFT,
        transition: toast.TRANSITIONS.ZOOM,
      });
      getBase();
    } catch (error) {
      console.log(error);
    }
  };

  return {
    subirBaseAlServidor,
    limpiarNumero,
    getBase,
  };
};
