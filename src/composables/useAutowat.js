import axios from "axios";

const AUTOWAT_URL = "http://localhost:3300";

export const useAutowat = () => {
  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const get = (path) => axios.get(`${AUTOWAT_URL}${path}`, { headers });
  const post = (path, data) => axios.post(`${AUTOWAT_URL}${path}`, data, { headers });

  return { AUTOWAT_URL, token, headers, get, post };
};
