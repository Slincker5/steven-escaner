import { defineStore } from "pinia";
import { ref } from "vue";

export const storeCargarBase = defineStore("cargarBase", () => {
  const base = ref([]);

  const editarBase = (n) => {
    base.value = n;
  };

  return {
    base,
    editarBase,
  };
});
