import { ref, readonly } from "vue";
import { io } from "socket.io-client";

let socket = null;
const conectado = ref(false);

function conectar() {
  const token = localStorage.getItem("token");
  if (!token || socket) return;

  socket = io("https://auto.autowat.site", {
    auth: { token },
  });

  socket.on("connect", () => {
    conectado.value = true;
    console.log("Socket conectado");
  });

  socket.on("disconnect", () => {
    conectado.value = false;
    console.log("Socket desconectado");
  });

  socket.on("auth:error", (data) => {
    console.error("Socket auth error:", data.message);
    desconectar();
  });
}

function desconectar() {
  if (socket) {
    socket.disconnect();
    socket = null;
    conectado.value = false;
  }
}

function on(evento, callback) {
  if (socket) socket.on(evento, callback);
}

function off(evento, callback) {
  if (socket) socket.off(evento, callback);
}

export function useSocket() {
  return {
    conectado: readonly(conectado),
    conectar,
    desconectar,
    on,
    off,
  };
}
