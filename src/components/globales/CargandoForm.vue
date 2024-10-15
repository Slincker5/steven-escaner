<script setup>
defineProps(["enviando", "textoCarga"]);
</script>

<template>
  <Transition>
    <div
      class="fixed w-full h-full flex items-center justify-center text-white bg-[#263238] p-4 text-xl top-0 left-0 z-50"
      v-if="enviando">
      <font-awesome-icon :icon="['fas', 'spinner']" class="fa-pulse" />
      {{ textoCarga }}
    </div>
  </Transition>

</template>
