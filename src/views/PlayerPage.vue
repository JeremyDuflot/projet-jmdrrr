<script setup>
import PlayerCard from '../components/PlayerCard.vue'
import { getPlayers } from '../data/mockPlayers.js'

const players = getPlayers()

/** @param {ReturnType<typeof getPlayers>[number]} player */
function handlePlayerSelect(player) {
  console.log(player)
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
        Choisissez votre joueur !
      </h1>
      <p
        class="text-lg font-bold text-center text-amber-500 font-['Cinzel'] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
      >
        Veuillez sélectionner votre joueur pour commencer l'aventure...
      </p>
    </div>

    <div class="flex flex-wrap w-full px-12 items-center gap-6 justify-center">
      <PlayerCard
        v-for="player in players"
        :key="player.id"
        :player="player"
        class="w-72"
        @select="handlePlayerSelect"
      />
    </div>
  </main>
</template>
