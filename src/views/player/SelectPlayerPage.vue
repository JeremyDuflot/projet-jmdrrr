<script setup>
import { ref } from 'vue'
import PlayerCard from '@/components/players/PlayerCard.vue'
import PlayerCreateModal from '@/components/players/PlayerCreateModal.vue'
import { useCampaignsStore } from '@/stores/rpgStore.js'
import { useRouter } from 'vue-router'
import { Plus } from '@lucide/vue'

const router = useRouter()
const campaignsStore = useCampaignsStore()
const players = campaignsStore.players

const showCreateModal = ref(false)

function handlePlayerSelect(player) {
  router.push({ name: 'player-sheet', params: { playerName: player.name } })
}

function handleOpenCreateModal() {
  showCreateModal.value = true
}

function handlePlayerCreated(player) {
  router.push({ name: 'player-sheet', params: { playerName: player.name } })
}
</script>

<template>
  <main class="flex flex-col items-center justify-center pt-2">
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

      <button
        type="button"
        class="w-72 bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl p-5 shadow-lg cursor-pointer transition-all duration-300 hover:border-amber-400/70 hover:shadow-2xl hover:scale-105 flex flex-col items-center justify-center min-h-140px"
        @click="handleOpenCreateModal"
      >
        <Plus class="w-12 h-12 text-amber-500 mb-2" />
        <h3 class="text-xl font-bold text-amber-500 font-['Cinzel']">Nouveau Personnage</h3>
      </button>
    </div>

    <PlayerCreateModal
      :show="showCreateModal"
      @close="showCreateModal = false"
      @created="handlePlayerCreated"
    />
  </main>
</template>
