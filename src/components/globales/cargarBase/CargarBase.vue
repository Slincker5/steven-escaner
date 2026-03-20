<script setup>
import { ref, computed, reactive, nextTick } from "vue";
import { storeCargarBase } from "@/store/storeCargarBase";
import { useAgregarBase } from "@/composables/useAgregarBase";

const { subirBaseAlServidor } = useAgregarBase();
const baseCargada = storeCargarBase();

// --- Column definitions with data types ---
const COLUMNS = [
  { key: "CLIENTE", label: "Cliente", type: "text", width: "w-[120px]", icon: "fa-font" },
  { key: "NOMBRE", label: "Nombre", type: "text", width: "w-[200px]", icon: "fa-font" },
  { key: "NUMERO", label: "Número", type: "number", width: "w-[150px]", icon: "fa-hashtag" },
  { key: "FECHA", label: "Fecha", type: "date", width: "w-[130px]", icon: "fa-calendar" },
];
const COL_KEYS = COLUMNS.map((c) => c.key);
const INITIAL_ROWS = 10;

// --- State ---
const createEmptyRow = () => ({ CLIENTE: "", NOMBRE: "", NUMERO: "", FECHA: "" });
const rows = ref(Array.from({ length: INITIAL_ROWS }, createEmptyRow));
const activeCell = reactive({ row: -1, col: -1 });
const selectedRows = ref(new Set());
const sortConfig = reactive({ key: null, dir: "asc" });
const filters = reactive({ CLIENTE: "", NOMBRE: "", NUMERO: "", FECHA: "" });
const showFilter = ref(null);
const filterInputRefs = ref({});
const cargando = ref(false);

// --- Computed ---
const isRowEmpty = (row) => !row.CLIENTE && !row.NOMBRE && !row.NUMERO && !row.FECHA;

const filteredRows = computed(() => {
  return rows.value
    .map((row, originalIndex) => ({ ...row, _idx: originalIndex }))
    .filter((row) => {
      if (isRowEmpty(row)) return true;
      return COL_KEYS.every((key) => {
        if (!filters[key]) return true;
        return String(row[key]).toLowerCase().includes(filters[key].toLowerCase());
      });
    });
});

const filledRows = computed(() => rows.value.filter((r) => !isRowEmpty(r)));
const emptyRowCount = computed(() => rows.value.length - filledRows.value.length);
const hasActiveFilters = computed(() => COL_KEYS.some((k) => filters[k]));

// --- Formula bar ---
const activeCellRef = computed(() => {
  if (activeCell.row < 0 || activeCell.col < 0) return "";
  const colLetter = String.fromCharCode(65 + activeCell.col);
  return `${colLetter}${activeCell.row + 1}`;
});

const activeCellValue = computed(() => {
  if (activeCell.row < 0 || activeCell.col < 0) return "";
  const row = rows.value[activeCell.row];
  if (!row) return "";
  return row[COL_KEYS[activeCell.col]] || "";
});

// --- Sync to store ---
const syncStore = () => {
  const data = filledRows.value.map((r) => ({
    CLIENTE: String(r.CLIENTE).padStart(8, "0"),
    NOMBRE: r.NOMBRE,
    NUMERO: r.NUMERO,
    FECHA: r.FECHA,
  }));
  baseCargada.editarBase(data);
};

// --- Cell interaction ---
const setActiveCell = (rowIdx, colIdx) => {
  activeCell.row = rowIdx;
  activeCell.col = colIdx;
};

const onCellInput = () => syncStore();

// --- Row operations ---
const addRows = (count = 5) => {
  for (let i = 0; i < count; i++) rows.value.push(createEmptyRow());
};

const clearAll = () => {
  rows.value = Array.from({ length: INITIAL_ROWS }, createEmptyRow);
  baseCargada.editarBase([]);
  selectedRows.value.clear();
  activeCell.row = -1;
  activeCell.col = -1;
};

const removeRow = (index) => {
  rows.value.splice(index, 1);
  selectedRows.value.delete(index);
  if (rows.value.length === 0) rows.value.push(createEmptyRow());
  syncStore();
};

const toggleSelectRow = (index) => {
  if (selectedRows.value.has(index)) {
    selectedRows.value.delete(index);
  } else {
    selectedRows.value.add(index);
  }
};

const deleteSelectedRows = () => {
  const indices = Array.from(selectedRows.value).sort((a, b) => b - a);
  indices.forEach((i) => rows.value.splice(i, 1));
  selectedRows.value.clear();
  if (rows.value.length === 0) rows.value.push(createEmptyRow());
  syncStore();
};

// --- Paste from Excel ---
const onPaste = (event, rowIndex, colIndex) => {
  const clipboardData = event.clipboardData || window.clipboardData;
  if (!clipboardData) return;

  const text = clipboardData.getData("text/plain");
  if (!text) return;

  const rawRows = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  if (rawRows.length > 1 && rawRows[rawRows.length - 1].trim() === "") rawRows.pop();

  const pastedData = rawRows.map((line) => line.split("\t"));
  if (pastedData.length === 1 && pastedData[0].length === 1) return;

  event.preventDefault();

  const neededRows = rowIndex + pastedData.length;
  while (rows.value.length < neededRows) rows.value.push(createEmptyRow());

  for (let r = 0; r < pastedData.length; r++) {
    for (let c = 0; c < pastedData[r].length; c++) {
      const targetCol = colIndex + c;
      if (targetCol >= COL_KEYS.length) continue;
      rows.value[rowIndex + r][COL_KEYS[targetCol]] = pastedData[r][c].trim();
    }
  }
  syncStore();
};

// --- Keyboard nav ---
const onKeydown = (event, rowIndex, colIndex) => {
  const nav = { ArrowDown: [1, 0], ArrowUp: [-1, 0], ArrowRight: [0, 1], ArrowLeft: [0, -1] };
  if (event.key === "Tab") {
    event.preventDefault();
    const nextCol = event.shiftKey ? colIndex - 1 : colIndex + 1;
    if (nextCol >= 0 && nextCol < COL_KEYS.length) {
      focusCell(rowIndex, nextCol);
    } else if (!event.shiftKey && rowIndex + 1 < rows.value.length) {
      focusCell(rowIndex + 1, 0);
    }
    return;
  }
  if (event.key === "Enter") {
    event.preventDefault();
    if (rowIndex + 1 < rows.value.length) focusCell(rowIndex + 1, colIndex);
    return;
  }
  if (event.key === "Delete" && event.ctrlKey) {
    removeRow(rowIndex);
    return;
  }
};

const focusCell = (row, col) => {
  nextTick(() => {
    const el = document.querySelector(`[data-cell="${row}-${col}"] input`);
    if (el) { el.focus(); setActiveCell(row, col); }
  });
};

// --- Sorting ---
const sortBy = (key) => {
  if (sortConfig.key === key) {
    sortConfig.dir = sortConfig.dir === "asc" ? "desc" : "asc";
  } else {
    sortConfig.key = key;
    sortConfig.dir = "asc";
  }

  const empties = rows.value.filter(isRowEmpty);
  const filled = rows.value.filter((r) => !isRowEmpty(r));

  filled.sort((a, b) => {
    const va = String(a[key]).toLowerCase();
    const vb = String(b[key]).toLowerCase();
    const cmp = va.localeCompare(vb, undefined, { numeric: true });
    return sortConfig.dir === "asc" ? cmp : -cmp;
  });

  rows.value = [...filled, ...empties];
};

// --- Filters ---
const toggleFilter = (key) => {
  if (showFilter.value === key) {
    showFilter.value = null;
  } else {
    showFilter.value = key;
    nextTick(() => {
      const input = document.querySelector(`#filter-${key}`);
      if (input) input.focus();
    });
  }
};

const clearFilter = (key) => {
  filters[key] = "";
  showFilter.value = null;
};

const clearAllFilters = () => {
  COL_KEYS.forEach((k) => (filters[k] = ""));
  showFilter.value = null;
};

// --- Validation ---
const hasInvalidNumber = (value) => value && /[^\d]/.test(value);
const hasMissingName = (row) => !row.NOMBRE && !!row.NUMERO;

const getCellValidation = (row, col) => {
  if (col.key === "NUMERO" && hasInvalidNumber(row[col.key])) return "error";
  if (col.key === "NOMBRE" && hasMissingName(row)) return "warning";
  return "";
};

// --- Data type badge ---
const typeColors = { text: "bg-green-100 text-green-700", number: "bg-blue-100 text-blue-700", date: "bg-purple-100 text-purple-700" };

// --- Upload ---
const handleSubir = async () => {
  syncStore();
  if (filledRows.value.length === 0) return;
  cargando.value = true;
  try {
    await subirBaseAlServidor();
    clearAll();
  } finally {
    cargando.value = false;
  }
};
</script>

<template>
  <div class="flex flex-col h-full select-none">
    <!-- ===== RIBBON BAR (Excel 365 style) ===== -->
    <div class="bg-[#217346] px-4 py-1.5 flex items-center gap-1">
      <i class="fa-regular fa-file-spreadsheet text-white/90 text-base mr-2"></i>
      <span class="text-white font-semibold text-sm tracking-wide mr-4">Cargar Base</span>
      <div class="h-4 w-px bg-white/30 mx-1"></div>
      <span class="text-white/70 text-xs">{{ filledRows.length }} filas</span>
    </div>

    <!-- ===== TOOLBAR ===== -->
    <div class="bg-[#f3f3f3] border-b border-[#d1d1d1] px-3 py-1.5 flex items-center gap-1 flex-wrap">
      <!-- Add rows -->
      <button
        @click="addRows(5)"
        class="toolbar-btn"
        title="Agregar 5 filas"
      >
        <i class="fa-regular fa-plus text-[11px]"></i>
        <span>Insertar</span>
      </button>

      <div class="toolbar-sep"></div>

      <!-- Delete selected -->
      <button
        @click="deleteSelectedRows"
        :disabled="selectedRows.size === 0"
        class="toolbar-btn"
        :class="{ 'opacity-40 cursor-not-allowed': selectedRows.size === 0 }"
        title="Eliminar filas seleccionadas"
      >
        <i class="fa-regular fa-trash text-[11px]"></i>
        <span>Eliminar</span>
      </button>

      <div class="toolbar-sep"></div>

      <!-- Clear all -->
      <button @click="clearAll" class="toolbar-btn" title="Limpiar todo">
        <i class="fa-regular fa-broom text-[11px]"></i>
        <span>Limpiar</span>
      </button>

      <div class="toolbar-sep"></div>

      <!-- Clear filters -->
      <button
        v-if="hasActiveFilters"
        @click="clearAllFilters"
        class="toolbar-btn text-red-600"
        title="Quitar filtros"
      >
        <i class="fa-regular fa-filter-slash text-[11px]"></i>
        <span>Quitar filtros</span>
      </button>

      <!-- Spacer -->
      <div class="flex-1"></div>

      <!-- Upload -->
      <button
        v-if="filledRows.length > 0"
        @click="handleSubir"
        :disabled="cargando"
        class="flex items-center gap-1.5 bg-[#217346] hover:bg-[#1a5c38] text-white text-xs px-3 py-1.5 rounded-[3px] transition-colors disabled:opacity-50"
      >
        <i class="fa-regular fa-cloud-arrow-up text-[11px]"></i>
        <span>Subir base ({{ filledRows.length }})</span>
      </button>
    </div>

    <!-- ===== FORMULA BAR ===== -->
    <div class="bg-white border-b border-[#d1d1d1] flex items-center h-[26px] text-xs">
      <!-- Cell reference -->
      <div class="w-[70px] border-r border-[#d1d1d1] h-full flex items-center justify-center font-semibold text-[#217346] bg-[#f9f9f9]">
        {{ activeCellRef || "" }}
      </div>
      <!-- fx icon -->
      <div class="w-[26px] h-full flex items-center justify-center text-gray-400 border-r border-[#d1d1d1] italic text-[11px]">
        fx
      </div>
      <!-- Value display -->
      <div class="flex-1 px-2 text-gray-700 truncate">
        {{ activeCellValue }}
      </div>
    </div>

    <!-- ===== SPREADSHEET ===== -->
    <div class="flex-1 overflow-auto bg-white" @click.self="activeCell.row = -1; activeCell.col = -1">
      <table class="w-full text-[13px] border-collapse min-w-[650px]">
        <!-- Column headers -->
        <thead class="sticky top-0 z-20">
          <tr>
            <!-- Select all corner -->
            <th class="excel-header-corner w-[30px]"></th>
            <!-- Row number header -->
            <th class="excel-header-rownum w-[40px]"></th>
            <!-- Column headers -->
            <th
              v-for="col in COLUMNS"
              :key="col.key"
              :class="col.width"
              class="excel-header group relative"
            >
              <div class="flex items-center gap-1 justify-between">
                <div class="flex items-center gap-1.5 min-w-0">
                  <!-- Data type badge -->
                  <span :class="typeColors[col.type]" class="inline-flex items-center gap-0.5 px-1 py-0 rounded text-[9px] font-medium leading-tight">
                    <i :class="'fa-regular ' + col.icon" class="text-[8px]"></i>
                    {{ col.type === 'text' ? 'ABC' : col.type === 'number' ? '123' : 'Fecha' }}
                  </span>
                  <!-- Column name -->
                  <span
                    class="font-semibold text-[11px] text-[#333] truncate cursor-pointer"
                    @click="sortBy(col.key)"
                    :title="'Ordenar por ' + col.label"
                  >
                    {{ col.label }}
                  </span>
                  <!-- Sort indicator -->
                  <i
                    v-if="sortConfig.key === col.key"
                    :class="sortConfig.dir === 'asc' ? 'fa-arrow-up' : 'fa-arrow-down'"
                    class="fa-regular text-[9px] text-[#217346]"
                  ></i>
                </div>
                <!-- Filter button -->
                <button
                  @click.stop="toggleFilter(col.key)"
                  class="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-[#217346] p-0.5"
                  :class="{ 'opacity-100 text-[#217346]': filters[col.key] || showFilter === col.key }"
                >
                  <i class="fa-regular fa-filter text-[10px]"></i>
                </button>
              </div>

              <!-- Filter dropdown -->
              <div
                v-if="showFilter === col.key"
                class="absolute top-full left-0 z-30 bg-white border border-[#d1d1d1] shadow-lg rounded-sm p-2 min-w-[180px] mt-px"
                @click.stop
              >
                <div class="text-[10px] text-gray-500 mb-1 font-normal">Filtrar {{ col.label }}</div>
                <input
                  :id="'filter-' + col.key"
                  v-model="filters[col.key]"
                  type="text"
                  placeholder="Buscar..."
                  class="w-full border border-[#d1d1d1] rounded-sm px-2 py-1 text-xs outline-none focus:border-[#217346] transition-colors"
                />
                <div class="flex justify-end gap-1 mt-2">
                  <button
                    @click="clearFilter(col.key)"
                    class="text-[10px] text-gray-500 hover:text-red-500 px-2 py-0.5"
                  >
                    Limpiar
                  </button>
                  <button
                    @click="showFilter = null"
                    class="text-[10px] bg-[#217346] text-white px-2 py-0.5 rounded-sm hover:bg-[#1a5c38]"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </th>
          </tr>
        </thead>

        <!-- Data rows -->
        <tbody>
          <tr
            v-for="(row, i) in filteredRows"
            :key="row._idx"
            class="group/row"
            :class="{
              'bg-[#e8f0fe]': selectedRows.has(row._idx),
              'hover:bg-[#f5f5f5]': !selectedRows.has(row._idx),
            }"
          >
            <!-- Checkbox -->
            <td class="excel-cell-check" @click="toggleSelectRow(row._idx)">
              <div class="w-3.5 h-3.5 border border-[#c1c1c1] rounded-sm flex items-center justify-center cursor-pointer"
                :class="selectedRows.has(row._idx) ? 'bg-[#217346] border-[#217346]' : 'bg-white hover:border-[#217346]'"
              >
                <i v-if="selectedRows.has(row._idx)" class="fa-regular fa-check text-white text-[8px]"></i>
              </div>
            </td>

            <!-- Row number -->
            <td class="excel-rownum" :class="{ 'bg-[#d6e4f0]': selectedRows.has(row._idx) }">
              {{ row._idx + 1 }}
            </td>

            <!-- Data cells -->
            <td
              v-for="(col, ci) in COLUMNS"
              :key="col.key"
              :data-cell="row._idx + '-' + ci"
              class="excel-cell"
              :class="{
                'excel-cell-active': activeCell.row === row._idx && activeCell.col === ci,
                'excel-cell-error': getCellValidation(row, col) === 'error',
                'excel-cell-warning': getCellValidation(row, col) === 'warning',
              }"
              @click="setActiveCell(row._idx, ci)"
            >
              <input
                v-model="rows[row._idx][col.key]"
                @input="onCellInput"
                @focus="setActiveCell(row._idx, ci)"
                @paste="onPaste($event, row._idx, ci)"
                @keydown="onKeydown($event, row._idx, ci)"
                :placeholder="row._idx === 0 && isRowEmpty(rows[0]) ? col.label : ''"
                class="w-full h-full bg-transparent outline-none text-[13px] text-[#333] placeholder-[#c0c0c0] px-1"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ===== STATUS BAR (Excel style) ===== -->
    <div class="bg-[#217346] text-white text-[11px] px-4 py-1 flex items-center justify-between flex-shrink-0">
      <div class="flex items-center gap-4">
        <span>
          <i class="fa-regular fa-table-cells mr-1"></i>
          Filas: {{ filledRows.length }}
        </span>
        <span v-if="selectedRows.size > 0" class="text-white/80">
          Seleccionadas: {{ selectedRows.size }}
        </span>
        <span v-if="hasActiveFilters" class="text-yellow-200">
          <i class="fa-regular fa-filter mr-0.5"></i> Filtro activo
        </span>
      </div>
      <div class="flex items-center gap-3 text-white/70">
        <span>Vacías: {{ emptyRowCount }}</span>
        <span>Total: {{ rows.length }}</span>
      </div>
    </div>

    <!-- ===== SHEET TABS (Excel style) ===== -->
    <div class="bg-[#e6e6e6] border-t border-[#c1c1c1] flex items-center px-2 py-0.5 gap-1 flex-shrink-0">
      <button
        @click="addRows(5)"
        class="text-gray-500 hover:text-[#217346] p-1 transition-colors"
        title="Agregar filas"
      >
        <i class="fa-regular fa-plus text-[10px]"></i>
      </button>
      <div class="bg-white border border-[#c1c1c1] border-b-white px-3 py-0.5 text-[11px] text-[#333] font-medium rounded-t-sm cursor-default">
        Base de clientes
      </div>
    </div>
  </div>
</template>

<style scoped>
/* === Toolbar buttons === */
.toolbar-btn {
  @apply flex items-center gap-1 text-[11px] text-[#333] px-2 py-1 rounded-[2px] hover:bg-[#e0e0e0] transition-colors cursor-pointer;
}
.toolbar-sep {
  @apply w-px h-4 bg-[#d1d1d1] mx-0.5;
}

/* === Excel header cells === */
.excel-header-corner {
  @apply bg-[#f3f3f3] border-b border-r border-[#d1d1d1] sticky left-0 z-20;
}
.excel-header-rownum {
  @apply bg-[#f3f3f3] border-b border-r border-[#d1d1d1] sticky left-[30px] z-20;
}
.excel-header {
  @apply bg-[#f3f3f3] border-b border-r border-[#d1d1d1] px-1.5 py-1.5 text-left;
}

/* === Row number cells === */
.excel-rownum {
  @apply bg-[#f9f9f9] border-b border-r border-[#e0e0e0] text-center text-[11px] text-[#888] font-normal sticky left-[30px] z-10 w-[40px];
}

/* === Checkbox cells === */
.excel-cell-check {
  @apply bg-[#f9f9f9] border-b border-r border-[#e0e0e0] text-center sticky left-0 z-10 w-[30px] px-2 py-0;
}

/* === Data cells === */
.excel-cell {
  @apply border-b border-r border-[#e8e8e8] px-0 py-0 h-[28px] transition-none;
}
.excel-cell-active {
  outline: 2px solid #217346;
  outline-offset: -2px;
  z-index: 5;
  position: relative;
}
.excel-cell-error {
  background-color: #fef2f2;
  outline: 1px solid #ef4444;
  outline-offset: -1px;
}
.excel-cell-warning {
  background-color: #fffbeb;
  outline: 1px solid #f59e0b;
  outline-offset: -1px;
}

/* === Scrollbar (Excel-like thin) === */
::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
}
::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 0;
  border: 2px solid #f1f1f1;
}
::-webkit-scrollbar-thumb:hover {
  background: #a0a0a0;
}
::-webkit-scrollbar-corner {
  background: #f1f1f1;
}
</style>
