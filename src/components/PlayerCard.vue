<script setup>
import { getCampaignName } from '../data/mockPlayers.js'
import { User } from '@lucide/vue'
import LifeBar from './LifeBar.vue'

defineProps({
  player: {
    type: Object,
    required: true,
  },
  editable: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select', 'updateHp'])
</script>

<template>
  <div
    class="w-72 bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl p-5 shadow-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:border-amber-400/70 hover:shadow-2xl"
    @click="emit('select', player)"
  >
    <div class="flex items-center gap-3 mb-3">
      <User class="w-8 h-8 text-amber-500" />
      <h2 class="text-xl font-bold text-amber-500 font-['Cinzel']">{{ player.name }}</h2>
    </div>
    <p class="text-white/80 text-sm mb-1">Campagne : {{ getCampaignName(player.campaignId) }}</p>
    <div @click.stop>
      <LifeBar
        :current-hp="player.currentHp"
        :max-hp="player.maxHp"
        @update-hp="emit('updateHp', { player, newHp: $event })"
      />
    </div>
  </div>
</template>
