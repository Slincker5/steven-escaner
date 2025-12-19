import { ref } from "vue";
import axios from "axios";
import * as XLSX from "xlsx";
import { storeCargarBase } from "@/store/storeCargarBase";
import { storeValidarWhatsapp } from "@/store/storeValidarWhatsapp";
const validarWhatsapp = storeValidarWhatsapp();
const baseCargada = storeCargarBase();

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
    console.log(baseCargada.base);
  };

  const cargar = () => {
    inputBase.value.click();
  };

  const getBase = async () => {
    try {
      const { data } = await axios.get(
        "https://steven.multimarcas.app/api/base/list",
        { headers }
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

  const eliminarBase = async () => {
    try {
        const { data } = axios.delete(
          "https://steven.multimarcas.app/api/base/delete", { headers }
        );
    } catch (error) {
      console.log(error);
    }
  };

  const subirBaseAlServidor = async () => {
    try {
      eliminarBase()
      baseCargada.base.forEach((item) => {
        const dataPackage = {
          cliente: item.CLIENTE,
          nombre: item.NOMBRE,
          numero: limpiarNumero(item.NUMERO),
          fecha: item.FECHA,
        };
        const { data } = axios.post(
          "https://steven.multimarcas.app/api/base/create",
          dataPackage,
          { headers }
        );
        getBase();
        validarWhatsapp.verificarNumeros(true);
      });
    } catch (error) {
      console.log(error);
    }
  };
  return {
    fileInfo,
    onFileChange,
    inputBase,
    cargar,
    datos,
    getBase,
    subirBaseAlServidor,
  };
};
