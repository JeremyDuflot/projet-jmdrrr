<script setup>
defineProps({
  routeName: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['select'])
</script>

<template>
  <div
    class="group relative flex-1 max-w-md h-124 rounded-xl overflow-hidden border-2 border-amber-500/40 ring-1 ring-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] cursor-pointer transition-all duration-300 hover:scale-105 hover:border-amber-400/70 hover:shadow-[0_25px_70px_rgba(0,0,0,0.9)]"
    @click="emit('select', routeName)"
  >
    <div
      class="absolute inset-0 bg-cover bg-center bg-no-repeat grayscale group-hover:grayscale-0 transition-all duration-500"
      :style="{ backgroundImage: `url(${image})` }"
    ></div>
  </div>
</template>
