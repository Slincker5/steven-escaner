import { ref } from "vue";

export const usePreview = () => {
  const hora = ref(false);

  const tiempo = () => {
    const ahora = new Date();
    const horas = ahora.getHours().toString().padStart(2, "0");
    const minutos = ahora.getMinutes().toString().padStart(2, "0");
    hora.value = `${horas}:${minutos}`;
  };

  return {
    hora,
    tiempo,
  };
};
