<script setup>
import { useRouter } from 'vue-router'
import { Home, ArrowLeft } from '@lucide/vue'

const router = useRouter()

function goBack() {
  router.back()
}
</script>

<template>
  <div class="relative min-h-screen pt-16 bg-[url('/images/Background.png')] bg-cover bg-center">
    <div class="absolute top-2 left-2 z-50">
      <button
        type="button"
        class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl p-3 shadow-lg cursor-pointer transition-all duration-300 hover:border-amber-400/70 hover:shadow-2xl flex items-center gap-2"
        @click="goBack"
      >
        <ArrowLeft class="w-5 h-5 text-amber-500" />
        <span class="text-amber-500 font-['Cinzel']">Retour</span>
      </button>
    </div>
    <div class="absolute top-2 right-2 z-50">
      <button
        type="button"
        class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl p-3 shadow-lg cursor-pointer transition-all duration-300 hover:border-amber-400/70 hover:shadow-2xl flex items-center gap-2"
        @click="router.push('/')"
      >
        <Home class="w-5 h-5 text-amber-500" />
        <span class="text-amber-500 font-['Cinzel']">Accueil</span>
      </button>
    </div>
    <slot />
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&display=swap');
</style>
