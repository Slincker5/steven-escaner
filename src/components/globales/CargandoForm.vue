<script setup>
defineProps(["enviando", "textoCarga"]);
</script>

<template>
  <Transition>
    <div
      class="fixed w-full h-full flex items-center justify-center text-white bg-[#263238] p-4 text-xl top-0 left-0 z-50"
      v-if="enviando">
      <i class="fa-duotone fa-solid fa-spinner-third fa-spin"></i>
      {{ textoCarga }}
    </div>
  </Transition>

</template>
