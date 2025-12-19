import { defineStore } from "pinia";
import { useGetRoutes } from "@/composables/getRoutes";
import { ref, nextTick } from "vue";
import axios from "axios";

export const storeEnvioAutomatizado = defineStore("EnvioAutomatizado", () => {
  // Rutas de la API
  const { listCategory, listMessaggePersonalized, uploadFileMessage } =
    useGetRoutes();

  // Estado principal
  const token = ref(localStorage.getItem("token"));
  const categorias = ref([]);
  const plantillas = ref([]);
  const imagen = ref(false);
  const modalSms = ref("");
  const listaMensajes = ref(null);
  const selectedFile = ref(null);
  const fileInput = ref(null);
  const openModalTest = ref(false);
  const packageMessage = ref({
    imageUrl: false,
  });

  // Funciones ------------------------

  const deleteImage = (n) => {
    packageMessage.value.imageUrl = n;
    imagen.value = n
  };
  const changeStateModalTest = (n) => {
    openModalTest.value = n;
  };

  const getMessage = async (categoria) => {
    try {
      const headers = {
        Authorization: "Bearer " + token.value,
        "Content-Type": "application/json",
      };
      const dataMensaje = { categoria };

      const { data } = await axios.post(listMessaggePersonalized, dataMensaje, {
        headers,
      });

      plantillas.value = data;

      // esperar a que Vue pinte los mensajes y luego bajar al fondo
      await nextTick();
      scrollBottom();
    } catch (error) {
      console.log(error);
    }
  };

  const getCategory = async () => {
    try {
      const headers = {
        Authorization: "Bearer " + token.value,
        "Content-Type": "application/json",
      };

      // Si listCategory es string úsalo, si es función ejecútalo
      const { data } = await axios.get(
        typeof listCategory === "function" ? listCategory() : listCategory,
        { headers }
      );
      categorias.value = data;
    } catch (error) {
      console.log(error);
    }
  };

  const seleccionarPlantilla = (n) => {
    modalSms.value = n; // esto llena el textarea automáticamente
  };

  // 🔑 Forzar scroll al fondo
  const scrollBottom = () => {
    if (listaMensajes.value) {
      listaMensajes.value.scrollTop = listaMensajes.value.scrollHeight;
    }
  };

  // Abrir diálogo de archivos
  const openFileDialog = () => {
    if (fileInput.value) fileInput.value.click();
  };

  // Guardar archivo seleccionado
  const handleFileChange = (event) => {
    if (!event.target.files.length) {
      console.log("Cancelado, no se seleccionó archivo.");
      return;
    }
    selectedFile.value = event.target.files[0];
    uploadFile();
    console.log("Archivo seleccionado:", selectedFile.value.name);
  };

  // Subir archivo a API
  const uploadFile = async () => {
    if (!selectedFile.value) {
      alert("Primero selecciona una imagen");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile.value);

    try {
      const res = await axios.post(uploadFileMessage, formData, {
        headers: {
          Authorization: "Bearer " + token.value,
          "Content-Type": "multipart/form-data",
        },
      });
      imagen.value = res.data.url;
      packageMessage.value.imageUrl = res.data.url;
    } catch (err) {
      console.error("Error al subir:", err);
      alert("Error al subir la imagen");
    }
  };

  // Ejecutar al inicio
  getCategory();

  // Retorno del store ----------------
  return {
    modalSms,
    categorias,
    plantillas,
    imagen,
    listaMensajes,
    fileInput,
    selectedFile,
    openModalTest,
    deleteImage,

    getMessage,
    getCategory,
    seleccionarPlantilla,
    scrollBottom,
    openFileDialog,
    handleFileChange,
    uploadFile,
    changeStateModalTest,
    packageMessage,
  };
});
