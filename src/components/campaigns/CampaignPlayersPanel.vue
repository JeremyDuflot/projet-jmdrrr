<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronUp, User } from '@lucide/vue'
import LifeBar from '@/components/LifeBar.vue'
import { useCampaignsStore } from '@/stores/rpgStore.js'

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

function goToPlayerSheetPage(player) {
  emit('select', player)
  router.push({ name: 'player-sheet', params: { playerName: player.name } })
}

function handleUpdateHp({ player, newHp }) {
  let cappedHp = newHp
  if (cappedHp > player.maxHp) {
    cappedHp = player.maxHp
  }

  let state
  if (cappedHp === 0) {
    state = 'dead'
  } else if (player.state === 'dead' && cappedHp > 0) {
    state = 'alive'
  } else {
    state = player.state
  }

  campaignsStore.updatePlayer(player.id, { currentHp: cappedHp, state })
  emit('updateHp', { player, newHp: cappedHp })
}
</script>

<template>
  <div v-if="!expanded" class="fixed bottom-4 right-4 z-50 group">
    <button
      type="button"
      @click="expanded = true"
      class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl p-3 shadow-lg cursor-pointer transition-all duration-300 hover:border-amber-400/70 hover:shadow-2xl flex items-center gap-2"
    >
      <User class="w-5 h-5 text-amber-500" />
      <span class="text-amber-500 font-['Cinzel']">Joueurs</span>
    </button>

    <div
      class="pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-lg bg-black/90 border border-amber-500/40 px-3 py-1.5 text-xs text-amber-500 opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100"
    >
      Voir les PVs de tous les joueurs ({{ players.length }})
    </div>
  </div>

  <div
    v-else
    class="fixed bottom-4 right-4 w-72 bg-black/80 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl shadow-2xl p-3 z-50 flex flex-col gap-3"
  >
    <div class="flex flex-col gap-3 max-h-[70vh] overflow-y-auto">
      <div
        v-for="player in players"
        :key="player.id"
        class="pb-2 border-b border-amber-500/20 last:border-0"
      >
        <button
          type="button"
          @click="goToPlayerSheetPage(player)"
          class="font-bold text-amber-500 text-sm mb-1 cursor-pointer hover:text-amber-300 hover:underline transition-colors text-left"
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
      type="button"
      @click="expanded = false"
      class="btn btn-xs btn-ghost text-amber-500 bg-black/50 flex items-center gap-1 self-center"
    >
      Réduire
      <ChevronUp :size="14" />
    </button>
  </div>
</template>
