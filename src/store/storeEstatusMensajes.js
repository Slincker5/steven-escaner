import { defineStore } from "pinia";
import { ref } from "vue";

export const storeEstatusMensajes = defineStore("EstatusMensajes", () => {
  
    const clientes = ref([])
    const duplicar = ref(false)
    
    const agregarCliente = (cliente) => {
        clientes.value.push(cliente)
    }

    const editarDuplicar = (estado) => {
        duplicar.value = estado
    }
  return {
    clientes,
    agregarCliente,
    duplicar,
    editarDuplicar
  };
});
