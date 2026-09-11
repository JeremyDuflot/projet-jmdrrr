<script setup>
import { ref, computed } from 'vue'
import { Lock, Check } from '@lucide/vue'
import { useCampaignsStore } from '@/stores/rpgStore.js'
import { Lock } from '@lucide/vue'

const props = defineProps({
  type: { type: String, required: true }, // 'quest' ou 'chapter'
  entityId: { type: String, required: true },
  playerId: { type: String, required: true },
})

const emit = defineEmits(['resolved'])

const campaignsStore = useCampaignsStore()

/** @type {import('vue').Ref<HTMLDialogElement | null>} */
const dialogRef = ref(null)
const password = ref('')
const errorMessage = ref('')
const isResolved = ref(false)

const entity = computed(() => {
  return props.type === 'quest'
    ? campaignsStore.questById(props.entityId)
    : campaignsStore.chapterById(props.entityId)
})

const player = computed(() => campaignsStore.playerById(props.playerId))

const label = computed(() => (props.type === 'quest' ? 'la quête' : 'le chapitre'))

function openPopup() {
  password.value = ''
  errorMessage.value = ''
  isResolved.value = false
  dialogRef.value?.showModal()
}

function closePopup() {
  dialogRef.value?.close()
}

function submitPassword() {
  if (!entity.value || !player.value) {
    errorMessage.value = 'Personnage ou contenu introuvable.'
    return
  }

  if (entity.value.state !== 'active') {
    errorMessage.value = `${props.type === 'quest' ? 'Cette quête' : 'Ce chapitre'} n'est pas actif.`
    return
  }

  if (props.type === 'quest' && player.value.placeId !== entity.value.placeId) {
    errorMessage.value = "Vous n'êtes pas au bon endroit pour résoudre cette quête."
    return
  }

  if (password.value !== entity.value.resolutionPassword) {
    errorMessage.value = 'Mot de passe incorrect.'
    return
  }

  const entityName = entity.value.name

  if (props.type === 'quest') {
    campaignsStore.updateQuest(props.entityId, { state: 'completed' })
  } else {
    campaignsStore.completeChapter(props.entityId)
  }

  emit('resolved', { type: props.type, name: entityName })
}
</script>

<template>
  <button
    type="button"
    @click="openPopup"
    class="btn btn-sm gap-2 bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 text-amber-500 hover:bg-amber-500/20 hover:border-amber-400/70"
  >
    <Lock :size="16" />
    Résoudre {{ label }}
  </button>

  <dialog ref="dialogRef" class="modal">
    <div class="modal-box bg-black/90 backdrop-blur-sm border-2 border-amber-500/40 text-gray-200">
      <h3 class="font-bold text-lg mb-4 text-amber-500 font-['Cinzel']">Résoudre {{ label }}</h3>

      <label for="resolution-password" class="label text-gray-400">Mot de passe</label>
      <input
        id="resolution-password"
        v-model="password"
        type="text"
        class="input input-bordered w-full bg-transparent border-amber-500/40 text-gray-200 focus:border-amber-400"
        autocomplete="off"
        @keydown.enter="submitPassword"
      />

      <p v-if="errorMessage" class="text-error text-sm mt-2">{{ errorMessage }}</p>

      <div class="modal-action">
        <button type="button" class="btn btn-ghost text-gray-300" @click="closePopup">
          Annuler
        </button>
        <button
          type="button"
          class="btn bg-amber-500/20 border-amber-500/40 text-amber-400 hover:bg-amber-500/30"
          @click="submitPassword"
        >
          Valider
        </button>
      </div>
    </div>
  </dialog>
</template>
