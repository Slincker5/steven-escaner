import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import { storeCargarBase } from "@/store/storeCargarBase";

export const storeValidarWhatsapp = defineStore("whatsapp", () => {
  const baseCargada = storeCargarBase();
  const resultado = ref({
    conWhatsApp: { total: 0, clients: [] },
    sinWhatsApp: { total: 0, clients: [] },
    noValidos: { total: 0, clients: [] },
    lastUpdated: null
  });
  const state = ref(false);    // indicador de carga
  const progress = ref(0);     // porcentaje de avance

  const normalizar = (n) => n.replace(/\D/g, "");
  const validarElSalvador = (n) => /^503\d{8}$/.test(n);

  function guardarResultados() {
    // solo guardar si la base existe y tiene registros
    if (Array.isArray(baseCargada.base) && baseCargada.base.length > 0) {
      const data = {
        ...resultado.value,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem("resultadoWhatsApp", JSON.stringify(data));
    } else {
      // si no hay base activa, limpiar cache
      localStorage.removeItem("resultadoWhatsApp");
      console.log("⚠️ Cache limpiado, no hay base activa");
    }
  }

  function cargarResultados() {
    // si la base no existe o está vacía, limpiar cache y retornar false
    if (!Array.isArray(baseCargada.base) || baseCargada.base.length === 0) {
      localStorage.removeItem("resultadoWhatsApp");
      console.log("⚠️ Cache limpiado al cargar, no hay base activa");
      return false;
    }

    const guardado = localStorage.getItem("resultadoWhatsApp");
    if (guardado) {
      resultado.value = JSON.parse(guardado);
      return true;
    }
    return false;
  }

  async function verificarNumeros(force = false) {
    if (!force && cargarResultados()) {
      console.log("✅ Usando cache de localStorage");
      return;
    }

    state.value = true;
    progress.value = 0;

    const grupos = {
      conWhatsApp: { total: 0, clients: [] },
      sinWhatsApp: { total: 0, clients: [] },
      noValidos: { total: 0, clients: [] }
    };

    // ⚡ Usar array real desde el otro store
    const datos = baseCargada.base;

    if (!Array.isArray(datos) || !datos.length) {
      console.error("❌ No hay datos cargados en baseCargada");
      state.value = false;
      return;
    }

    const concurrency = 5;
    let index = 0;
    let procesados = 0;

    async function procesarLote() {
      const lote = datos.slice(index, index + concurrency);
      index += concurrency;

      const promesas = lote.map(async (item) => {
        const limpio = normalizar(item.numero);

        if (!validarElSalvador(limpio)) {
          grupos.noValidos.clients.push(item);
          grupos.noValidos.total++;
        } else {
          try {
            const { data } = await axios.get(
              `https://api.autowat.site/exists?number=${limpio}`
            );
            if (data.ok && data.data.exists) {
              grupos.conWhatsApp.clients.push(item);
              grupos.conWhatsApp.total++;
            } else {
              grupos.sinWhatsApp.clients.push(item);
              grupos.sinWhatsApp.total++;
            }
          } catch {
            grupos.noValidos.clients.push(item);
            grupos.noValidos.total++;
          }
        }

        procesados++;
        progress.value = Math.round((procesados / datos.length) * 100);
      });

      await Promise.all(promesas);

      if (index < datos.length) {
        await new Promise((r) => setTimeout(r, 200));
        await procesarLote();
      }
    }

    await procesarLote();
    resultado.value = { ...grupos, lastUpdated: new Date().toISOString() };
    guardarResultados(); // guarda solo si hay base activa
    state.value = false;
  }

  return {
    resultado,
    state,
    progress,
    verificarNumeros,
    cargarResultados,
    guardarResultados
  };
});
