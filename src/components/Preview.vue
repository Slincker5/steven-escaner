<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { storeMensajePersonalizado } from '@/store/storeMensajePersonalizado'
import { storeEnvioAutomatizado } from '@/store/storeEnvioAutomatizado'

const mensaje = storeMensajePersonalizado()
const envioStore = storeEnvioAutomatizado()
const hora = ref('')
let intervalo = null

const actualizarHora = () => {
  const ahora = new Date()
  hora.value = `${ahora.getHours().toString().padStart(2, '0')}:${ahora.getMinutes().toString().padStart(2, '0')}`
}

onMounted(() => {
  actualizarHora()
  intervalo = setInterval(actualizarHora, 1000)
})

onUnmounted(() => {
  if (intervalo) clearInterval(intervalo)
})
</script>

<template>
  <div class="p-4">
    <h2 class="font-medium text-gray-900 pb-4 border-b border-dashed border-gray-300 mb-4">
      <i class="fa-duotone fa-regular fa-mobile mr-2 text-blue-600"></i>
      Vista previa
    </h2>

    <!-- WhatsApp Chat Preview -->
    <div class="wa-phone mx-auto">
      <!-- Status bar -->
      <div class="wa-statusbar">
        <span>{{ hora }}</span>
        <div class="flex items-center gap-1">
          <i class="fa-duotone fa-regular fa-signal text-[8px]"></i>
          <i class="fa-duotone fa-regular fa-wifi text-[8px]"></i>
          <i class="fa-duotone fa-regular fa-battery-full text-[8px]"></i>
        </div>
      </div>

      <!-- Header -->
      <div class="wa-header">
        <i class="fa-duotone fa-regular fa-arrow-left text-white text-sm"></i>
        <div class="wa-avatar">
          <i class="fa-duotone fa-regular fa-user text-[10px] text-gray-400"></i>
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-white text-sm font-medium truncate">Cliente</div>
          <div class="text-green-200 text-[10px]">en linea</div>
        </div>
        <i class="fa-duotone fa-regular fa-video text-white text-sm mr-3"></i>
        <i class="fa-duotone fa-regular fa-phone text-white text-sm mr-3"></i>
        <i class="fa-duotone fa-regular fa-ellipsis-vertical text-white text-sm"></i>
      </div>

      <!-- Chat area -->
      <div class="wa-chat">
        <!-- Wallpaper pattern -->
        <div class="wa-wallpaper"></div>

        <div class="wa-messages">
          <!-- Fecha -->
          <div class="wa-date-badge">HOY</div>

          <!-- Imagen si hay -->
          <div v-if="envioStore.imagen" class="wa-bubble wa-bubble-sent">
            <img :src="envioStore.imagen" class="rounded-md w-full mb-1" />
            <div class="wa-bubble-text" v-if="mensaje.textareaMensajePersonalizado && mensaje.textareaMensajePersonalizado !== 'Escribe tu mensaje'">
              {{ mensaje.textareaMensajePersonalizado }}
            </div>
            <div class="wa-bubble-meta">
              <span class="wa-bubble-time">{{ hora }}</span>
              <i class="fa-duotone fa-regular fa-check-double text-[9px] text-blue-400"></i>
            </div>
          </div>

          <!-- Mensaje de texto -->
          <div v-else class="wa-bubble wa-bubble-sent">
            <div class="wa-bubble-text">
              {{ mensaje.textareaMensajePersonalizado || 'Escribe tu mensaje...' }}
            </div>
            <div class="wa-bubble-meta">
              <span class="wa-bubble-time">{{ hora }}</span>
              <i class="fa-duotone fa-regular fa-check-double text-[9px] text-blue-400"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Input bar -->
      <div class="wa-inputbar">
        <div class="wa-input-left">
          <i class="fa-duotone fa-regular fa-face-smile text-gray-500 text-lg"></i>
          <div class="wa-input-field">Mensaje</div>
          <i class="fa-duotone fa-regular fa-paperclip text-gray-500 text-lg rotate-[-45deg]"></i>
          <i class="fa-duotone fa-regular fa-camera text-gray-500 text-lg"></i>
        </div>
        <div class="wa-mic-btn">
          <i class="fa-duotone fa-regular fa-microphone text-white text-sm"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wa-phone {
  width: 300px;
  background: #efeae2;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0,0,0,.15);
  border: 6px solid #1a1a1a;
}

.wa-statusbar {
  background: #075e54;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 12px;
  color: white;
  font-size: 10px;
}

.wa-header {
  background: #075e54;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px 10px;
}

.wa-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #dfe5e7;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.wa-chat {
  position: relative;
  height: 340px;
  overflow: hidden;
}

.wa-wallpaper {
  position: absolute;
  inset: 0;
  background-color: #efeae2;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c7bfb0' fill-opacity='0.25'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.6;
}

.wa-messages {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
  padding: 8px;
  gap: 4px;
}

.wa-date-badge {
  align-self: center;
  background: #d1e7dd;
  color: #4a7c6f;
  font-size: 10px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 6px;
  margin-bottom: 4px;
}

.wa-bubble {
  max-width: 85%;
  padding: 6px 8px;
  border-radius: 8px;
  position: relative;
  word-wrap: break-word;
}

.wa-bubble-sent {
  align-self: flex-end;
  background: #d9fdd3;
  border-top-right-radius: 0;
}

.wa-bubble-text {
  font-size: 13px;
  color: #111b21;
  line-height: 1.35;
  white-space: pre-wrap;
  padding-right: 50px;
}

.wa-bubble-meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 3px;
  margin-top: 2px;
}

.wa-bubble-time {
  font-size: 10px;
  color: #667781;
}

.wa-inputbar {
  background: #f0f2f5;
  padding: 6px 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.wa-input-left {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border-radius: 20px;
  padding: 6px 12px;
}

.wa-input-field {
  flex: 1;
  font-size: 13px;
  color: #8696a0;
}

.wa-mic-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #00a884;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>
