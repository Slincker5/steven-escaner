import { defineStore } from "pinia";
import { ref } from "vue";
export const storeMenuAutowhat = defineStore("menuAutowhat", () => {

  const sesion = ref(false);
  const mensaje_personalizado = ref(false);

  const modifySesion = (n) => {
    sesion.value = n;
  };
  const cambiarMensajePersonalizado = (n) => {
    mensaje_personalizado.value = n;
  };

  return { sesion, mensaje_personalizado, modifySesion, cambiarMensajePersonalizado };
});
