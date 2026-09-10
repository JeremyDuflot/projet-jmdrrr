<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  role: {
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
    class="group relative flex-1 max-w-md h-124 rounded-lg overflow-hidden border-2 border-amber-500/40 ring-1 ring-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] cursor-pointer transition-all duration-300 hover:scale-105 hover:border-amber-400/70 hover:shadow-[0_25px_70px_rgba(0,0,0,0.9)]"
    @click="emit('select', role)"
  >
    <div
      class="absolute inset-0 bg-cover bg-center bg-no-repeat grayscale group-hover:grayscale-0 transition-all duration-500"
      :style="{ backgroundImage: `url(${image})` }"
    ></div>

    <div
      class="absolute inset-0 bg-black/20 flex flex-col justify-center items-center text-center px-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
    >
      <h2 class="text-2xl font-bold text-white mb-3">{{ title }}</h2>
      <p class="text-white/90">{{ description }}</p>
    </div>
  </div>
</template>
