import { defineStore } from "pinia";
import { ref } from "vue";

export const storeHistorial = defineStore("storeHistorial", () => {
  const enviando = ref(false);
  const enviados = ref(0);
  const sinWhatsapp = ref(0);
  const total = ref(0);
  const tiempo = ref(" ");
  const segundosRestantes = ref(0);

  const fcambiarEstadoEnviar = (n) => {
    enviando.value = n;
  };

  const fcambiarEstadoEnviados = () => {
    enviados.value++;
  };

  const fresetearEnviados = () => {
    enviados.value = 0;
  };
  const fmodifcarSinWhatsapp = () => {
    sinWhatsapp.value++;
  };

  const fmodificarProgreso = () => {
    return enviados.value + sinWhatsapp.value;
  };

  // helper para 2 dígitos
  const pad2 = (n) => String(n).padStart(2, "0");

  const formatearTiempo = (totalSeg) => {
    const seg = Math.max(0, Math.floor(totalSeg));
    const horas = Math.floor(seg / 3600);
    const minutos = Math.floor((seg % 3600) / 60);
    const segundos = seg % 60;
    return `${pad2(horas)}h ${pad2(minutos)}min ${pad2(segundos)}seg`;
  };

  return {
    enviados,
    enviando,
    sinWhatsapp,
    total,
    tiempo,
    segundosRestantes,
    fcambiarEstadoEnviar,
    fcambiarEstadoEnviados,
    fresetearEnviados,
    fmodifcarSinWhatsapp,
    fmodificarProgreso,
    formatearTiempo,
  };
});
