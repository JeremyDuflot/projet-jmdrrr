<script setup>
import { computed, reactive, ref } from 'vue'
import { useCampaignsStore } from '@/stores/rpgStore'
import { PLAYER_STATES } from '@/data/entities'
import BaseModal from './BaseModal.vue'
import LifeBar from './LifeBar.vue'
import IdListPicker from './IdListPicker.vue'

const STATE_LABELS = {
  alive: 'Vivant',
  dead: 'Mort',
}

const DEFAULT_MAX_HP = 10

const props = defineProps({
  campaign: {
    type: Object,
    required: true,
  },
})

const campaignsStore = useCampaignsStore()

const editedId = ref(null)
const deletedId = ref(null)
const isFormOpen = ref(false)
const formError = ref('')

const form = reactive({
  name: '',
  state: 'alive',
  maxHp: DEFAULT_MAX_HP,
  currentHp: DEFAULT_MAX_HP,
  placeId: null,
  description: '',
  comment: '',
  itemIds: [],
})

const isEditing = computed(() => editedId.value !== null)
const deletedPlayer = computed(() => campaignsStore.playerById(deletedId.value))

function placeName(placeId) {
  return props.campaign.places.find((place) => place.id === placeId)?.name ?? null
}

function openCreateForm() {
  editedId.value = null
  formError.value = ''
  Object.assign(form, {
    name: '',
    state: 'alive',
    maxHp: DEFAULT_MAX_HP,
    placeId: null,
    description: '',
    comment: '',
    itemIds: [],
  })
  isFormOpen.value = true
}

function openEditForm(player) {
  editedId.value = player.id
  formError.value = ''
  Object.assign(form, {
    name: player.name,
    state: player.state,
    maxHp: player.maxHp,
    currentHp: player.currentHp,
    placeId: player.placeId,
    description: player.description,
    comment: player.comment,
    itemIds: [...player.inventory.itemIds],
  })
  isFormOpen.value = true
}

function closeForm() {
  isFormOpen.value = false
  editedId.value = null
  formError.value = ''
}

function validate(name) {
  if (!name) return 'Le nom du joueur est obligatoire.'
  if (!Number.isInteger(form.maxHp) || form.maxHp < 1) {
    return 'Les PV max doivent être un entier supérieur à 0.'
  }
  if (
    isEditing.value &&
    (!Number.isInteger(form.currentHp) || form.currentHp < 0 || form.currentHp > form.maxHp)
  ) {
    return `Les PV actuels doivent être compris entre 0 et ${form.maxHp}.`
  }

  return ''
}

function submitForm() {
  const name = form.name.trim()
  formError.value = validate(name)
  if (formError.value) return

  const data = {
    name,
    state: form.state,
    maxHp: form.maxHp,
    currentHp: isEditing.value ? form.currentHp : form.maxHp,
    placeId: form.placeId,
    description: form.description.trim(),
    comment: form.comment.trim(),
  }

  if (isEditing.value) {
    campaignsStore.updatePlayer(editedId.value, data)
    campaignsStore.setPlayerInventory(editedId.value, form.itemIds)
  } else {
    const player = campaignsStore.createPlayer(
      { ...data, inventory: { itemIds: [...form.itemIds] } },
      props.campaign.id,
    )
    if (!player) return
  }

  closeForm()
}

function confirmDelete() {
  campaignsStore.deletePlayer(deletedId.value)
  deletedId.value = null
}
</script>

<template>
  <section class="font-normal">
    <div class="flex items-center justify-between mb-2">
      <h3 class="font-bold text-amber-500 font-['Cinzel']">Joueurs</h3>
      <button
        class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl px-3 py-1 text-amber-500 hover:border-amber-400/70 transition-all text-sm"
        @click="openCreateForm"
      >
        Ajouter un joueur
      </button>
    </div>

    <p v-if="campaign.players.length === 0" class="text-sm text-amber-500/60 italic">
      Aucun joueur dans cette campagne.
    </p>

    <ul v-else class="flex flex-col gap-2">
      <li
        v-for="player in campaign.players"
        :key="player.id"
        class="bg-black/30 backdrop-blur-sm border border-amber-500/20 rounded-xl p-3 flex items-center justify-between"
      >
        <div class="flex-1">
          <p class="font-bold flex items-center gap-2 text-amber-500">
            <span>{{ player.name }}</span>
            <span
              v-if="player.state === 'dead'"
              class="badge bg-red-500/20 border border-red-500/40 text-red-400"
            >
              {{ STATE_LABELS.dead }}
            </span>
            <span
              v-if="player.inventory.itemIds.length"
              class="badge badge-sm badge-outline font-normal"
            >
              {{ player.inventory.itemIds.length }} objet(s)
            </span>
          </p>
          <p class="text-sm text-amber-500/70">
            {{ placeName(player.placeId) ?? 'Aucun lieu' }}
          </p>
          <LifeBar
            class="mt-1 max-w-xs"
            :current-hp="player.currentHp"
            :max-hp="player.maxHp"
            :show-label="false"
            editable
            @update-hp="campaignsStore.updatePlayer(player.id, { currentHp: $event })"
          />
        </div>
        <button
          class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl px-3 py-1 text-amber-500 hover:border-amber-400/70 transition-all text-sm"
          @click="openEditForm(player)"
        >
          Modifier
        </button>
        <button
          class="bg-black/50 backdrop-blur-sm border-2 border-red-500/40 rounded-xl px-3 py-1 text-red-500 hover:border-red-400/70 transition-all text-sm"
          @click="deletedId = player.id"
        >
          Supprimer
        </button>
      </li>
    </ul>

    <BaseModal
      :open="isFormOpen"
      :title="isEditing ? 'Modifier le joueur' : 'Nouveau joueur'"
      @close="closeForm"
    >
      <form @submit.prevent="submitForm">
        <label class="form-control w-full mb-3">
          <span class="label-text text-amber-500 font-['Cinzel']">Nom</span>
          <input
            v-model="form.name"
            type="text"
            class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl px-4 py-2 text-amber-500 focus:border-amber-400/70 w-full"
          />
        </label>

        <label class="form-control w-full mb-3">
          <span class="label-text text-amber-500 font-['Cinzel']">État</span>
          <select
            v-model="form.state"
            class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl px-4 py-2 text-amber-500 focus:border-amber-400/70 w-full"
          >
            <option v-for="state in PLAYER_STATES" :key="state" :value="state">
              {{ STATE_LABELS[state] }}
            </option>
          </select>
        </label>

        <div class="flex gap-3 mb-3">
          <label v-if="isEditing" class="form-control flex-1">
            <span class="label-text text-amber-500 font-['Cinzel']">PV actuels</span>
            <input
              v-model.number="form.currentHp"
              type="number"
              min="0"
              :max="form.maxHp"
              class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl px-4 py-2 text-amber-500 focus:border-amber-400/70 w-full"
            />
          </label>
          <label class="form-control flex-1">
            <span class="label-text text-amber-500 font-['Cinzel']">PV max</span>
            <input
              v-model.number="form.maxHp"
              type="number"
              min="1"
              class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl px-4 py-2 text-amber-500 focus:border-amber-400/70 w-full"
            />
          </label>
        </div>

        <label class="form-control w-full mb-3">
          <span class="label-text text-amber-500 font-['Cinzel']">Lieu</span>
          <select
            v-model="form.placeId"
            class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl px-4 py-2 text-amber-500 focus:border-amber-400/70 w-full"
          >
            <option :value="null">Aucun lieu</option>
            <option v-for="place in campaign.places" :key="place.id" :value="place.id">
              {{ place.name }}
            </option>
          </select>
        </label>

        <IdListPicker
          v-model="form.itemIds"
          :entities="campaign.items"
          label="Inventaire"
          empty-text="Aucun objet dans cette campagne. Créez-en depuis l'éditeur Objets."
        />

        <label class="form-control w-full mb-3">
          <span class="label-text text-amber-500 font-['Cinzel']">Description</span>
          <textarea
            v-model="form.description"
            class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl px-4 py-2 text-amber-500 focus:border-amber-400/70 w-full"
          ></textarea>
        </label>

        <label class="form-control w-full mb-3">
          <span class="label-text text-amber-500 font-['Cinzel']"
            >Commentaire (visible par le MJ uniquement)</span
          >
          <textarea
            v-model="form.comment"
            class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl px-4 py-2 text-amber-500 focus:border-amber-400/70 w-full"
          ></textarea>
        </label>

        <p v-if="formError" class="text-red-400 mb-2">{{ formError }}</p>

        <div class="modal-action">
          <button
            type="button"
            class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl px-4 py-2 text-amber-500 hover:border-amber-400/70 transition-all"
            @click="closeForm"
          >
            Annuler
          </button>
          <button
            type="submit"
            class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl px-4 py-2 text-amber-500 hover:border-amber-400/70 transition-all"
          >
            {{ isEditing ? 'Enregistrer' : 'Ajouter' }}
          </button>
        </div>
      </form>
    </BaseModal>

    <BaseModal :open="deletedPlayer !== null" title="Supprimer le joueur" @close="deletedId = null">
      <p class="text-amber-500/80">
        Voulez-vous vraiment retirer « {{ deletedPlayer?.name }} » de la campagne ? Cette action est
        irréversible.
      </p>
      <div class="modal-action">
        <button
          type="button"
          class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl px-4 py-2 text-amber-500 hover:border-amber-400/70 transition-all"
          @click="deletedId = null"
        >
          Annuler
        </button>
        <button
          type="button"
          class="bg-black/50 backdrop-blur-sm border-2 border-red-500/40 rounded-xl px-4 py-2 text-red-500 hover:border-red-400/70 transition-all"
          @click="confirmDelete"
        >
          Supprimer
        </button>
      </div>
    </BaseModal>
  </section>
</template>
