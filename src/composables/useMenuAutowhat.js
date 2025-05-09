import axios from "axios";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useGetRoutes } from "@/composables/getRoutes";
import { storeMenuAutowhat } from "@/store/storeMenuAutowhat";

const { profileInfo, logoutWhatsapp, statusLog } = useGetRoutes();
const menu = storeMenuAutowhat();

export const useMenuAutowhat = () => {
  const router = useRouter();
  const token = ref(localStorage.getItem("token"));

  // variables menu
  const photo = ref(false);
  const phone = ref(false);

  const getProfileInfo = async () => {
    try {
      const headers = {
        Authorization: "Bearer " + token.value,
      };
      const { data } = await axios.get(profileInfo, { headers });
      photo.value = data.avatar;
      phone.value = data.phone;
    } catch (error) {
      console.error(error);
    }
  };

  const logout = async () => {
    try {
      menu.modifySesion(true);
      const headers = {
        Authorization: "Bearer " + token.value,
      };
      const { data } = await axios.get(logoutWhatsapp, { headers });
      if (data.success) router.push("/api-connect");
    } catch (error) {
      console.error(error);
    } finally {
      menu.modifySesion(false);
    }
  };
console.log(menu.sesion)
  const logStatus = async () => {
    try {
      const headers = {
        Authorization: "Bearer " + token.value,
      };
      const { data } = await axios.get(statusLog, { headers });
      if (data && data.stateInstance === "authorized") {
        router.push("/home-autowhat");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return {
    photo,
    phone,
    getProfileInfo,
    logout,
    logStatus,
  };
};
