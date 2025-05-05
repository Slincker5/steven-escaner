<script setup>
import axios from "axios";
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGetRoutes } from "@/composables/getRoutes";
import MenuAutoWhat from "@/components/menu/MenuAutoWhat.vue";

const router = useRouter()
const { profileInfo, logoutWhatsapp, statusLog, userNoPhoto } = useGetRoutes();
const token = ref(localStorage.getItem("token"))

// variables menu
const photo = ref(false)
const phone = ref(false)

const getProfileInfo = async () => {
    try {
        const headers = {
            Authorization: "Bearer " + token.value,
        }
        const { data } = await axios.get(profileInfo, { headers })
        photo.value = data.avatar
        phone.value = data.phone

    } catch (error) {
        console.error(error)
    }
}


getProfileInfo()

const logout = async() => {
    try {
        const headers = {
      Authorization: "Bearer " + token.value,
    }
    const { data } = await axios.get(logoutWhatsapp, { headers })
    if(data.success) router.push('/api-connect')
    }catch(error){
        console.error(error)
    }
}

const logStatus = async () => {
  try {
    const headers = {
      Authorization: "Bearer " + token.value,
    }
    const { data } = await axios.get(statusLog, { headers })
    if(data.stateInstance === "authorized"){
      router.push('/home-autowhat')
    }
  }catch(error){
    console.error(error)
  }
}
logStatus()
setInterval(() => {
logStatus()
}, 4000)

</script>
<template>
    <div class="migrid">
        <MenuAutoWhat v-if="photo && phone" :photo="photo" :phone="phone"  @logout="logout"></MenuAutoWhat>
        <div>Contenido - {{ photo }}</div>
        <div>Submenu</div>
    </div>
</template>
<style>
.migrid {
    display: grid;
    grid-template-columns: auto 1fr auto;
    height: 100vh;
    background: yellow;
}
</style>