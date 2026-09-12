<script setup>
import { ref, computed } from 'vue'
import { MapPin, Search } from '@lucide/vue'
import { useCampaignsStore } from '@/stores/rpgStore.js'
import { getPlacesForPlayer } from '@/data/playerHelpers.js'

const props = defineProps({
  playerId: { type: String, required: true },
})

const campaignsStore = useCampaignsStore()

const searchQuery = ref('')

const player = computed(() => campaignsStore.playerById(props.playerId))
const places = computed(() => getPlacesForPlayer(props.playerId))

const filteredPlaces = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return places.value
  return places.value.filter((place) => place.name.toLowerCase().includes(query))
})

function moveTo(placeId) {
  campaignsStore.updatePlayer(props.playerId, { placeId })
}
</script>

<template>
  <div class="w-full">
    <label for="place-search" class="label text-amber-500 font-['Cinzel']">
      <MapPin :size="16" class="inline mr-1 text-amber-500" />
      Se déplacer
    </label>
    <div class="relative mb-3">
      <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500/40" />
      <input
        id="place-search"
        v-model="searchQuery"
        type="text"
        placeholder="Rechercher un lieu..."
        class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl px-4 py-2 text-amber-500 focus:border-amber-400/70 w-full pl-9"
      />
    </div>

    <div class="flex flex-col gap-2 max-h-64 overflow-y-auto">
      <div v-for="place in filteredPlaces" :key="place.id" class="bg-black/30 backdrop-blur-sm border border-amber-500/20 rounded-xl p-3 flex-row items-center justify-between">
        <div>
          <p class="font-semibold text-amber-500">{{ place.name }}</p>
          <p class="text-sm text-amber-500/70">{{ place.description }}</p>
        </div>
        <button
          type="button"
          class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl px-3 py-1 text-amber-500 hover:border-amber-400/70 transition-all text-sm"
          :class="player?.placeId === place.id ? 'opacity-50 cursor-not-allowed' : ''"
          :disabled="player?.placeId === place.id"
          @click="moveTo(place.id)"
        >
          {{ player?.placeId === place.id ? 'Ici' : 'Aller' }}
        </button>
      </div>

      <p v-if="filteredPlaces.length === 0" class="text-amber-500/50 text-sm text-center py-4">
        Aucun lieu trouvé.
      </p>
    </div>
  </div>
</template>
