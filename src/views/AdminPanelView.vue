<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import api from "@/services/api";
import { useGetRoutes } from "@/composables/getRoutes";
import { useAutowat } from "@/composables/useAutowat";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const { url } = useGetRoutes();
const { get: autowatGet, post: autowatPost } = useAutowat();

const usuarios = ref([]);
const sesiones = ref([]);
const cargando = ref(false);

// Modal editar
const modalEditar = ref(false);
const editUser = ref({ usuario: "", username: "", rol: "User" });

// Modal password
const modalPassword = ref(false);
const passUser = ref({ usuario: "", password: "" });

const cargarUsuarios = async () => {
  try {
    const { data } = await api.get(`${url}/api/admin/users`);
    usuarios.value = Array.isArray(data) ? data : [];
  } catch (e) { console.log(e); }
};

const cargarSesiones = async () => {
  try {
    const { data } = await autowatGet("/admin/sessions");
    sesiones.value = data;
  } catch (e) { sesiones.value = []; }
};

const aprobar = async (uuid) => {
  const { data } = await api.post(`${url}/api/admin/approve-user`, { usuario: uuid });
  showToast(data.message);
  cargarUsuarios();
};

const bloquear = async (uuid) => {
  const { data } = await api.post(`${url}/api/admin/user/block`, { usuario: uuid });
  showToast(data.message);
  cargarUsuarios();
};

const eliminar = async (uuid) => {
  if (!confirm("Seguro que quieres eliminar este usuario?")) return;
  const { data } = await api.delete(`${url}/api/admin/user/delete`, { data: { usuario: uuid } });
  showToast(data.message);
  cargarUsuarios();
};

const abrirEditar = (user) => {
  editUser.value = { usuario: user.user_uuid, username: user.username, rol: user.rol };
  modalEditar.value = true;
};

const guardarEditar = async () => {
  const { data } = await api.put(`${url}/api/admin/user/edit`, editUser.value);
  showToast(data.message);
  modalEditar.value = false;
  cargarUsuarios();
};

const abrirPassword = (uuid) => {
  passUser.value = { usuario: uuid, password: "" };
  modalPassword.value = true;
};

const guardarPassword = async () => {
  if (passUser.value.password.length < 8) {
    showToast("Minimo 8 caracteres", true);
    return;
  }
  const { data } = await api.post(`${url}/api/admin/user/reset-password`, passUser.value);
  showToast(data.message);
  modalPassword.value = false;
};

const cancelarEnvio = async (uuid) => {
  try {
    const { data } = await api.post(`${url}/api/admin/whatsapp/cancel-batch`, { usuario: uuid });
    showToast(data.mensaje || data.message);
    cargarSesiones();
  } catch (e) {
    showToast(e?.response?.data?.error || "Error", true);
  }
};

const cerrarWhatsapp = async (uuid) => {
  if (!confirm("Cerrar sesion de WhatsApp de este usuario?")) return;
  try {
    const { data } = await api.post(`${url}/api/admin/whatsapp/close-session`, { usuario: uuid });
    showToast(data.mensaje || data.message);
    cargarSesiones();
  } catch (e) {
    showToast(e?.response?.data?.error || "Error", true);
  }
};

const showToast = (msg, error = false) => {
  const fn = error ? toast.error : toast.success;
  fn(msg, { theme: "colored", autoClose: 1500, position: toast.POSITION.BOTTOM_LEFT, transition: toast.TRANSITIONS.ZOOM });
};

const getSesionUsuario = (uuid) => sesiones.value.find((s) => s.userUuid === uuid);
let intervaloSesiones = null;

onMounted(() => {
  cargarUsuarios();
  cargarSesiones();
  intervaloSesiones = setInterval(cargarSesiones, 10000);
});

onUnmounted(() => {
  if (intervaloSesiones) clearInterval(intervaloSesiones);
});
</script>

<template>
  <div class="p-6 overflow-y-auto h-full">
    <h1 class="text-2xl font-medium text-gray-900 mb-6">
      <i class="fa-duotone fa-regular fa-shield-halved mr-2 text-blue-600"></i>
      Panel de Administracion
    </h1>

    <!-- TABLA USUARIOS -->
    <div class="bg-white rounded-xl shadow-lg shadow-black/10 border border-gray-200 overflow-hidden mb-6">
      <div class="p-4 border-b border-gray-200 bg-gray-50">
        <h2 class="font-medium text-gray-900">
          <i class="fa-duotone fa-regular fa-users mr-2 text-blue-600"></i>Usuarios ({{ usuarios.length }})
        </h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th class="px-4 py-3 text-left">Usuario</th>
              <th class="px-4 py-3 text-left">Rol</th>
              <th class="px-4 py-3 text-left">Estado</th>
              <th class="px-4 py-3 text-left">WhatsApp</th>
              <th class="px-4 py-3 text-left">Cola</th>
              <th class="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in usuarios" :key="u.user_uuid" class="border-b border-gray-100 hover:bg-blue-50 transition-colors">
              <td class="px-4 py-3 font-medium text-gray-900">{{ u.username }}</td>
              <td class="px-4 py-3">
                <span class="px-2 py-1 rounded-full text-xs font-medium"
                  :class="u.rol === 'Admin' ? 'bg-purple-100 text-purple-700' : u.rol === 'Editor' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'">
                  {{ u.rol }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span v-if="u.bloqueado == 1" class="text-red-600 text-xs font-medium">
                  <i class="fa-duotone fa-regular fa-ban mr-1"></i>Bloqueado
                </span>
                <span v-else-if="u.verificado == 1" class="text-green-600 text-xs font-medium">
                  <i class="fa-duotone fa-regular fa-circle-check mr-1"></i>Activo
                </span>
                <span v-else class="text-yellow-600 text-xs font-medium">
                  <i class="fa-duotone fa-regular fa-clock mr-1"></i>Pendiente
                </span>
              </td>
              <td class="px-4 py-3">
                <template v-if="getSesionUsuario(u.user_uuid)">
                  <span class="text-green-600 text-xs font-medium">
                    <i class="fa-duotone fa-regular fa-signal-bars-good text-[10px] mr-1"></i>
                    {{ getSesionUsuario(u.user_uuid).numero || 'Conectado' }}
                  </span>
                </template>
                <span v-else class="text-gray-400 text-xs">
                  <i class="fa-duotone fa-regular fa-signal-bars-slash text-[10px] mr-1"></i>Desconectado
                </span>
              </td>
              <td class="px-4 py-3">
                <template v-if="getSesionUsuario(u.user_uuid)?.cola?.enProceso">
                  <span class="text-blue-600 text-xs font-medium">
                    <i class="fa-duotone fa-regular fa-paper-plane fa-spin mr-1"></i>
                    {{ getSesionUsuario(u.user_uuid).cola.enviados }}/{{ getSesionUsuario(u.user_uuid).cola.total }}
                  </span>
                </template>
                <span v-else class="text-gray-400 text-xs">-</span>
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button v-if="u.verificado == 0" @click="aprobar(u.user_uuid)"
                    class="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600" title="Aprobar">
                    <i class="fa-duotone fa-regular fa-circle-check"></i>
                  </button>
                  <button @click="abrirEditar(u)" class="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600" title="Editar">
                    <i class="fa-duotone fa-regular fa-pen-to-square"></i>
                  </button>
                  <button @click="abrirPassword(u.user_uuid)" class="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600" title="Restablecer clave">
                    <i class="fa-duotone fa-regular fa-key"></i>
                  </button>
                  <button @click="bloquear(u.user_uuid)"
                    class="px-2 py-1 text-xs rounded text-white"
                    :class="u.bloqueado == 1 ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-500 hover:bg-orange-600'"
                    :title="u.bloqueado == 1 ? 'Desbloquear' : 'Bloquear'">
                    <i :class="u.bloqueado == 1 ? 'fa-duotone fa-regular fa-lock-open' : 'fa-duotone fa-regular fa-lock'"></i>
                  </button>
                  <button v-if="getSesionUsuario(u.user_uuid)?.cola?.enProceso"
                    @click="cancelarEnvio(u.user_uuid)"
                    class="px-2 py-1 text-xs bg-red-400 text-white rounded hover:bg-red-500" title="Cancelar envio">
                    <i class="fa-duotone fa-regular fa-circle-stop"></i>
                  </button>
                  <button v-if="getSesionUsuario(u.user_uuid)"
                    @click="cerrarWhatsapp(u.user_uuid)"
                    class="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700" title="Cerrar WhatsApp">
                    <i class="fa-duotone fa-regular fa-power-off"></i>
                  </button>
                  <button @click="eliminar(u.user_uuid)" class="px-2 py-1 text-xs bg-red-800 text-white rounded hover:bg-red-900" title="Eliminar">
                    <i class="fa-duotone fa-regular fa-trash-can"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL EDITAR -->
    <div v-if="modalEditar" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div class="bg-white w-96 p-6 rounded-lg shadow-lg">
        <h3 class="font-medium text-gray-900 mb-4"><i class="fa-duotone fa-regular fa-user-pen mr-2 text-blue-600"></i>Editar usuario</h3>
        <input v-model="editUser.username" placeholder="Username"
          class="w-full p-2.5 text-sm border border-gray-300 rounded-lg mb-3" />
        <select v-model="editUser.rol" class="w-full p-2.5 text-sm border border-gray-300 rounded-lg mb-4">
          <option value="User">User</option>
          <option value="Editor">Editor</option>
          <option value="Admin">Admin</option>
        </select>
        <div class="flex justify-end gap-2">
          <button @click="modalEditar = false" class="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
          <button @click="guardarEditar" class="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Guardar</button>
        </div>
      </div>
    </div>

    <!-- MODAL PASSWORD -->
    <div v-if="modalPassword" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div class="bg-white w-96 p-6 rounded-lg shadow-lg">
        <h3 class="font-medium text-gray-900 mb-4"><i class="fa-duotone fa-regular fa-key mr-2 text-yellow-500"></i>Restablecer contraseña</h3>
        <input v-model="passUser.password" type="password" placeholder="Nueva contraseña (min 8)"
          class="w-full p-2.5 text-sm border border-gray-300 rounded-lg mb-4" />
        <div class="flex justify-end gap-2">
          <button @click="modalPassword = false" class="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
          <button @click="guardarPassword" class="px-4 py-2 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600">Restablecer</button>
        </div>
      </div>
    </div>
  </div>
</template>
