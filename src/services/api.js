import axios from "axios";
import router from "@/router";

const api = axios.create({
  // NO poner baseURL porque el proyecto usa 2 backends distintos
});

// Request interceptor: agrega Authorization header automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: maneja 401 (token expirado/invalido)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user_uuid");
      localStorage.removeItem("username");
      localStorage.removeItem("rol");
      localStorage.removeItem("verificado");
      router.push("/login");
    }
    return Promise.reject(error);
  }
);

export default api;
