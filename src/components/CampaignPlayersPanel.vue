<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronDown, ChevronUp } from '@lucide/vue'
import { useCampaignsStore } from '@/stores/rpgStore.js'
import LifeBar from './LifeBar.vue'

const props = defineProps({
  campaignId: {
    type: String,
    required: true,
  },
  editable: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['select', 'updateHp'])

const router = useRouter()
const campaignsStore = useCampaignsStore()

const players = computed(() => campaignsStore.campaignById(props.campaignId)?.players ?? [])

const expanded = ref(false)
const collapsedCount = 3

const visiblePlayers = computed(() =>
  expanded.value ? players.value : players.value.slice(0, collapsedCount),
)

const hasMore = computed(() => players.value.length > collapsedCount)

/**
 * @param {Player} player
 */
function goToPlayerSheet(player) {
  emit('select', player)
  router.push({ name: 'player-sheet', params: { playerId: player.id } })
}

/**
 * @param {{ player: Player, newHp: number }} payload
 */
function handleUpdateHp({ player, newHp }) {
  campaignsStore.updatePlayer(player.id, { currentHp: newHp })
  emit('updateHp', { player, newHp })
}
</script>

<template>
  <div
    class="fixed bottom-4 right-4 w-72 bg-black/80 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl shadow-2xl p-3 z-50 flex flex-col gap-3"
  >
    <div class="flex flex-col gap-3" :class="expanded ? 'max-h-[70vh] overflow-y-auto' : ''">
      <div
        v-for="player in visiblePlayers"
        :key="player.id"
        class="pb-2 border-b border-amber-500/20 last:border-0"
      >
        <button
          type="button"
          @click="goToPlayerSheet(player)"
          class="font-bold text-amber-500 text-sm mb-1 hover:text-amber-300 hover:underline transition-colors text-left"
        >
          {{ player.name }}
        </button>
        <LifeBar
          :current-hp="player.currentHp"
          :max-hp="player.maxHp"
          :editable="editable"
          :show-label="false"
          @update-hp="handleUpdateHp({ player, newHp: $event })"
        />
      </div>
    </div>

    <button
      v-if="hasMore"
      type="button"
      @click="expanded = !expanded"
      class="btn btn-xs btn-ghost text-amber-500 flex items-center gap-1 self-center"
    >
      <template v-if="expanded">
        Réduire
        <ChevronUp :size="14" />
      </template>
      <template v-else>
        Voir tous ({{ players.length }})
        <ChevronDown :size="14" />
      </template>
    </button>
  </div>
</template>
