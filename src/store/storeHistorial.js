import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { storeCargarBase } from "@/store/storeCargarBase";

const historialStore = storeCargarBase();

export const storeHistorial = defineStore("storeHistorial", () => {
  const enviando = ref(false);
  const enviados = ref(0);
  const sinWhatsapp = ref(0);
  const tiempo = ref(" ")

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

  const ftiempoEstimado = () => {
    const enviadosTotal = enviados.value + sinWhatsapp.value
    const total = Math.trunc(historialStore.base.length - enviadosTotal) * 30;

    const horas = Math.floor(total / 3600);
    const minutos = Math.floor((total % 3600) / 60);
    const segundos = Math.floor(total % 60);

    tiempo.value = `${pad2(horas)}h ${pad2(minutos)}min ${pad2(segundos)}seg`;
  };
  return {
    enviados,
    enviando,
    sinWhatsapp,
    tiempo,
    fcambiarEstadoEnviar,
    fcambiarEstadoEnviados,
    fresetearEnviados,
    fmodifcarSinWhatsapp,
    fmodificarProgreso,
    ftiempoEstimado
  };
});
