import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAutowat } from "@/composables/useAutowat";

export const useMenuAutowhat = () => {
  const router = useRouter();
  const { get, post } = useAutowat();

  let nombre = ref(false);
  let numero = ref(false);
  let photo = ref(false);
  let log = ref(false);

  const getInfo = async () => {
    try {
      const { data } = await get("/auth");
      numero.value = data.numero;
      nombre.value = data.nombre;
      photo.value = data.fotoUrl;
    } catch (error) {
      console.log(error);
    }
  };

  const logout = async () => {
    try {
      log.value = true;
      await post("/auth/logout");
    } catch (error) {
      console.log(error);
    } finally {
      log.value = false;
      router.push("/api-connect");
    }
  };

  return {
    photo,
    numero,
    nombre,
    getInfo,
    logout,
    log,
  };
};
