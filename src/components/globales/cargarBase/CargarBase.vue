<script setup>
import { ref, computed, reactive, nextTick, onMounted, onBeforeUnmount } from "vue";
import { storeCargarBase } from "@/store/storeCargarBase";
import { storeMenuAutowhat } from "@/store/storeMenuAutowhat";
import { useAgregarBase } from "@/composables/useAgregarBase";
import { toast } from "vue3-toastify";

const { subirBaseAlServidor, getBase } = useAgregarBase();
const baseCargada = storeCargarBase();
const menuStore = storeMenuAutowhat();

// ── Column definitions ──
const COLUMNS = [
  { key: "CLIENTE", label: "CLIENTE", letter: "A" },
  { key: "NOMBRE", label: "NOMBRE", letter: "B" },
  { key: "NUMERO", label: "NUMERO", letter: "C" },
  { key: "FECHA", label: "FECHA", letter: "D" },
];
const COL_KEYS = COLUMNS.map((c) => c.key);
const INITIAL_ROWS = 30;

// ── State ──
const createEmptyRow = () => ({ CLIENTE: "", NOMBRE: "", NUMERO: "", FECHA: "" });
const rows = ref(Array.from({ length: INITIAL_ROWS }, createEmptyRow));
const activeCell = reactive({ row: 0, col: 0 });
const selection = reactive({ startRow: -1, startCol: -1, endRow: -1, endCol: -1 });
const selectedRows = ref(new Set());
const selectedCols = ref(new Set());
const selectAll = ref(false);
const sortConfig = reactive({ key: null, dir: "asc" });
const cargando = ref(false);
const activeTab = ref("editor");
const searchQuery = ref("");
const showSearch = ref(false);

// ── Context menu ──
const contextMenu = reactive({ show: false, x: 0, y: 0, rowIdx: -1, colIdx: -1 });

// ── Filters (Excel-style with checkboxes) ──
const columnFilters = reactive({});
COL_KEYS.forEach((k) => {
  columnFilters[k] = { active: false, search: "", selected: new Set(), allValues: [] };
});
const openFilter = ref(null);


// ── Helpers ──
const isRowEmpty = (row) => !row.CLIENTE && !row.NOMBRE && !row.NUMERO && !row.FECHA;

const hasInvalidNumber = (value) => {
  if (!value) return false;
  const digits = String(value).replace(/\D/g, "");
  if (!digits) return true;
  if (/^[2-9]\d{7}$/.test(digits)) return false;
  if (digits.length === 11 && digits.startsWith("503") && /^[2-9]/.test(digits.substring(3))) return false;
  if (digits.length >= 10) return false;
  return true;
};

const formatNumero = (value) => {
  if (!value) return "";
  const digits = String(value).replace(/\D/g, "");
  if (/^[2-9]\d{7}$/.test(digits)) return "503" + digits;
  if (digits.length === 11 && digits.startsWith("503")) return digits;
  return digits;
};

const hasValidNumber = (row) => {
  if (!row.NUMERO) return false;
  return !hasInvalidNumber(row.NUMERO);
};

// ── Filtered rows ──
const filteredRows = computed(() => {
  let result = rows.value.map((row, idx) => ({ ...row, _idx: idx }));

  // Apply column filters
  for (const key of COL_KEYS) {
    const f = columnFilters[key];
    if (f.active && f.selected.size > 0) {
      const totalUniqueValues = f.allValues.length;
      if (f.selected.size < totalUniqueValues) {
        result = result.filter((row) => {
          const val = String(row[key] || "(Vacío)");
          return f.selected.has(val);
        });
      }
    }
  }

  return result;
});

const filledRows = computed(() => rows.value.filter((r) => !isRowEmpty(r)));
const validRows = computed(() => rows.value.filter((r) => hasValidNumber(r)));
const hasActiveFilters = computed(() => COL_KEYS.some((k) => columnFilters[k].active));

// ── Sync to store ──
const syncStore = () => {
  const data = filledRows.value.map((r) => ({
    CLIENTE: String(r.CLIENTE || "").padStart(8, "0"),
    NOMBRE: r.NOMBRE,
    NUMERO: r.NUMERO,
    FECHA: r.FECHA,
  }));
  baseCargada.editarBase(data);
};

// ── Selection helpers ──
const selectionNormalized = computed(() => {
  if (selection.startRow < 0) return null;
  return {
    minRow: Math.min(selection.startRow, selection.endRow),
    maxRow: Math.max(selection.startRow, selection.endRow),
    minCol: Math.min(selection.startCol, selection.endCol),
    maxCol: Math.max(selection.startCol, selection.endCol),
  };
});

const isCellInSelection = (rowIdx, colIdx) => {
  if (selectAll.value) return true;
  if (selectedRows.value.has(rowIdx)) return true;
  if (selectedCols.value.has(colIdx)) return true;
  const s = selectionNormalized.value;
  if (!s) return false;
  return rowIdx >= s.minRow && rowIdx <= s.maxRow && colIdx >= s.minCol && colIdx <= s.maxCol;
};

const isCellActive = (rowIdx, colIdx) => {
  return activeCell.row === rowIdx && activeCell.col === colIdx;
};

const clearSelection = () => {
  selection.startRow = -1;
  selection.startCol = -1;
  selection.endRow = -1;
  selection.endCol = -1;
  selectedRows.value.clear();
  selectedCols.value.clear();
  selectAll.value = false;
};

// ── Formula bar ──
const activeCellRef = computed(() => {
  if (activeCell.row < 0 || activeCell.col < 0) return "";
  return `${COLUMNS[activeCell.col].letter}${activeCell.row + 1}`;
});

const activeCellValue = computed(() => {
  if (activeCell.row < 0 || activeCell.col < 0) return "";
  const row = rows.value[activeCell.row];
  if (!row) return "";
  return row[COL_KEYS[activeCell.col]] || "";
});

// ── Status bar stats ──
const selectionCount = computed(() => {
  if (selectAll.value) return filteredRows.value.length;
  if (selectedRows.value.size > 0) return selectedRows.value.size;
  const s = selectionNormalized.value;
  if (!s) return 0;
  return (s.maxRow - s.minRow + 1) * (s.maxCol - s.minCol + 1);
});

const selectionNumericStats = computed(() => {
  const nums = [];
  if (selectAll.value) {
    filteredRows.value.forEach((row) => {
      COL_KEYS.forEach((k) => {
        const v = parseFloat(row[k]);
        if (!isNaN(v)) nums.push(v);
      });
    });
  } else if (selectedRows.value.size > 0) {
    selectedRows.value.forEach((idx) => {
      const row = rows.value[idx];
      if (row) COL_KEYS.forEach((k) => { const v = parseFloat(row[k]); if (!isNaN(v)) nums.push(v); });
    });
  } else if (selectedCols.value.size > 0) {
    filteredRows.value.forEach((row) => {
      selectedCols.value.forEach((ci) => {
        const v = parseFloat(row[COL_KEYS[ci]]);
        if (!isNaN(v)) nums.push(v);
      });
    });
  } else {
    const s = selectionNormalized.value;
    if (s) {
      for (let r = s.minRow; r <= s.maxRow; r++) {
        for (let c = s.minCol; c <= s.maxCol; c++) {
          const row = rows.value[r];
          if (row) { const v = parseFloat(row[COL_KEYS[c]]); if (!isNaN(v)) nums.push(v); }
        }
      }
    }
  }
  if (nums.length === 0) return null;
  const sum = nums.reduce((a, b) => a + b, 0);
  return { avg: (sum / nums.length).toFixed(2), count: nums.length, sum: sum % 1 === 0 ? sum : sum.toFixed(2) };
});

// ── Cell interaction ──
const setActiveCell = (rowIdx, colIdx, event) => {
  if (event && event.shiftKey) {
    // Shift+Click: extend selection from active cell
    selection.startRow = activeCell.row;
    selection.startCol = activeCell.col;
    selection.endRow = rowIdx;
    selection.endCol = colIdx;
    selectedRows.value.clear();
    selectedCols.value.clear();
    selectAll.value = false;
    return;
  }
  clearSelection();
  activeCell.row = rowIdx;
  activeCell.col = colIdx;
};

const onCellInput = () => syncStore();

const focusCell = (row, col) => {
  nextTick(() => {
    const el = document.querySelector(`[data-cell="${row}-${col}"] input`);
    if (el) {
      el.focus();
      activeCell.row = row;
      activeCell.col = col;
    }
  });
};

// ── Row operations ──
const addRows = (count = 5) => {
  for (let i = 0; i < count; i++) rows.value.push(createEmptyRow());
};

const insertRowAt = (index, position = "below") => {
  const insertIdx = position === "below" ? index + 1 : index;
  rows.value.splice(insertIdx, 0, createEmptyRow());
  syncStore();
};

const clearAll = () => {
  rows.value = Array.from({ length: INITIAL_ROWS }, createEmptyRow);
  baseCargada.editarBase([]);
  clearSelection();
  activeCell.row = 0;
  activeCell.col = 0;
  COL_KEYS.forEach((k) => {
    columnFilters[k].active = false;
    columnFilters[k].search = "";
    columnFilters[k].selected.clear();
  });
};

const removeRow = (index) => {
  rows.value.splice(index, 1);
  selectedRows.value.delete(index);
  if (rows.value.length === 0) rows.value.push(createEmptyRow());
  syncStore();
};

const deleteSelectedRows = () => {
  const indices = Array.from(selectedRows.value).sort((a, b) => b - a);
  if (indices.length === 0) return;
  indices.forEach((i) => rows.value.splice(i, 1));
  selectedRows.value.clear();
  if (rows.value.length === 0) rows.value.push(createEmptyRow());
  syncStore();
};

const clearCellContent = (rowIdx, colIdx) => {
  if (rowIdx >= 0 && rowIdx < rows.value.length && colIdx >= 0 && colIdx < COL_KEYS.length) {
    rows.value[rowIdx][COL_KEYS[colIdx]] = "";
    syncStore();
  }
};

const clearSelectedRowsContent = () => {
  selectedRows.value.forEach((idx) => {
    if (rows.value[idx]) {
      COL_KEYS.forEach((k) => { rows.value[idx][k] = ""; });
    }
  });
  syncStore();
};

// ── Select all / row / column ──
const handleSelectAll = () => {
  selectAll.value = true;
  selectedRows.value.clear();
  selectedCols.value.clear();
  selection.startRow = -1;
};

const handleSelectRow = (rowIdx, event) => {
  if (!event || !event.ctrlKey) {
    clearSelection();
  }
  selectedRows.value.add(rowIdx);
  activeCell.row = rowIdx;
  activeCell.col = 0;
};

const handleSelectColumn = (colIdx) => {
  clearSelection();
  selectedCols.value.add(colIdx);
  activeCell.col = colIdx;
  activeCell.row = 0;
};

// ── Paste from Excel ──
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

// ── Keyboard navigation ──
const onKeydown = (event, rowIndex, colIndex) => {
  if (event.key === "Tab") {
    event.preventDefault();
    const nextCol = event.shiftKey ? colIndex - 1 : colIndex + 1;
    if (nextCol >= 0 && nextCol < COL_KEYS.length) {
      focusCell(rowIndex, nextCol);
    } else if (!event.shiftKey && rowIndex + 1 < rows.value.length) {
      focusCell(rowIndex + 1, 0);
    } else if (event.shiftKey && rowIndex - 1 >= 0) {
      focusCell(rowIndex - 1, COL_KEYS.length - 1);
    }
    return;
  }
  if (event.key === "Enter") {
    event.preventDefault();
    const nextRow = event.shiftKey ? rowIndex - 1 : rowIndex + 1;
    if (nextRow >= 0 && nextRow < rows.value.length) focusCell(nextRow, colIndex);
    return;
  }
  if (event.key === "Delete") {
    rows.value[rowIndex][COL_KEYS[colIndex]] = "";
    syncStore();
    return;
  }
  if (event.key === "Escape") {
    clearSelection();
    closeContextMenu();
    showSearch.value = false;
    openFilter.value = null;
    return;
  }
  if (event.ctrlKey && event.key === "a") {
    event.preventDefault();
    handleSelectAll();
    return;
  }
  // Arrow keys
  if (event.key === "ArrowDown" && rowIndex + 1 < rows.value.length) {
    event.preventDefault();
    focusCell(rowIndex + 1, colIndex);
  } else if (event.key === "ArrowUp" && rowIndex - 1 >= 0) {
    event.preventDefault();
    focusCell(rowIndex - 1, colIndex);
  } else if (event.key === "ArrowRight" && colIndex + 1 < COL_KEYS.length) {
    event.preventDefault();
    focusCell(rowIndex, colIndex + 1);
  } else if (event.key === "ArrowLeft" && colIndex - 1 >= 0) {
    event.preventDefault();
    focusCell(rowIndex, colIndex - 1);
  }
};

// ── Sorting ──
const sortBy = (key, direction) => {
  sortConfig.key = key;
  sortConfig.dir = direction || "asc";

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

const sortAZ = () => {
  if (activeCell.col >= 0) sortBy(COL_KEYS[activeCell.col], "asc");
};
const sortZA = () => {
  if (activeCell.col >= 0) sortBy(COL_KEYS[activeCell.col], "desc");
};

// ── Column Filters (Excel-style with checkboxes) ──
const getUniqueValues = (key) => {
  const vals = new Set();
  rows.value.forEach((row) => {
    if (!isRowEmpty(row)) {
      vals.add(String(row[key] || "(Vacío)"));
    }
  });
  return Array.from(vals).sort();
};

const openColumnFilter = (key) => {
  if (openFilter.value === key) {
    openFilter.value = null;
    return;
  }
  const allVals = getUniqueValues(key);
  columnFilters[key].allValues = allVals;
  if (!columnFilters[key].active) {
    columnFilters[key].selected = new Set(allVals);
  }
  columnFilters[key].search = "";
  openFilter.value = key;
};

const filteredFilterValues = (key) => {
  const f = columnFilters[key];
  if (!f.search) return f.allValues;
  return f.allValues.filter((v) => v.toLowerCase().includes(f.search.toLowerCase()));
};

const toggleFilterValue = (key, val) => {
  const s = columnFilters[key].selected;
  if (s.has(val)) s.delete(val);
  else s.add(val);
};

const toggleSelectAllFilter = (key) => {
  const f = columnFilters[key];
  const displayed = filteredFilterValues(key);
  const allSelected = displayed.every((v) => f.selected.has(v));
  if (allSelected) {
    displayed.forEach((v) => f.selected.delete(v));
  } else {
    displayed.forEach((v) => f.selected.add(v));
  }
};

const applyFilter = (key) => {
  const f = columnFilters[key];
  f.active = f.selected.size < f.allValues.length;
  openFilter.value = null;
};

const cancelFilter = (key) => {
  openFilter.value = null;
};

const clearColumnFilter = (key) => {
  columnFilters[key].active = false;
  columnFilters[key].selected = new Set(columnFilters[key].allValues);
  openFilter.value = null;
};

// ── Context menu ──
const onContextMenu = (event, rowIdx, colIdx) => {
  event.preventDefault();
  contextMenu.show = true;
  contextMenu.x = event.clientX;
  contextMenu.y = event.clientY;
  contextMenu.rowIdx = rowIdx;
  contextMenu.colIdx = colIdx;
};

const closeContextMenu = () => {
  contextMenu.show = false;
};

// ── Validation display ──
const getCellClass = (row, colKey) => {
  if (colKey === "NUMERO" && row[colKey] && hasInvalidNumber(row[colKey])) return "cell-error";
  return "";
};

// ── Upload ──
const handleSubir = async () => {
  syncStore();
  if (validRows.value.length === 0) return;
  cargando.value = true;
  try {
    await subirBaseAlServidor();
    clearAll();
    menuStore.verBase(true);
  } finally {
    cargando.value = false;
  }
};


// ── Global click to close menus ──
const onGlobalClick = (e) => {
  if (contextMenu.show) closeContextMenu();
  if (openFilter.value && !e.target.closest(".filter-dropdown-container")) {
    openFilter.value = null;
  }
};

const onGlobalKeydown = (e) => {
  if (e.key === "Escape") {
    closeContextMenu();
    openFilter.value = null;
    showSearch.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", onGlobalClick);
  document.addEventListener("keydown", onGlobalKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onGlobalClick);
  document.removeEventListener("keydown", onGlobalKeydown);
});

</script>

<template>
  <div class="flex flex-col h-full select-none font-['Calibri',_sans-serif]">

    <!-- ════════════ TITLE BAR ════════════ -->
    <div class="bg-[#217346] px-4 py-1.5 flex items-center justify-between flex-shrink-0">
      <div class="flex items-center gap-2">
        <i class="fa-solid fa-file-spreadsheet text-white/90 text-base"></i>
        <span class="text-white font-semibold text-sm tracking-wide">Cargar Base</span>
        <span class="text-white/60 text-xs ml-2" v-if="activeTab === 'editor'">{{ filledRows.length }} filas con datos</span>
      </div>
      <button
        v-if="validRows.length > 0 && activeTab === 'editor'"
        @click="handleSubir"
        :disabled="cargando"
        class="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1 rounded-[3px] transition-colors disabled:opacity-50 border border-white/30"
      >
        <i class="fa-solid fa-cloud-arrow-up text-[12px]"></i>
        <span>{{ cargando ? 'Subiendo...' : `Subir base (${validRows.length})` }}</span>
      </button>
    </div>

    <!-- ════════════ RIBBON / TOOLBAR ════════════ -->
    <div v-if="activeTab === 'editor'" class="bg-[#f6f6f6] border-b border-[#e0e0e0] flex-shrink-0">
      <!-- Ribbon tabs -->
      <div class="flex items-center px-3 pt-1 gap-0.5">
        <div class="text-[11px] font-semibold text-[#217346] border-b-2 border-[#217346] px-3 py-1 cursor-default">Inicio</div>
      </div>
      <!-- Ribbon groups -->
      <div class="flex items-end px-2 py-1 gap-0 flex-wrap">

        <!-- Grupo: Portapapeles -->
        <div class="ribbon-group">
          <button class="ribbon-btn-large" @click="() => {}">
            <i class="fa-sharp fa-regular fa-paste text-[18px] text-[#217346]"></i>
            <span class="ribbon-btn-label">Pegar</span>
          </button>
          <div class="ribbon-group-label">Portapapeles</div>
        </div>

        <div class="ribbon-sep"></div>

        <!-- Grupo: Filas -->
        <div class="ribbon-group">
          <div class="flex flex-col gap-0.5">
            <button class="ribbon-btn-small" @click="addRows(5)" title="Insertar 5 filas al final">
              <i class="fa-sharp fa-regular fa-plus text-[10px] text-[#217346]"></i>
              <span>Insertar filas</span>
            </button>
            <button
              class="ribbon-btn-small"
              :class="{ 'opacity-40 cursor-not-allowed': selectedRows.size === 0 }"
              :disabled="selectedRows.size === 0"
              @click="deleteSelectedRows"
              title="Eliminar filas seleccionadas"
            >
              <i class="fa-sharp fa-regular fa-trash-can text-[10px] text-red-500"></i>
              <span>Eliminar filas</span>
            </button>
          </div>
          <div class="ribbon-group-label">Filas</div>
        </div>

        <div class="ribbon-sep"></div>

        <!-- Grupo: Edición -->
        <div class="ribbon-group">
          <div class="flex flex-col gap-0.5">
            <button class="ribbon-btn-small" @click="clearAll" title="Limpiar todo el editor">
              <i class="fa-sharp fa-regular fa-broom text-[10px] text-orange-500"></i>
              <span>Limpiar todo</span>
            </button>
            <button class="ribbon-btn-small" @click="showSearch = !showSearch" title="Buscar en la tabla">
              <i class="fa-sharp fa-regular fa-magnifying-glass text-[10px] text-blue-500"></i>
              <span>Buscar</span>
            </button>
          </div>
          <div class="ribbon-group-label">Edición</div>
        </div>

        <div class="ribbon-sep"></div>

        <!-- Grupo: Datos -->
        <div class="ribbon-group">
          <div class="flex flex-col gap-0.5">
            <button class="ribbon-btn-small" @click="sortAZ" title="Ordenar de A a Z">
              <i class="fa-sharp fa-regular fa-arrow-up-a-z text-[10px] text-[#217346]"></i>
              <span>Ordenar A-Z</span>
            </button>
            <button class="ribbon-btn-small" @click="sortZA" title="Ordenar de Z a A">
              <i class="fa-sharp fa-regular fa-arrow-down-z-a text-[10px] text-[#217346]"></i>
              <span>Ordenar Z-A</span>
            </button>
          </div>
          <div class="ribbon-group-label">Datos</div>
        </div>

      </div>
    </div>

    <!-- ════════════ SEARCH BAR ════════════ -->
    <div v-if="showSearch && activeTab === 'editor'" class="bg-[#f9f9f9] border-b border-[#e0e0e0] px-3 py-1.5 flex items-center gap-2 flex-shrink-0">
      <i class="fa-solid fa-magnifying-glass text-[11px] text-gray-400"></i>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar en todas las celdas..."
        class="flex-1 bg-white border border-[#d4d4d4] rounded-sm px-2 py-1 text-[12px] outline-none focus:border-[#0078d4]"
      />
      <button @click="showSearch = false; searchQuery = ''" class="text-gray-400 hover:text-gray-600 text-xs">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <!-- ════════════ FORMULA BAR ════════════ -->
    <div v-if="activeTab === 'editor'" class="bg-white border-b border-[#d4d4d4] flex items-center h-[26px] text-[13px] flex-shrink-0">
      <!-- Cell reference -->
      <div class="w-[60px] border-r border-[#d4d4d4] h-full flex items-center justify-center font-semibold text-[#333] bg-[#f9f9f9] text-[12px]">
        {{ activeCellRef }}
      </div>
      <!-- Separator -->
      <div class="w-px h-full bg-[#d4d4d4]"></div>
      <!-- fx -->
      <div class="w-[26px] h-full flex items-center justify-center text-gray-400 border-r border-[#d4d4d4] italic text-[12px] font-serif">
        <i>fx</i>
      </div>
      <!-- Separator -->
      <div class="w-px h-full bg-[#d4d4d4]"></div>
      <!-- Value -->
      <div class="flex-1 px-2 text-[#333] truncate flex items-center gap-2 h-full">
        <span class="text-[12px]">{{ activeCellValue }}</span>
        <span
          v-if="activeCell.col === 2 && activeCellValue && !hasInvalidNumber(activeCellValue)"
          class="text-[11px] text-[#217346] font-medium"
        >
          &rarr; {{ formatNumero(activeCellValue) }}@c.us
        </span>
        <span
          v-if="activeCell.col === 2 && activeCellValue && hasInvalidNumber(activeCellValue)"
          class="text-[11px] text-red-500 font-medium"
        >
          Número inválido
        </span>
      </div>
    </div>

    <!-- ════════════ EDITOR TAB: SPREADSHEET ════════════ -->
    <div v-if="activeTab === 'editor'" class="flex-1 overflow-auto bg-white relative" @click.self="clearSelection">
      <table class="border-collapse min-w-[650px] text-[13px] font-['Calibri',_sans-serif]" style="table-layout: fixed; width: 100%;">
        <colgroup>
          <col style="width: 32px;" /><!-- select-all corner -->
          <col style="width: 40px;" /><!-- row numbers -->
          <col style="width: auto;" />
          <col style="width: auto;" />
          <col style="width: auto;" />
          <col style="width: auto;" />
        </colgroup>
        <!-- Column headers -->
        <thead class="sticky top-0 z-20">
          <tr>
            <!-- Select-all corner -->
            <th
              class="bg-[#e6e6e6] border-b border-r border-[#bfbfbf] cursor-pointer hover:bg-[#d4d4d4] transition-colors"
              style="height: 22px;"
              @click="handleSelectAll"
              title="Seleccionar todo"
            >
              <div class="w-full h-full flex items-center justify-center">
                <div v-if="selectAll" class="w-2 h-2 bg-[#217346]"></div>
              </div>
            </th>
            <!-- Row number header -->
            <th class="bg-[#e6e6e6] border-b border-r border-[#bfbfbf]" style="height: 22px;"></th>
            <!-- Column headers A, B, C, D -->
            <th
              v-for="(col, ci) in COLUMNS"
              :key="col.key"
              class="bg-[#e6e6e6] border-b border-r border-[#bfbfbf] text-[11px] font-normal text-[#333] relative filter-dropdown-container"
              :class="{ 'bg-[#b8cce4]': selectedCols.has(ci) || selectAll }"
              style="height: 22px;"
              @click="handleSelectColumn(ci)"
            >
              <div class="flex items-center justify-between px-1 h-full">
                <span class="flex-1 text-center font-medium">{{ col.letter }} - {{ col.label }}</span>
                <!-- Filter dropdown button -->
                <button
                  @click.stop="openColumnFilter(col.key)"
                  class="ml-1 text-[9px] text-gray-500 hover:text-[#333] transition-colors flex-shrink-0"
                  :class="{ 'text-[#217346]': columnFilters[col.key].active }"
                  title="Filtrar"
                >
                  <i :class="columnFilters[col.key].active ? 'fa-solid fa-filter' : 'fa-solid fa-chevron-down'" class="text-[9px]"></i>
                </button>
              </div>

              <!-- Filter dropdown -->
              <div
                v-if="openFilter === col.key"
                class="absolute top-full right-0 z-50 bg-white border border-[#d4d4d4] shadow-lg min-w-[220px] mt-0 filter-dropdown-container"
                @click.stop
                style="font-weight: normal;"
              >
                <!-- Search -->
                <div class="p-2 border-b border-[#e0e0e0]">
                  <input
                    v-model="columnFilters[col.key].search"
                    type="text"
                    placeholder="Buscar..."
                    class="w-full border border-[#d4d4d4] rounded-sm px-2 py-1 text-[12px] outline-none focus:border-[#0078d4]"
                  />
                </div>
                <!-- Select all -->
                <div class="px-2 py-1 border-b border-[#e0e0e0]">
                  <label class="flex items-center gap-2 cursor-pointer text-[12px] text-[#333] hover:bg-[#f0f0f0] px-1 py-0.5 rounded-sm">
                    <input
                      type="checkbox"
                      :checked="filteredFilterValues(col.key).every(v => columnFilters[col.key].selected.has(v))"
                      @change="toggleSelectAllFilter(col.key)"
                      class="accent-[#217346]"
                    />
                    <span>(Seleccionar todo)</span>
                  </label>
                </div>
                <!-- Values list -->
                <div class="max-h-[200px] overflow-y-auto px-2 py-1">
                  <label
                    v-for="val in filteredFilterValues(col.key)"
                    :key="val"
                    class="flex items-center gap-2 cursor-pointer text-[12px] text-[#333] hover:bg-[#f0f0f0] px-1 py-0.5 rounded-sm"
                  >
                    <input
                      type="checkbox"
                      :checked="columnFilters[col.key].selected.has(val)"
                      @change="toggleFilterValue(col.key, val)"
                      class="accent-[#217346]"
                    />
                    <span class="truncate">{{ val }}</span>
                  </label>
                  <div v-if="filteredFilterValues(col.key).length === 0" class="text-[11px] text-gray-400 py-2 text-center">
                    Sin resultados
                  </div>
                </div>
                <!-- Buttons -->
                <div class="flex justify-end gap-1 p-2 border-t border-[#e0e0e0]">
                  <button
                    @click="cancelFilter(col.key)"
                    class="text-[11px] text-[#333] px-3 py-1 border border-[#d4d4d4] rounded-sm hover:bg-[#f0f0f0]"
                  >
                    Cancelar
                  </button>
                  <button
                    @click="applyFilter(col.key)"
                    class="text-[11px] text-white bg-[#217346] px-3 py-1 rounded-sm hover:bg-[#1a5c38]"
                  >
                    Aceptar
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
              'hover:bg-[#f5f5f5]': !selectedRows.has(row._idx) && !selectAll
            }"
            v-show="!searchQuery || COL_KEYS.some(k => String(row[k]).toLowerCase().includes(searchQuery.toLowerCase()))"
            @contextmenu="onContextMenu($event, row._idx, activeCell.col >= 0 ? activeCell.col : 0)"
          >
            <!-- Row selector (replaces checkbox) -->
            <td
              class="bg-[#f9f9f9] border-b border-r border-[#d4d4d4] text-center sticky left-0 z-10 cursor-pointer hover:bg-[#d4d4d4]"
              :class="{ 'bg-[#b8cce4]': selectedRows.has(row._idx) || selectAll }"
              style="height: 22px; width: 32px;"
              @click="handleSelectRow(row._idx, $event)"
            >
            </td>

            <!-- Row number -->
            <td
              class="bg-[#f9f9f9] border-b border-r border-[#d4d4d4] text-center text-[11px] text-[#888] font-normal sticky left-[32px] z-10 cursor-pointer hover:bg-[#d4d4d4]"
              :class="{ 'bg-[#b8cce4]': selectedRows.has(row._idx) || selectAll }"
              style="height: 22px; width: 40px;"
              @click="handleSelectRow(row._idx, $event)"
            >
              {{ row._idx + 1 }}
            </td>

            <!-- Data cells -->
            <td
              v-for="(col, ci) in COLUMNS"
              :key="col.key"
              :data-cell="row._idx + '-' + ci"
              class="border-b border-r border-[#d4d4d4] px-0 py-0 relative"
              :class="{
                'cell-active': isCellActive(row._idx, ci) && !isCellInSelection(row._idx, ci),
                'cell-active': isCellActive(row._idx, ci),
                'bg-[#cce4f7]': isCellInSelection(row._idx, ci) && !isCellActive(row._idx, ci),
              }"
              style="height: 22px;"
              @click="setActiveCell(row._idx, ci, $event)"
              @contextmenu="onContextMenu($event, row._idx, ci)"
            >
              <!-- Error triangle for invalid numbers -->
              <div
                v-if="col.key === 'NUMERO' && row[col.key] && hasInvalidNumber(row[col.key])"
                class="absolute top-0 right-0 w-0 h-0"
                style="border-top: 6px solid #ef4444; border-left: 6px solid transparent;"
              ></div>
              <input
                v-model="rows[row._idx][col.key]"
                @input="onCellInput"
                @focus="setActiveCell(row._idx, ci)"
                @paste="onPaste($event, row._idx, ci)"
                @keydown="onKeydown($event, row._idx, ci)"
                class="w-full h-full bg-transparent outline-none text-[13px] text-[#333] px-1 font-['Calibri',_sans-serif]"
                :class="{
                  'text-red-600': col.key === 'NUMERO' && row[col.key] && hasInvalidNumber(row[col.key]),
                  'border-red-400': col.key === 'NUMERO' && row[col.key] && hasInvalidNumber(row[col.key]),
                }"
                style="border: none; height: 100%;"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ════════════ CONTEXT MENU ════════════ -->
    <Teleport to="body">
      <div
        v-if="contextMenu.show"
        class="fixed bg-white border border-[#d4d4d4] shadow-lg z-[9999] py-1 min-w-[200px] text-[12px] font-['Calibri',_sans-serif]"
        :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
        @click.stop
      >
        <button class="ctx-item" @click="insertRowAt(contextMenu.rowIdx, 'above'); closeContextMenu()">
          <i class="fa-solid fa-arrow-up-from-line text-[10px] w-4 text-center text-gray-500"></i>
          <span>Insertar fila arriba</span>
        </button>
        <button class="ctx-item" @click="insertRowAt(contextMenu.rowIdx, 'below'); closeContextMenu()">
          <i class="fa-solid fa-arrow-down-from-line text-[10px] w-4 text-center text-gray-500"></i>
          <span>Insertar fila abajo</span>
        </button>
        <button class="ctx-item" @click="removeRow(contextMenu.rowIdx); closeContextMenu()">
          <i class="fa-solid fa-trash-can text-[10px] w-4 text-center text-red-400"></i>
          <span>Eliminar fila</span>
        </button>
        <button
          class="ctx-item"
          :class="{ 'opacity-40 cursor-not-allowed': selectedRows.size === 0 }"
          :disabled="selectedRows.size === 0"
          @click="deleteSelectedRows(); closeContextMenu()"
        >
          <i class="fa-solid fa-trash-can text-[10px] w-4 text-center text-red-400"></i>
          <span>Eliminar filas seleccionadas ({{ selectedRows.size }})</span>
        </button>

        <!-- Separator -->
        <div class="my-1 border-t border-[#e0e0e0]"></div>

        <button class="ctx-item opacity-40 cursor-not-allowed" disabled>
          <i class="fa-solid fa-table text-[10px] w-4 text-center text-gray-400"></i>
          <span>Insertar columna</span>
        </button>
        <button class="ctx-item opacity-40 cursor-not-allowed" disabled>
          <i class="fa-solid fa-table text-[10px] w-4 text-center text-gray-400"></i>
          <span>Eliminar columna</span>
        </button>

        <!-- Separator -->
        <div class="my-1 border-t border-[#e0e0e0]"></div>

        <button class="ctx-item" @click="clearCellContent(contextMenu.rowIdx, contextMenu.colIdx); closeContextMenu()">
          <i class="fa-solid fa-eraser text-[10px] w-4 text-center text-orange-400"></i>
          <span>Limpiar contenido de celda</span>
        </button>
        <button
          class="ctx-item"
          :class="{ 'opacity-40 cursor-not-allowed': selectedRows.size === 0 }"
          :disabled="selectedRows.size === 0"
          @click="clearSelectedRowsContent(); closeContextMenu()"
        >
          <i class="fa-solid fa-broom text-[10px] w-4 text-center text-orange-400"></i>
          <span>Limpiar contenido de filas seleccionadas</span>
        </button>
      </div>
    </Teleport>

    <!-- ════════════ STATUS BAR ════════════ -->
    <div class="bg-[#217346] text-white text-[11px] px-4 py-1 flex items-center justify-between flex-shrink-0">
      <div class="flex items-center gap-4">
        <span>Filas: {{ filledRows.length }}</span>
        <span v-if="selectionCount > 0" class="text-white/80">Seleccionadas: {{ selectionCount }}</span>
        <span v-if="hasActiveFilters" class="text-yellow-200">
          <i class="fa-solid fa-filter text-[9px] mr-0.5"></i> Filtro activo
        </span>
      </div>
      <div class="flex items-center gap-4 text-white/80">
        <template v-if="selectionNumericStats">
          <span>Promedio: {{ selectionNumericStats.avg }}</span>
          <span>Conteo: {{ selectionNumericStats.count }}</span>
          <span>Suma: {{ selectionNumericStats.sum }}</span>
        </template>
      </div>
    </div>

    <!-- ════════════ SHEET TABS ════════════ -->
    <div class="bg-[#e6e6e6] border-t border-[#bfbfbf] flex items-center px-1 py-0 gap-0 flex-shrink-0" style="height: 26px;">
      <!-- Nav arrows -->
      <div class="flex items-center gap-0 mr-1">
        <button class="text-gray-500 hover:text-[#333] px-1 py-0.5 text-[10px]"><i class="fa-solid fa-chevron-left"></i></button>
        <button class="text-gray-500 hover:text-[#333] px-1 py-0.5 text-[10px]"><i class="fa-solid fa-chevron-right"></i></button>
      </div>

      <!-- Add rows button -->
      <button
        @click="addRows(5)"
        class="text-gray-500 hover:text-[#217346] px-1.5 py-0.5 transition-colors mr-1"
        title="Agregar 5 filas"
      >
        <i class="fa-solid fa-plus text-[10px]"></i>
      </button>

      <!-- Editor tab -->
      <div
        class="px-3 py-0.5 text-[11px] cursor-default border border-[#bfbfbf] rounded-t-sm -mb-px bg-white border-b-white text-[#333] font-medium"
      >
        <i class="fa-solid fa-file-spreadsheet text-[#217346] text-[10px] mr-1"></i>
        Editor
      </div>
    </div>

  </div>
</template>

<style scoped>
/* ── Cell active state (Excel blue border) ── */
.cell-active {
  outline: 2px solid #0078d4;
  outline-offset: -2px;
  z-index: 5;
  position: relative;
}

/* ── Cell error (red border + subtle bg) ── */
.cell-error {
  background-color: #fef2f2;
}

/* ── Ribbon group ── */
.ribbon-group {
  @apply flex flex-col items-center px-1.5 pb-0.5 relative;
}
.ribbon-group-label {
  @apply text-[9px] text-gray-500 mt-0.5 text-center whitespace-nowrap;
}
.ribbon-sep {
  @apply w-px self-stretch bg-[#d4d4d4] mx-1;
  min-height: 42px;
}

/* ── Ribbon buttons ── */
.ribbon-btn-large {
  @apply flex flex-col items-center gap-0.5 px-3 py-1 rounded-[2px] hover:bg-[#e0e0e0] transition-colors cursor-pointer text-[#333];
}
.ribbon-btn-large .ribbon-btn-label {
  @apply text-[10px] whitespace-nowrap;
}
.ribbon-btn-small {
  @apply flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] hover:bg-[#e0e0e0] transition-colors cursor-pointer text-[11px] text-[#333] whitespace-nowrap;
}

/* ── Context menu items ── */
.ctx-item {
  @apply w-full flex items-center gap-2 px-3 py-1 text-left text-[#333] hover:bg-[#e8f0fe] transition-colors cursor-pointer;
}
.ctx-item:disabled {
  @apply cursor-not-allowed;
}

/* ── Scrollbar (Excel-like) ── */
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
