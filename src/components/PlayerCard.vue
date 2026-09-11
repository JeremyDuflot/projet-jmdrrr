<script setup>
import { getCampaignNameForPlayer } from '../data/playerHelpers.js'
import { User } from '@lucide/vue'
import LifeBar from './LifeBar.vue'

defineProps({
  player: { type: Object, required: true },
  editable: { type: Boolean, default: false },
  hoverScale: { type: Boolean, default: true },
})

const emit = defineEmits(['select', 'updateHp'])
</script>

<template>
  <button
    type="button"
    class="w-full text-left bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl p-5 shadow-lg cursor-pointer transition-all duration-300 hover:border-amber-400/70 hover:shadow-2xl"
    :class="{ 'hover:scale-105': hoverScale }"
    @click="emit('select', player)"
  >
    <div class="flex items-center gap-3 mb-3">
      <User class="w-8 h-8 text-amber-500" />
      <h2 class="text-xl font-bold text-amber-500 font-['Cinzel']">{{ player.name }}</h2>
    </div>
    <p class="text-white/80 text-sm mb-3">Campagne : {{ getCampaignNameForPlayer(player.id) }}</p>

    <div @click.stop @keydown.stop>
      <LifeBar
        :current-hp="player.currentHp"
        :max-hp="player.maxHp"
        :editable="editable"
        @update-hp="emit('updateHp', { player, newHp: $event })"
      />
    </div>
  </button>
</template>
