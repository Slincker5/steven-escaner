import { defineStore } from "pinia";
import { ref } from "vue";
export const storeMenuAutowhat = defineStore("menuAutowhat", () => {
  const sesion = ref(false);
  const mensaje_personalizado = ref(false);
  const cargar_base = ref(true);
  const enviar_mensajes = ref(false);

  const modifySesion = (n) => {
    sesion.value = n;
  };
  const cambiarMensajePersonalizado = (n) => {
    enviar_mensajes.value = false;
    cargar_base.value = false;
    mensaje_personalizado.value = n;
  };

  const cargarBase = (n) => {
    mensaje_personalizado.value = false;
    enviar_mensajes.value = false;
    cargar_base.value = n;
  };

  const enviarMensajes = (n) => {
    cargar_base.value = false;
    mensaje_personalizado.value = false;
    enviar_mensajes.value = n;
  };
  return {
    sesion,
    mensaje_personalizado,
    cargar_base,
    enviar_mensajes,
    modifySesion,
    cambiarMensajePersonalizado,
    cargarBase,
    enviarMensajes,
  };
});
