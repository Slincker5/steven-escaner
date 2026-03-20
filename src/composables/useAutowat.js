import api from "@/services/api";

const AUTOWAT_URL = "https://whatsapp.autowat.site";

export const useAutowat = () => {
  const get = (path) => api.get(`${AUTOWAT_URL}${path}`);
  const post = (path, data) => api.post(`${AUTOWAT_URL}${path}`, data);

  return { AUTOWAT_URL, get, post };
};
