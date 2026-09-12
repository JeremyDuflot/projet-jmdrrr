<script setup>
import { computed, reactive, ref } from 'vue'
import { useCampaignsStore } from '@/stores/rpgStore'
import BaseModal from './BaseModal.vue'

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
  description: '',
  comment: '',
})

const isEditing = computed(() => editedId.value !== null)
const deletedPlace = computed(() => campaignsStore.placeById(deletedId.value))
const deletedPlaceOccupants = computed(() =>
  props.campaign.players.filter((player) => player.placeId === deletedId.value),
)

function openCreateForm() {
  editedId.value = null
  formError.value = ''
  Object.assign(form, { name: '', description: '', comment: '' })
  isFormOpen.value = true
}

function openEditForm(place) {
  editedId.value = place.id
  formError.value = ''
  Object.assign(form, {
    name: place.name,
    description: place.description,
    comment: place.comment,
  })
  isFormOpen.value = true
}

function closeForm() {
  isFormOpen.value = false
  editedId.value = null
  formError.value = ''
}

function submitForm() {
  const name = form.name.trim()
  if (!name) {
    formError.value = 'Le nom du lieu est obligatoire.'
    return
  }

  const data = {
    name,
    description: form.description.trim(),
    comment: form.comment.trim(),
  }

  if (isEditing.value) campaignsStore.updatePlace(editedId.value, data)
  else campaignsStore.createPlace(data, props.campaign.id)

  closeForm()
}

function confirmDelete() {
  campaignsStore.deletePlace(deletedId.value)
  deletedId.value = null
}
</script>

<template>
  <section class="font-normal">
    <div class="flex items-center justify-between mb-2">
      <h3 class="font-bold text-amber-500 font-['Cinzel']">Lieux</h3>
      <button
        class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl px-3 py-1 text-amber-500 hover:border-amber-400/70 transition-all text-sm"
        @click="openCreateForm"
      >
        Ajouter un lieu
      </button>
    </div>

    <p v-if="campaign.places.length === 0" class="text-sm text-amber-500/60 italic">
      Aucun lieu dans cette campagne.
    </p>

    <ul v-else class="flex flex-col gap-2">
      <li
        v-for="place in campaign.places"
        :key="place.id"
        class="bg-black/30 backdrop-blur-sm border border-amber-500/20 rounded-xl p-3 flex items-center justify-between"
      >
        <div class="flex-1">
          <p class="font-bold text-amber-500">{{ place.name }}</p>
          <p v-if="place.description" class="text-sm text-amber-500/70">
            {{ place.description }}
          </p>
        </div>
        <button
          class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl px-3 py-1 text-amber-500 hover:border-amber-400/70 transition-all text-sm"
          @click="openEditForm(place)"
        >
          Modifier
        </button>
        <button
          class="bg-black/50 backdrop-blur-sm border-2 border-red-500/40 rounded-xl px-3 py-1 text-red-500 hover:border-red-400/70 transition-all text-sm"
          @click="deletedId = place.id"
        >
          Supprimer
        </button>
      </li>
    </ul>

    <BaseModal
      :open="isFormOpen"
      :title="isEditing ? 'Modifier le lieu' : 'Nouveau lieu'"
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

    <BaseModal :open="deletedPlace !== null" title="Supprimer le lieu" @close="deletedId = null">
      <p class="text-amber-500/80">Voulez-vous vraiment supprimer « {{ deletedPlace?.name }} » ?</p>
      <p v-if="deletedPlaceOccupants.length" class="mt-2 text-sm text-amber-500/70">
        {{ deletedPlaceOccupants.length }} joueur(s) s'y trouvent et n'auront plus de lieu.
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
