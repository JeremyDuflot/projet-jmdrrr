<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
import SelectableRoleCard from '../components/SelectableRoleCard.vue'

/** @param {import('vue-router').RouteRecordNameGeneric} routeName */
function handleRoleSelect(routeName) {
  router.push({ name: routeName })
}
</script>

<template>
  <main
    class="flex flex-col items-center justify-center pt-2 bg-[url('/images/Background.png')] bg-cover bg-center min-h-screen"
  >
    <div class="bg-black/20 backdrop-blur-sm rounded-4xl px-12 py-8 mb-16">
      <h1
        class="text-6xl font-black mb-2 justify-center font-['Cinzel'] text-amber-500 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
      >
        Bienvenue dans le jeu de rôle !
      </h1>
      <p
        class="text-lg font-bold text-center text-amber-500 font-['Cinzel'] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
      >
        Veuillez sélectionner votre rôle pour commencer l'aventure...
      </p>
    </div>

    <div class="flex w-full px-12 items-center gap-12 justify-center">
      <SelectableRoleCard routeName="gm-campaigns" image="/images/GmImage.png" @select="handleRoleSelect">
      </SelectableRoleCard>
      <SelectableRoleCard routeName="player-campaigns" image="/images/PlayerImage.png" @select="handleRoleSelect">
      </SelectableRoleCard>
    </div>
  </main>
</template>
