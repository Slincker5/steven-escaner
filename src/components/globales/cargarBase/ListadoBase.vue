<script setup>
import { storeCargarBase } from "@/store/storeCargarBase";
import { useAgregarBase } from "@/composables/useAgregarBase";

const { getBase } = useAgregarBase();
const baseCargada = storeCargarBase();

getBase();

// helper para elegir entre mayúscula/minúscula
const getField = (row, upperKey, lowerKey, fallback = "—") => {
  return row[upperKey] ?? row[lowerKey] ?? fallback;
};
</script>

<template>
  <div class="p-6">
    <h2
      class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b border-dashed border-[#ddd] pb-4"
    >
      <i class="fa-slab fa-regular fa-circle mr-2 text-blue-600"></i>
      Previsualizar contenido
    </h2>

    <div
      v-if="baseCargada.base.length"
      class="max-h-[500px] overflow-y-auto no-scrollbar bg-white rounded-xl shadow-lg shadow-black/10 border border-gray-200 transition-all duration-300"
    >
      <table class="w-full text-sm border-collapse">
        <thead class="sticky top-0 bg-gray-100 shadow-sm z-10">
          <tr>
            <th class="px-4 py-3 text-left font-medium text-gray-700 uppercase text-xs">Cliente</th>
            <th class="px-4 py-3 text-left font-medium text-gray-700 uppercase text-xs">Nombre</th>
            <th class="px-4 py-3 text-left font-medium text-gray-700 uppercase text-xs">Número</th>
            <th class="px-4 py-3 text-left font-medium text-gray-700 uppercase text-xs">Fecha</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, i) in baseCargada.base"
            :key="i"
            class="border-b border-gray-100 hover:bg-blue-50 transition-colors duration-300 cursor-pointer"
          >
            <!-- Cliente -->
            <td class="px-4 py-3 text-gray-900 font-medium">
              <i
                v-if="!getField(row, 'CLIENTE', 'cliente')"
                class="fa-jelly-duo fa-regular fa-face-frown text-red-500"
              ></i>
              {{ getField(row, "CLIENTE", "cliente", "sin ID") }}
            </td>

            <!-- Nombre -->
            <td class="px-4 py-3 text-gray-700">
              <i
                v-if="!getField(row, 'NOMBRE', 'nombre')"
                class="fa-jelly-duo fa-regular fa-face-frown text-yellow-500"
              ></i>
              {{ getField(row, "NOMBRE", "nombre", "sin nombre") }}
            </td>

            <!-- Número -->
            <td class="px-4 py-3 text-gray-700">
              {{ getField(row, "NUMERO", "numero", "sin número") }}
            </td>

            <!-- Fecha -->
            <td class="px-4 py-3 text-gray-700">
              {{ getField(row, "FECHA", "fecha", "sin fecha") }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else class="text-gray-500 mt-6 italic text-sm">No hay base cargada.</p>
  </div>
</template>

<style>
/* Scroll invisible pero funcional */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
