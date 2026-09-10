<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePlayerStore } from '@/stores/playerStore.js'
import LifeBar from '@/components/LifeBar.vue'

const route = useRoute()
const playerStore = usePlayerStore()

const player = ref(null)
const playerName = route.params.playerName

onMounted(() => {
  player.value = playerStore.getPlayer(playerName)
})

function handleUpdateHp(newHp) {
  if (!player.value) return
  
  player.value.currentHp = newHp
  
  if (newHp === 0) {
    player.value.state = 'dead'
  } else if (player.value.state === 'dead' && newHp > 0) {
    player.value.state = 'alive'
  }
  
  playerStore.updateTestPlayer(player.value)
}
</script>

<template>
  <div class="min-h-screen bg-base-200 p-6">
    <div v-if="player" class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-bold mb-6 text-center">Fiche de Personnage</h1>

      <div class="card bg-base-100 shadow-xl mb-6">
        <div class="card-body">
          <h2 class="card-title text-2xl">{{ player.name }}</h2>
          <div class="badge" :class="player.state === 'alive' ? 'badge-success' : 'badge-error'">
            {{ player.state === 'alive' ? 'Vivant' : 'Mort' }}
          </div>

          <div class="divider" />
          <LifeBar 
            :current-hp="player.currentHp" 
            :max-hp="player.maxHp" 
            @update-hp="handleUpdateHp"
          />
          <div class="divider" />

          <div>
            <h3 class="font-bold text-lg mb-2">Description</h3>
            <div class="card bg-base-200">
              <div class="card-body p-4">
                <p class="text-base-content/80">{{ player.description }}</p>
              </div>
            </div>
          </div>

          <div class="divider" />

          <div>
            <h3 class="font-bold text-lg mb-2">Localisation</h3>
            <div class="card bg-base-200">
              <div class="card-body p-4">
                <h4 class="font-semibold">{{ player.place.name }}</h4>
                <p class="text-sm text-base-content/70">{{ player.place.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h3 class="card-title">Inventaire - Objets</h3>
            <div
              v-if="player.inventory.items && player.inventory.items.length > 0"
              class="mt-4 space-y-3"
            >
              <div v-for="item in player.inventory.items" :key="item.name" class="card bg-base-200">
                <div class="card-body p-4">
                  <h4 class="font-semibold">{{ item.name }}</h4>
                  <p class="text-sm text-base-content/70">{{ item.description }}</p>
                </div>
              </div>
            </div>
            <p v-else class="text-base-content/50 mt-4">Aucun objet</p>
          </div>
        </div>

        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h3 class="card-title">Inventaire - Indices</h3>
            <div
              v-if="player.inventory.clues && player.inventory.clues.length > 0"
              class="mt-4 space-y-3"
            >
              <div v-for="clue in player.inventory.clues" :key="clue.name" class="card bg-base-200">
                <div class="card-body p-4">
                  <h4 class="font-semibold">{{ clue.name }}</h4>
                  <p class="text-sm text-base-content/70">{{ clue.description }}</p>
                </div>
              </div>
            </div>
            <p v-else class="text-base-content/50 mt-4">Aucun indice</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="max-w-4xl mx-auto">
      <div class="alert alert-error">
        <p class="font-bold">Personnage non trouvé</p>
      </div>
    </div>
  </div>
</template>
