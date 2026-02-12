import { defineStore } from "pinia";
import { useGetRoutes } from "@/composables/getRoutes";
import { ref } from "vue";
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
  const mensaje = ref("");
  const listaMensajes = ref(null);
  const varImagenSeleccionada = ref(null);
  const fileInput = ref(null);
  const varAbriModalPrueba = ref(false);
  const packageMessage = ref({
    imageUrl: false,
  });

  // Funciones ------------------------

  const quitarImagen = (n) => {
    packageMessage.value.imageUrl = n;
    imagen.value = n
  };
  const fAbrirPrueba = (n) => {
    varAbriModalPrueba.value = n;
  };

  // Abrir diálogo de archivos
  const fAbrirAdministrador = () => {
    if (fileInput.value) fileInput.value.click();
  };

  // Guardar archivo seleccionado
  const fCambioDeImagen = (event) => {
    if (!event.target.files.length) {
      console.log("Cancelado, no se seleccionó archivo.");
      return;
    }
    varImagenSeleccionada.value = event.target.files[0];
    fsubirImagen();
  };

  // Subir archivo a API
  const fsubirImagen = async () => {
    if (!varImagenSeleccionada.value) {
      alert("Primero selecciona una imagen");
      return;
    }

    const formData = new FormData();
    formData.append("file", varImagenSeleccionada.value);

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


  // Retorno del store ----------------
  return {
    mensaje,
    categorias,
    plantillas,
    imagen,
    listaMensajes,
    fileInput,
    varImagenSeleccionada,
    varAbriModalPrueba,
    quitarImagen,
    fAbrirAdministrador,
    fCambioDeImagen,
    fsubirImagen,
    fAbrirPrueba,
    packageMessage,
  };
});
