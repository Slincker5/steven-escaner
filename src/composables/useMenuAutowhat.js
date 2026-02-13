import axios from "axios";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useGetRoutes } from "@/composables/getRoutes";
import { storeMenuAutowhat } from "@/store/storeMenuAutowhat";

const { profileInfo, logoutWhatsapp, statusLog } = useGetRoutes();

export const useMenuAutowhat = () => {
  const router = useRouter();
  const token = ref(localStorage.getItem("token"));

let nombre = ref(false)
let numero = ref(false)
let photo = ref(false)
let log = ref(false)

const getInfo = async () => {
    try {
        const { data } = await axios.get("https://auto.autowat.site/auth")
        numero.value = data.numero
        nombre.value = data.nombre
        photo.value = data.fotoUrl
    } catch(error){
        console.log(error)
    }
}


const logout = async () => {
    try {
      log.value = true
        const { data } = await axios.post("https://api.autowat.site/session/force-logout",{})
        
    } catch(error){
        console.log(error)
    } finally {
      log.value = false
      router.push("/api-connect")
    }
}

  return {
    photo,
    numero,
    nombre,
    getInfo,
    logout,
    log
  };
};
