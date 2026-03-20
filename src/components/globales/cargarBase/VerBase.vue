<script setup>
import { ref, computed, onMounted } from "vue";
import api from "@/services/api";
import { toast } from "vue3-toastify";

// ── State ──
const data = ref([]);
const loading = ref(false);
const searchQuery = ref("");
const selectedIds = ref(new Set());
const editingCell = ref(null); // { uuid, field }
const editBuffer = ref("");
const savingCell = ref(null); // uuid of row currently saving
const savedCell = ref(null); // uuid of row just saved
const addingRow = ref(false);
const newRow = ref({ cliente: "", nombre: "", numero: "", fecha: "" });
const deletingIds = ref(new Set());

// ── API calls ──
const loadData = async () => {
  loading.value = true;
  try {
    const res = await api.get("https://steven.multimarcas.app/api/base/list");
    data.value = Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error("Error cargando base:", error);
    toast.error("Error al cargar la base", {
      theme: "colored",
      autoClose: 2000,
      position: toast.POSITION.BOTTOM_LEFT,
    });
  } finally {
    loading.value = false;
  }
};

const addClient = async () => {
  if (!newRow.value.numero.trim()) {
    toast.warning("El número es requerido", {
      theme: "colored",
      autoClose: 1500,
      position: toast.POSITION.BOTTOM_LEFT,
    });
    return;
  }
  try {
    await api.post("https://steven.multimarcas.app/api/base/add", {
      cliente: newRow.value.cliente,
      nombre: newRow.value.nombre,
      numero: newRow.value.numero,
      fecha: newRow.value.fecha,
    });
    toast.success("Cliente agregado", {
      theme: "colored",
      autoClose: 1500,
      position: toast.POSITION.BOTTOM_LEFT,
      transition: toast.TRANSITIONS.ZOOM,
    });
    newRow.value = { cliente: "", nombre: "", numero: "", fecha: "" };
    addingRow.value = false;
    await loadData();
  } catch (error) {
    console.error("Error agregando cliente:", error);
    toast.error("Error al agregar cliente", {
      theme: "colored",
      autoClose: 2000,
      position: toast.POSITION.BOTTOM_LEFT,
    });
  }
};

const updateClient = async (row, field, newValue) => {
  const oldValue = String(row[field] ?? "");
  if (newValue === oldValue) return;

  savingCell.value = row.uuid + "-" + field;
  try {
    await api.put("https://steven.multimarcas.app/api/base/update", {
      uuid: row.uuid,
      cliente: field === "cliente" ? newValue : row.cliente,
      nombre: field === "nombre" ? newValue : row.nombre,
      numero: field === "numero" ? newValue : row.numero,
      fecha: field === "fecha" ? newValue : row.fecha,
    });
    row[field] = newValue;
    savedCell.value = row.uuid + "-" + field;
    setTimeout(() => {
      if (savedCell.value === row.uuid + "-" + field) savedCell.value = null;
    }, 1200);
  } catch (error) {
    console.error("Error actualizando cliente:", error);
    toast.error("Error al guardar", {
      theme: "colored",
      autoClose: 2000,
      position: toast.POSITION.BOTTOM_LEFT,
    });
  } finally {
    savingCell.value = null;
  }
};

const deleteClient = async (uuid) => {
  if (!confirm("¿Eliminar este cliente?")) return;
  deletingIds.value.add(uuid);
  try {
    await api.delete(`https://steven.multimarcas.app/api/base/delete/${uuid}`);
    data.value = data.value.filter((r) => r.uuid !== uuid);
    selectedIds.value.delete(uuid);
    toast.success("Cliente eliminado", {
      theme: "colored",
      autoClose: 1500,
      position: toast.POSITION.BOTTOM_LEFT,
      transition: toast.TRANSITIONS.ZOOM,
    });
  } catch (error) {
    console.error("Error eliminando cliente:", error);
    toast.error("Error al eliminar", {
      theme: "colored",
      autoClose: 2000,
      position: toast.POSITION.BOTTOM_LEFT,
    });
  } finally {
    deletingIds.value.delete(uuid);
  }
};

const deleteSelected = async () => {
  if (selectedIds.value.size === 0) return;
  if (!confirm(`¿Eliminar ${selectedIds.value.size} clientes seleccionados?`)) return;
  const ids = Array.from(selectedIds.value);
  for (const uuid of ids) {
    deletingIds.value.add(uuid);
    try {
      await api.delete(`https://steven.multimarcas.app/api/base/delete/${uuid}`);
      data.value = data.value.filter((r) => r.uuid !== uuid);
      selectedIds.value.delete(uuid);
    } catch (error) {
      console.error("Error eliminando cliente:", error);
    } finally {
      deletingIds.value.delete(uuid);
    }
  }
  toast.success("Clientes eliminados", {
    theme: "colored",
    autoClose: 1500,
    position: toast.POSITION.BOTTOM_LEFT,
    transition: toast.TRANSITIONS.ZOOM,
  });
};

// ── Filtering ──
const filteredData = computed(() => {
  if (!searchQuery.value.trim()) return data.value;
  const q = searchQuery.value.toLowerCase();
  return data.value.filter((row) =>
    [row.cliente, row.nombre, row.numero, row.fecha]
      .some((v) => String(v ?? "").toLowerCase().includes(q))
  );
});

// ── Selection ──
const allSelected = computed(() => {
  if (filteredData.value.length === 0) return false;
  return filteredData.value.every((r) => selectedIds.value.has(r.uuid));
});

const toggleSelectAll = () => {
  if (allSelected.value) {
    filteredData.value.forEach((r) => selectedIds.value.delete(r.uuid));
  } else {
    filteredData.value.forEach((r) => selectedIds.value.add(r.uuid));
  }
};

const toggleSelect = (uuid) => {
  if (selectedIds.value.has(uuid)) {
    selectedIds.value.delete(uuid);
  } else {
    selectedIds.value.add(uuid);
  }
};

// ── Inline editing ──
const startEdit = (uuid, field, currentValue) => {
  editingCell.value = { uuid, field };
  editBuffer.value = String(currentValue ?? "");
};

const commitEdit = (row) => {
  if (!editingCell.value) return;
  const { field } = editingCell.value;
  const newValue = editBuffer.value;
  editingCell.value = null;
  updateClient(row, field, newValue);
};

const cancelEdit = () => {
  editingCell.value = null;
  editBuffer.value = "";
};

const isEditing = (uuid, field) => {
  return editingCell.value && editingCell.value.uuid === uuid && editingCell.value.field === field;
};

// ── New row keyboard handling ──
const onNewRowKeydown = (event, field) => {
  if (event.key === "Enter") {
    const fields = ["cliente", "nombre", "numero", "fecha"];
    const idx = fields.indexOf(field);
    if (idx === fields.length - 1) {
      addClient();
    }
  }
  if (event.key === "Escape") {
    addingRow.value = false;
    newRow.value = { cliente: "", nombre: "", numero: "", fecha: "" };
  }
};

const getField = (row, field) => row[field] ?? row[field.toUpperCase()] ?? "";

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="flex flex-col h-full select-none font-['Calibri',_sans-serif]">

    <!-- ════════════ TITLE BAR ════════════ -->
    <div class="bg-[#217346] px-4 py-1.5 flex items-center justify-between flex-shrink-0">
      <div class="flex items-center gap-2">
        <i class="fa-solid fa-database text-white/90 text-base"></i>
        <span class="text-white font-semibold text-sm tracking-wide">Base de Clientes</span>
        <span class="text-white/60 text-xs ml-2">{{ data.length }} registros</span>
      </div>
    </div>

    <!-- ════════════ TOOLBAR ════════════ -->
    <div class="bg-[#f6f6f6] border-b border-[#e0e0e0] px-3 py-2 flex items-center justify-between flex-shrink-0">
      <div class="flex items-center gap-2">
        <button
          @click="addingRow = !addingRow"
          class="flex items-center gap-1.5 bg-[#217346] hover:bg-[#1a5c38] text-white text-xs px-3 py-1.5 rounded-[3px] transition-colors"
        >
          <i class="fa-solid fa-plus text-[11px]"></i>
          <span>Agregar cliente</span>
        </button>

        <button
          @click="deleteSelected"
          :disabled="selectedIds.size === 0"
          class="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-[3px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <i class="fa-solid fa-trash-can text-[11px]"></i>
          <span>Eliminar seleccionados ({{ selectedIds.size }})</span>
        </button>

        <button
          @click="loadData"
          :disabled="loading"
          class="flex items-center gap-1.5 bg-white border border-[#d4d4d4] hover:bg-[#f0f0f0] text-[#333] text-xs px-3 py-1.5 rounded-[3px] transition-colors disabled:opacity-50"
        >
          <i class="fa-solid fa-rotate text-[11px]" :class="{ 'fa-spin': loading }"></i>
          <span>Refrescar</span>
        </button>
      </div>

      <div class="flex items-center gap-1">
        <i class="fa-solid fa-magnifying-glass text-[11px] text-gray-400"></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar en todas las columnas..."
          class="bg-white border border-[#d4d4d4] rounded-sm px-2 py-1 text-[12px] outline-none focus:border-[#0078d4] w-[220px]"
        />
      </div>
    </div>

    <!-- ════════════ TABLE ════════════ -->
    <div class="flex-1 overflow-auto bg-white relative">
      <!-- Loading -->
      <div v-if="loading && data.length === 0" class="flex items-center justify-center py-12">
        <i class="fa-solid fa-rotate fa-spin text-[#217346] text-2xl"></i>
      </div>

      <!-- Empty state -->
      <div v-else-if="data.length === 0 && !addingRow" class="flex flex-col items-center justify-center py-12 text-gray-400">
        <i class="fa-solid fa-database text-4xl mb-3"></i>
        <span class="text-sm">No hay registros en la base</span>
      </div>

      <!-- Data table -->
      <table v-else class="border-collapse text-[13px] font-['Calibri',_sans-serif]" style="table-layout: fixed; width: 100%;">
        <colgroup>
          <col style="width: 36px;" />
          <col style="width: 44px;" />
          <col style="width: auto;" />
          <col style="width: auto;" />
          <col style="width: auto;" />
          <col style="width: auto;" />
          <col style="width: 60px;" />
        </colgroup>
        <thead class="sticky top-0 z-20">
          <tr>
            <th
              class="bg-[#e6e6e6] border-b border-r border-[#bfbfbf] cursor-pointer hover:bg-[#d4d4d4] transition-colors"
              style="height: 24px;"
              @click="toggleSelectAll"
            >
              <div class="flex items-center justify-center">
                <input type="checkbox" :checked="allSelected" @click.stop="toggleSelectAll" class="accent-[#217346]" />
              </div>
            </th>
            <th class="bg-[#e6e6e6] border-b border-r border-[#bfbfbf] text-[11px] font-medium text-[#333]" style="height: 24px;">#</th>
            <th class="bg-[#e6e6e6] border-b border-r border-[#bfbfbf] text-[11px] font-medium text-[#333]" style="height: 24px;">Cliente</th>
            <th class="bg-[#e6e6e6] border-b border-r border-[#bfbfbf] text-[11px] font-medium text-[#333]" style="height: 24px;">Nombre</th>
            <th class="bg-[#e6e6e6] border-b border-r border-[#bfbfbf] text-[11px] font-medium text-[#333]" style="height: 24px;">Numero</th>
            <th class="bg-[#e6e6e6] border-b border-r border-[#bfbfbf] text-[11px] font-medium text-[#333]" style="height: 24px;">Fecha</th>
            <th class="bg-[#e6e6e6] border-b border-r border-[#bfbfbf] text-[11px] font-medium text-[#333]" style="height: 24px;">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <!-- New row (inline add) -->
          <tr v-if="addingRow" class="bg-[#fffde7]">
            <td class="border-b border-r border-[#d4d4d4] text-center" style="height: 26px;">
              <i class="fa-solid fa-plus text-[10px] text-[#217346]"></i>
            </td>
            <td class="border-b border-r border-[#d4d4d4] text-center text-[11px] text-[#888]" style="height: 26px;">-</td>
            <td class="border-b border-r border-[#d4d4d4] px-0" style="height: 26px;">
              <input
                v-model="newRow.cliente"
                placeholder="Cliente"
                @keydown="onNewRowKeydown($event, 'cliente')"
                class="w-full h-full bg-transparent outline-none text-[13px] text-[#333] px-1 border-none focus:bg-[#e8f0fe]"
              />
            </td>
            <td class="border-b border-r border-[#d4d4d4] px-0" style="height: 26px;">
              <input
                v-model="newRow.nombre"
                placeholder="Nombre"
                @keydown="onNewRowKeydown($event, 'nombre')"
                class="w-full h-full bg-transparent outline-none text-[13px] text-[#333] px-1 border-none focus:bg-[#e8f0fe]"
              />
            </td>
            <td class="border-b border-r border-[#d4d4d4] px-0" style="height: 26px;">
              <input
                v-model="newRow.numero"
                placeholder="Numero *"
                @keydown="onNewRowKeydown($event, 'numero')"
                class="w-full h-full bg-transparent outline-none text-[13px] text-[#333] px-1 border-none focus:bg-[#e8f0fe]"
              />
            </td>
            <td class="border-b border-r border-[#d4d4d4] px-0" style="height: 26px;">
              <input
                v-model="newRow.fecha"
                placeholder="Fecha"
                @keydown="onNewRowKeydown($event, 'fecha')"
                class="w-full h-full bg-transparent outline-none text-[13px] text-[#333] px-1 border-none focus:bg-[#e8f0fe]"
              />
            </td>
            <td class="border-b border-r border-[#d4d4d4] text-center" style="height: 26px;">
              <button @click="addClient" class="text-[#217346] hover:text-[#1a5c38] mx-0.5" title="Guardar">
                <i class="fa-solid fa-check text-[12px]"></i>
              </button>
              <button @click="addingRow = false; newRow = { cliente: '', nombre: '', numero: '', fecha: '' }" class="text-red-400 hover:text-red-600 mx-0.5" title="Cancelar">
                <i class="fa-solid fa-xmark text-[12px]"></i>
              </button>
            </td>
          </tr>

          <!-- Data rows -->
          <tr
            v-for="(row, i) in filteredData"
            :key="row.uuid"
            class="group/row"
            :class="{
              'bg-[#f9f9f9]': i % 2 === 1,
              'bg-white': i % 2 === 0,
              'hover:bg-[#f0f4ff]': true,
              'opacity-50': deletingIds.has(row.uuid),
            }"
          >
            <!-- Checkbox -->
            <td
              class="border-b border-r border-[#d4d4d4] text-center"
              style="height: 24px;"
            >
              <input
                type="checkbox"
                :checked="selectedIds.has(row.uuid)"
                @change="toggleSelect(row.uuid)"
                class="accent-[#217346]"
              />
            </td>

            <!-- Row number -->
            <td class="bg-[#f9f9f9] border-b border-r border-[#d4d4d4] text-center text-[11px] text-[#888]" style="height: 24px;">
              {{ i + 1 }}
            </td>

            <!-- Cliente (editable) -->
            <td
              class="border-b border-r border-[#d4d4d4] px-0 relative"
              :class="{ 'cell-active': isEditing(row.uuid, 'cliente') }"
              style="height: 24px;"
              @dblclick="startEdit(row.uuid, 'cliente', getField(row, 'cliente'))"
            >
              <input
                v-if="isEditing(row.uuid, 'cliente')"
                v-model="editBuffer"
                @blur="commitEdit(row)"
                @keydown.enter="commitEdit(row)"
                @keydown.escape="cancelEdit"
                class="w-full h-full bg-white outline-none text-[13px] text-[#333] px-1 border-none"
                ref="editInput"
                autofocus
              />
              <div v-else class="px-1 text-[13px] text-[#333] truncate cursor-text h-full flex items-center">
                {{ getField(row, 'cliente') }}
                <i v-if="savingCell === row.uuid + '-cliente'" class="fa-solid fa-rotate fa-spin text-[9px] text-blue-400 ml-1"></i>
                <i v-if="savedCell === row.uuid + '-cliente'" class="fa-solid fa-check text-[9px] text-green-500 ml-1"></i>
              </div>
            </td>

            <!-- Nombre (editable) -->
            <td
              class="border-b border-r border-[#d4d4d4] px-0 relative"
              :class="{ 'cell-active': isEditing(row.uuid, 'nombre') }"
              style="height: 24px;"
              @dblclick="startEdit(row.uuid, 'nombre', getField(row, 'nombre'))"
            >
              <input
                v-if="isEditing(row.uuid, 'nombre')"
                v-model="editBuffer"
                @blur="commitEdit(row)"
                @keydown.enter="commitEdit(row)"
                @keydown.escape="cancelEdit"
                class="w-full h-full bg-white outline-none text-[13px] text-[#333] px-1 border-none"
                autofocus
              />
              <div v-else class="px-1 text-[13px] text-[#333] truncate cursor-text h-full flex items-center">
                {{ getField(row, 'nombre') }}
                <i v-if="savingCell === row.uuid + '-nombre'" class="fa-solid fa-rotate fa-spin text-[9px] text-blue-400 ml-1"></i>
                <i v-if="savedCell === row.uuid + '-nombre'" class="fa-solid fa-check text-[9px] text-green-500 ml-1"></i>
              </div>
            </td>

            <!-- Numero (editable) -->
            <td
              class="border-b border-r border-[#d4d4d4] px-0 relative"
              :class="{ 'cell-active': isEditing(row.uuid, 'numero') }"
              style="height: 24px;"
              @dblclick="startEdit(row.uuid, 'numero', getField(row, 'numero'))"
            >
              <input
                v-if="isEditing(row.uuid, 'numero')"
                v-model="editBuffer"
                @blur="commitEdit(row)"
                @keydown.enter="commitEdit(row)"
                @keydown.escape="cancelEdit"
                class="w-full h-full bg-white outline-none text-[13px] text-[#333] px-1 border-none"
                autofocus
              />
              <div v-else class="px-1 text-[13px] text-[#333] truncate cursor-text h-full flex items-center">
                {{ getField(row, 'numero') }}
                <i v-if="savingCell === row.uuid + '-numero'" class="fa-solid fa-rotate fa-spin text-[9px] text-blue-400 ml-1"></i>
                <i v-if="savedCell === row.uuid + '-numero'" class="fa-solid fa-check text-[9px] text-green-500 ml-1"></i>
              </div>
            </td>

            <!-- Fecha (editable) -->
            <td
              class="border-b border-r border-[#d4d4d4] px-0 relative"
              :class="{ 'cell-active': isEditing(row.uuid, 'fecha') }"
              style="height: 24px;"
              @dblclick="startEdit(row.uuid, 'fecha', getField(row, 'fecha'))"
            >
              <input
                v-if="isEditing(row.uuid, 'fecha')"
                v-model="editBuffer"
                @blur="commitEdit(row)"
                @keydown.enter="commitEdit(row)"
                @keydown.escape="cancelEdit"
                class="w-full h-full bg-white outline-none text-[13px] text-[#333] px-1 border-none"
                autofocus
              />
              <div v-else class="px-1 text-[13px] text-[#333] truncate cursor-text h-full flex items-center">
                {{ getField(row, 'fecha') }}
                <i v-if="savingCell === row.uuid + '-fecha'" class="fa-solid fa-rotate fa-spin text-[9px] text-blue-400 ml-1"></i>
                <i v-if="savedCell === row.uuid + '-fecha'" class="fa-solid fa-check text-[9px] text-green-500 ml-1"></i>
              </div>
            </td>

            <!-- Actions -->
            <td class="border-b border-r border-[#d4d4d4] text-center" style="height: 24px;">
              <button
                @click="deleteClient(row.uuid)"
                :disabled="deletingIds.has(row.uuid)"
                class="text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
                title="Eliminar"
              >
                <i class="fa-solid fa-trash-can text-[12px]"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ════════════ STATUS BAR ════════════ -->
    <div class="bg-[#217346] text-white text-[11px] px-4 py-1 flex items-center justify-between flex-shrink-0">
      <div class="flex items-center gap-4">
        <span>Total: {{ data.length }} registros</span>
        <span v-if="selectedIds.size > 0" class="text-white/80">Seleccionados: {{ selectedIds.size }}</span>
      </div>
      <div class="flex items-center gap-4 text-white/80">
        <span v-if="searchQuery">Mostrando: {{ filteredData.length }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cell-active {
  outline: 2px solid #0078d4;
  outline-offset: -2px;
  z-index: 5;
  position: relative;
}

::-webkit-scrollbar {
  width: 14px;
  height: 14px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
}
::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 0;
  border: 3px solid #f1f1f1;
}
::-webkit-scrollbar-thumb:hover {
  background: #a0a0a0;
}
::-webkit-scrollbar-corner {
  background: #f1f1f1;
}
</style>
