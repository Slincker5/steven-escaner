<template>
  <div class="bg-gray-50 border-t border-gray-200">
    <!-- Tabs -->
    <div class="flex items-center gap-1 px-3 pt-2 pb-1 border-b border-gray-200">
      <button
        v-for="categoria in categoriasDisponibles"
        :key="categoria.nombre"
        @click="categoriaSeleccionada = categoria.nombre"
        class="px-2.5 py-1.5 rounded-md text-sm transition-all relative group"
        :class="categoriaSeleccionada === categoria.nombre
          ? 'bg-white shadow-sm border border-gray-200'
          : 'hover:bg-gray-100'"
      >
        <img :src="categoria.icono" :alt="categoria.nombre" class="w-5 h-5 object-contain" />
        <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block
               bg-gray-700 text-white text-[10px] rounded px-2 py-1 shadow whitespace-nowrap z-50">
          {{ categoria.nombre }}
        </span>
      </button>
    </div>

    <!-- Emojis grid -->
    <div class="flex flex-wrap gap-1 overflow-y-auto max-h-44 p-3 noscroll">
      <span
        v-for="emoji in emojisPorCategoria[categoriaSeleccionada]"
        :key="emoji.unicode + categoriaSeleccionada"
        class="text-xl cursor-pointer hover:bg-gray-200 rounded p-0.5 transition-colors"
        :title="emoji.label"
        @click="insertarEmoji(emoji)"
      >{{ emoji.emoji }}</span>
      <div v-if="!emojisPorCategoria[categoriaSeleccionada]?.length" class="text-gray-400 text-xs py-4 w-full text-center">
        Sin emojis recientes
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { storeMensajePersonalizado } from '@/store/storeMensajePersonalizado';

const emit = defineEmits(['emoji-selected']);
const mensajeStore = storeMensajePersonalizado();

const categoriaSeleccionada = ref('🕘 Recientes');
const emojisPorCategoria = ref({});

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
        grupos[categoria].push({ emoji: emoji.emoji, label: emoji.label, unicode: emoji.hexcode });
      }
    });
    emojisPorCategoria.value = grupos;
  } catch (error) {
    console.error('Error cargando emojis:', error);
  }
});

function insertarEmoji(emojiObj) {
  emit('emoji-selected', emojiObj.emoji);
  const textoActual = mensajeStore.textareaMensajePersonalizado || '';
  const nuevoTexto = textoActual === 'Escribe tu mensaje' ? emojiObj.emoji : textoActual + emojiObj.emoji;
  mensajeStore.cambiarTextareaMensajePersonalizado(nuevoTexto);
  guardarComoReciente(emojiObj);
}

function guardarComoReciente(emojiObj) {
  const recientes = cargarRecientes();
  if (!recientes.find(e => e.unicode === emojiObj.unicode)) {
    recientes.unshift(emojiObj);
    if (recientes.length > 20) recientes.pop();
    localStorage.setItem('emojisRecientes', JSON.stringify(recientes));
  }
  emojisPorCategoria.value['🕘 Recientes'] = recientes;
}

function cargarRecientes() {
  const data = localStorage.getItem('emojisRecientes');
  return data ? JSON.parse(data) : [];
}
</script>

<style scoped>
.noscroll::-webkit-scrollbar { display: none; }
.noscroll { -ms-overflow-style: none; scrollbar-width: none; }
</style>
