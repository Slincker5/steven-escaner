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
    let digits = String(n).replace(/\D/g, "");

    // Normalizar para El Salvador: 503 + 8 dígitos
    // Si viene con 503 al inicio (11 dígitos), quitarlo
    if (digits.length === 11 && digits.startsWith("503")) {
      digits = digits.substring(3);
    }
    // Si son 8 dígitos válidos (empieza con 2-9), agregar 503
    if (/^[2-9]\d{7}$/.test(digits)) {
      return "503" + digits;
    }
    // Si ya tiene código de país válido, retornar tal cual
    return digits;
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
        { base: clientes },
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
