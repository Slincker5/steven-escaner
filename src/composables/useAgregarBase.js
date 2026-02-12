import { ref } from "vue";
import axios from "axios";
import * as XLSX from "xlsx";
import { storeCargarBase } from "@/store/storeCargarBase";
const baseCargada = storeCargarBase();
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

export const useAgregarBase = () => {
  const token = ref(localStorage.getItem("token"));
  const headers = {
    Authorization: "Bearer " + token.value,
    "Content-Type": "application/json",
  };

  const inputBase = ref(null);
  const datos = ref([]);
  const fileInfo = ref(null);

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Guardar info del archivo
    fileInfo.value = {
      nombre: file.name,
      extension: file.name.split(".").pop(),
      pesoKb: (file.size / 1024).toFixed(2) + " KB",
      tipo: file.type,
    };

    // Leer archivo como ArrayBuffer
    const buffer = await file.arrayBuffer();

    // Parsear con xlsx
    const workbook = XLSX.read(buffer, { type: "array" });

    // Tomar la hoja "base" (o la primera)
    const sheetName = workbook.SheetNames.includes("base")
      ? "base"
      : workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convertir a JSON (raw:false convierte fechas a Date)
    let data = XLSX.utils.sheet_to_json(worksheet, {
      defval: null,
      raw: false,
      dateNF: "m/d/yyyy",
    });

    // Helper para formatear Date a M/D/YYYY
    const formatMDY = (val) => {
      if (val instanceof Date && !isNaN(val)) {
        return `${
          val.getUTCMonth() + 1
        }/${val.getUTCDate()}/${val.getUTCFullYear()}`;
      }
      return val; // si ya es string o null, lo devuelve como está
    };

    // Post-proceso
    datos.value = data.map((row) => {
      return {
        ...row,
        cliente: String(row.cliente ?? "").padStart(8, "0"),
        fecha: formatMDY(row.FECHA ?? row.fecha), // soporta "FECHA" o "fecha"
      };
    });

    baseCargada.editarBase(datos.value);
  };

  const cargar = () => {
    inputBase.value.value = "";
    inputBase.value.click();
  };

  const getBase = async () => {
    try {
      const { data } = await axios.get(
        "https://steven.multimarcas.app/api/base/list",
        { headers },
      );
      if (data.length > 0) {
        baseCargada.editarBase(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const limpiarNumero = (n) => {
    if (!n) return ""; // si viene null, undefined o vacío
    return String(n).replace(/\D/g, "");
  };

  const subirBaseAlServidor = async () => {
    let clientes = [];
    baseCargada.base.forEach((item) => {
      const dataPackage = {
        cliente: item.CLIENTE,
        nombre: item.NOMBRE,
        numero: limpiarNumero(item.NUMERO),
        fecha: item.FECHA,
      };
      clientes.push(dataPackage);
    });
    try {
      const { data } = await axios.post(
        "https://steven.multimarcas.app/api/base/create",
        clientes,
        { headers },
      );
      toast.success(data.message, {
        theme: "colored",
        autoClose: 1500,
        position: toast.POSITION.BOTTOM_LEFT,
        transition: toast.TRANSITIONS.ZOOM,
      });
      getBase();
      reiniciarEstado(false);
    } catch (error) {
      console.log(error);
    }
  };

  const reiniciarEstado = (n) => {
    fileInfo.value = n;
  };
  return {
    fileInfo,
    onFileChange,
    inputBase,
    cargar,
    datos,
    getBase,
    subirBaseAlServidor,
    reiniciarEstado,
  };
};
