<script setup>
import { computed, reactive, ref } from 'vue'
import { useCampaignsStore } from '@/stores/rpgStore'
import { PLAYER_STATES } from '@/data/entities'
import LifeBar from './LifeBar.vue'

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

  if (isEditing.value) campaignsStore.updatePlayer(editedId.value, data)
  else campaignsStore.createPlayer(data, props.campaign.id)

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
      <h3 class="font-bold">Joueurs</h3>
      <button class="btn btn-sm btn-outline" @click="openCreateForm">Ajouter un joueur</button>
    </div>

    <p v-if="campaign.players.length === 0" class="text-sm text-base-content/60 italic">
      Aucun joueur dans cette campagne.
    </p>

    <ul v-else class="list bg-base-200 rounded-box">
      <li v-for="player in campaign.players" :key="player.id" class="list-row items-center">
        <div class="list-col-grow">
          <p class="font-bold flex items-center gap-2">
            <span>{{ player.name }}</span>
            <span v-if="player.state === 'dead'" class="badge badge-sm badge-error">
              {{ STATE_LABELS.dead }}
            </span>
          </p>
          <p class="text-sm text-base-content/70">
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
        <button class="btn btn-sm btn-ghost" @click="openEditForm(player)">Modifier</button>
        <button class="btn btn-sm btn-ghost text-error" @click="deletedId = player.id">
          Supprimer
        </button>
      </li>
    </ul>

    <Teleport to="body">
      <div class="modal" :class="{ 'modal-open': isFormOpen }" role="dialog">
        <div class="modal-box">
          <h3 class="text-lg font-bold mb-4">
            {{ isEditing ? 'Modifier le joueur' : 'Nouveau joueur' }}
          </h3>

          <form @submit.prevent="submitForm">
            <label class="form-control w-full mb-3">
              <span class="label-text">Nom</span>
              <input v-model="form.name" type="text" class="input input-bordered w-full" />
            </label>

            <label class="form-control w-full mb-3">
              <span class="label-text">État</span>
              <select v-model="form.state" class="select select-bordered w-full">
                <option v-for="state in PLAYER_STATES" :key="state" :value="state">
                  {{ STATE_LABELS[state] }}
                </option>
              </select>
            </label>

            <div class="flex gap-3 mb-3">
              <label v-if="isEditing" class="form-control flex-1">
                <span class="label-text">PV actuels</span>
                <input
                  v-model.number="form.currentHp"
                  type="number"
                  min="0"
                  :max="form.maxHp"
                  class="input input-bordered w-full"
                />
              </label>
              <label class="form-control flex-1">
                <span class="label-text">PV max</span>
                <input
                  v-model.number="form.maxHp"
                  type="number"
                  min="1"
                  class="input input-bordered w-full"
                />
              </label>
            </div>

            <label class="form-control w-full mb-3">
              <span class="label-text">Lieu</span>
              <select v-model="form.placeId" class="select select-bordered w-full">
                <option :value="null">Aucun lieu</option>
                <option v-for="place in campaign.places" :key="place.id" :value="place.id">
                  {{ place.name }}
                </option>
              </select>
            </label>

            <label class="form-control w-full mb-3">
              <span class="label-text">Description</span>
              <textarea
                v-model="form.description"
                class="textarea textarea-bordered w-full"
              ></textarea>
            </label>

            <label class="form-control w-full mb-3">
              <span class="label-text">Commentaire (visible par le MJ uniquement)</span>
              <textarea v-model="form.comment" class="textarea textarea-bordered w-full"></textarea>
            </label>

            <p v-if="formError" class="text-error mb-2">{{ formError }}</p>

            <div class="modal-action">
              <button type="button" class="btn" @click="closeForm">Annuler</button>
              <button type="submit" class="btn btn-primary">
                {{ isEditing ? 'Enregistrer' : 'Ajouter' }}
              </button>
            </div>
          </form>
        </div>
        <div class="modal-backdrop" @click="closeForm"></div>
      </div>

      <div class="modal" :class="{ 'modal-open': deletedPlayer }" role="dialog">
        <div class="modal-box">
          <h3 class="text-lg font-bold mb-4">Supprimer le joueur</h3>
          <p>
            Voulez-vous vraiment retirer « {{ deletedPlayer?.name }} » de la campagne ? Cette action
            est irréversible.
          </p>
          <div class="modal-action">
            <button type="button" class="btn" @click="deletedId = null">Annuler</button>
            <button type="button" class="btn btn-error" @click="confirmDelete">Supprimer</button>
          </div>
        </div>
        <div class="modal-backdrop" @click="deletedId = null"></div>
      </div>
    </Teleport>
  </section>
</template>
