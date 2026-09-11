<script setup>
import { getPlayersByCampaign } from '../data/mockPlayers.js'
import PlayerCard from './PlayerCard.vue'
import { ref } from 'vue'

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

/**
 * @param {{ player: Player, newHp: number }} payload
 */
function handleUpdateHp({ player, newHp }) {
  player.currentHp = newHp
  emit('updateHp', { player, newHp })
}

/** @type {import('vue').Ref<HTMLDialogElement | null>} */
const dialogRef = ref(null)
const players = ref(getPlayersByCampaign(props.campaignId))
</script>

<template>
  <button class="btn btn-primary" @click="dialogRef?.showModal()">Voir les joueurs</button>
  <dialog ref="dialogRef" class="modal">
    <form method="dialog" class="modal-box w-[95%] overflow-x-hidden">
      <h3 class="font-bold text-lg mb-4">Liste des joueurs</h3>
      <div class="flex flex-col gap-4">
        <PlayerCard
          v-for="player in players"
          :key="player.id"
          :player="player"
          :editable="editable"
          class="w-full"
          @select="$emit('select', player)"
          @update-hp="handleUpdateHp"
        />
      </div>
      <div class="modal-action">
        <button class="btn btn-primary">Fermer</button>
      </div>
    </form>
  </dialog>
</template>
