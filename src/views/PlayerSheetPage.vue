<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePlayerStore } from '@/stores/playerStore.js'
import LifeBar from '@/components/LifeBar.vue'

const route = useRoute()
const playerStore = usePlayerStore()

const player = ref()
const playerName = route.params.playerName
const searchQuery = ref('')

onMounted(() => {
  player.value = playerStore.getPlayer(playerName)
})

const filteredItems = computed(() => {
  if (!player.value?.inventory?.items) return []
  if (!searchQuery.value) return player.value.inventory.items

  const query = (searchQuery.value || '').toLowerCase()
  return player.value.inventory.items.filter(
    /** @param {{ name: string, description: string }} item */
    (item) =>
      item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query),
  )
})

const filteredClues = computed(() => {
  if (!player.value?.inventory?.clues) return []
  if (!searchQuery.value) return player.value.inventory.clues

  const query = (searchQuery.value || '').toLowerCase()
  return player.value.inventory.clues.filter(
    /** @param {{ name: string, description: string }} clue */
    (clue) =>
      clue.name.toLowerCase().includes(query) || clue.description.toLowerCase().includes(query),
  )
})

/**
 * @param {number} newHp
 */
function handleUpdateHp(newHp) {
  if (!player.value) return

  player.value.currentHp = newHp

  if (newHp === 0) {
    player.value.state = 'dead'
  } else if (player.value.state === 'dead' && newHp > 0) {
    player.value.state = 'alive'
  }

  playerStore.updatePlayer(player.value)
}
</script>

<template>
  <div class="min-h-screen bg-base-200 p-6">
    <div v-if="player" class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-bold mb-6 text-center">Fiche de Personnage</h1>

      <div class="card bg-base-100 shadow-xl mb-6">
        <div class="card-body">
          <h2 class="card-title text-2xl">{{ player.name }}</h2>
          <div
            class="badge mb-4"
            :class="player.state === 'alive' ? 'badge-success' : 'badge-error'"
          >
            {{ player.state === 'alive' ? 'Vivant' : 'Mort' }}
          </div>

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

      <div class="mb-6">
        <label for="search-input" class="label" />
        <input
          id="search-input"
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher dans l'inventaire..."
          class="input input-bordered w-full"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h3 class="card-title">Inventaire - Objets</h3>
            <div v-if="filteredItems.length > 0" class="mt-4 space-y-3">
              <div v-for="item in filteredItems" :key="item.name" class="card bg-base-200">
                <div class="card-body p-4">
                  <h4 class="font-semibold">{{ item.name }}</h4>
                  <p class="text-sm text-base-content/70">{{ item.description }}</p>
                </div>
              </div>
            </div>
            <p v-else class="text-base-content/50 mt-4">
              {{ searchQuery ? 'Aucun objet correspondant' : 'Aucun objet' }}
            </p>
          </div>
        </div>

        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h3 class="card-title">Inventaire - Indices</h3>
            <div v-if="filteredClues.length > 0" class="mt-4 space-y-3">
              <div v-for="clue in filteredClues" :key="clue.name" class="card bg-base-200">
                <div class="card-body p-4">
                  <h4 class="font-semibold">{{ clue.name }}</h4>
                  <p class="text-sm text-base-content/70">{{ clue.description }}</p>
                </div>
              </div>
            </div>
            <p v-else class="text-base-content/50 mt-4">
              {{ searchQuery ? 'Aucun indice correspondant' : 'Aucun indice' }}
            </p>
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
