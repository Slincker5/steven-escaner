<template>
  <div class="border w-full bg-white rounded shadow">
    <!-- Tabs estilo WhatsApp con imágenes -->
    <div class="flex justify-between mb-3 bg-gray-200 p-4">
      <button
        v-for="categoria in categoriasDisponibles"
        :key="categoria.nombre"
        @click="categoriaSeleccionada = categoria.nombre"
        :class="[
          'px-3 py-1 transition-transform relative group',
          categoriaSeleccionada === categoria.nombre
            ? 'opacity-100 scale-125'
            : 'opacity-50 hover:opacity-80'
        ]"
      >
        <img
          :src="categoria.icono"
          :alt="categoria.nombre"
          class="w-6 h-6 object-contain"
        />
        <!-- Tooltip -->
        <span
          class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block 
                 bg-gray-800 text-white text-xs rounded px-2 py-1 shadow-lg whitespace-nowrap z-50"
        >
          {{ categoria.nombre }}
        </span>
      </button>
    </div>

    <!-- Emojis con tooltips personalizados -->
    <div class="flex flex-wrap gap-2 overflow-y-scroll max-h-52 w-full noscroll p-4 pt-1">
      <div
        v-for="emoji in emojisPorCategoria[categoriaSeleccionada]"
        :key="emoji.unicode + categoriaSeleccionada"
        class="relative group"
      >
        <span
          class="text-2xl cursor-pointer transition-transform hover:scale-125"
          @click="copiarAlPortapapeles(emoji)"
        >
          {{ emoji.emoji }}
        </span>
        <div
          class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block 
                 bg-gray-800 text-white text-xs rounded px-2 py-1 shadow-lg z-50 whitespace-nowrap"
        >
          {{ emoji.label }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const categoriaSeleccionada = ref('🕘 Recientes');
const emojisPorCategoria = ref({});

// Asegúrate de tener las imágenes en /public/img/
const categoriasDisponibles = [
  { nombre: '🕘 Recientes', icono: 'https://cdn.multimarcas.app/history.svg' },
  { nombre: '😀 Caritas', icono: 'https://cdn.multimarcas.app/smile.svg' },
  { nombre: '🧍 Personas', icono: 'https://cdn.multimarcas.app/smile.svg' },
  { nombre: '💡 Objetos', icono: 'https://cdn.multimarcas.app/object.svg' },
  { nombre: '💬 Símbolos', icono: 'https://cdn.multimarcas.app/symbol.svg' },
];

const GRUPOS_EMOJIBASE = {
  0: 'Smileys & Emotion',
  1: 'People & Body',
  6: 'Objects',
  7: 'Symbols',
};

function mapearCategoria(grupoId) {
  const grupo = GRUPOS_EMOJIBASE[grupoId] || '';
  if (grupo.includes('Smileys') || grupo.includes('Emotion')) return '😀 Caritas';
  if (grupo.includes('People') || grupo.includes('Body')) return '🧍 Personas';
  if (grupo.includes('Objects')) return '💡 Objetos';
  if (grupo.includes('Symbols')) return '💬 Símbolos';
  return null;
}

onMounted(async () => {
  try {
    const { data } = await axios.get('https://cdn.jsdelivr.net/npm/emojibase-data@latest/es/data.json');

    const grupos = {
      '🕘 Recientes': cargarRecientes(),
      '😀 Caritas': [],
      '🧍 Personas': [],
      '💡 Objetos': [],
      '💬 Símbolos': [],
    };

    data.forEach((emoji) => {
      const categoria = mapearCategoria(emoji.group);
      if (categoria && grupos[categoria]) {
        grupos[categoria].push({
          emoji: emoji.emoji,
          label: emoji.label,
          unicode: emoji.hexcode,
        });
      }
    });

    emojisPorCategoria.value = grupos;
  } catch (error) {
    console.error('Error cargando emojis:', error);
  }
});

function copiarAlPortapapeles(emojiObj) {
  navigator.clipboard.writeText(emojiObj.emoji);
  guardarComoReciente(emojiObj);
}

function guardarComoReciente(emojiObj) {
  const clave = 'emojisRecientes';
  const recientes = cargarRecientes();

  const yaExiste = recientes.find(e => e.unicode === emojiObj.unicode);
  if (!yaExiste) {
    recientes.unshift(emojiObj);
    if (recientes.length > 20) recientes.pop();
    localStorage.setItem(clave, JSON.stringify(recientes));
  }

  emojisPorCategoria.value['🕘 Recientes'] = recientes;
}

function cargarRecientes() {
  const data = localStorage.getItem('emojisRecientes');
  return data ? JSON.parse(data) : [];
}
</script>
<style>
.noscroll::-webkit-scrollbar {
  display: none;              /* Chrome, Safari */
}
</style>
