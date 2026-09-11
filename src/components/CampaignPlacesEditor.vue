<script setup>
import { computed, reactive, ref } from 'vue'
import { useCampaignsStore } from '@/stores/rpgStore'

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
      <h3 class="font-bold">Lieux</h3>
      <button class="btn btn-sm btn-outline" @click="openCreateForm">Ajouter un lieu</button>
    </div>

    <p v-if="campaign.places.length === 0" class="text-sm text-base-content/60 italic">
      Aucun lieu dans cette campagne.
    </p>

    <ul v-else class="list bg-base-200 rounded-box">
      <li v-for="place in campaign.places" :key="place.id" class="list-row items-center">
        <div class="list-col-grow">
          <p class="font-bold">{{ place.name }}</p>
          <p v-if="place.description" class="text-sm text-base-content/70">
            {{ place.description }}
          </p>
        </div>
        <button class="btn btn-sm btn-ghost" @click="openEditForm(place)">Modifier</button>
        <button class="btn btn-sm btn-ghost text-error" @click="deletedId = place.id">
          Supprimer
        </button>
      </li>
    </ul>

    <Teleport to="body">
      <div class="modal" :class="{ 'modal-open': isFormOpen }" role="dialog">
        <div class="modal-box">
          <h3 class="text-lg font-bold mb-4">
            {{ isEditing ? 'Modifier le lieu' : 'Nouveau lieu' }}
          </h3>

          <form @submit.prevent="submitForm">
            <label class="form-control w-full mb-3">
              <span class="label-text">Nom</span>
              <input v-model="form.name" type="text" class="input input-bordered w-full" />
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

      <div class="modal" :class="{ 'modal-open': deletedPlace }" role="dialog">
        <div class="modal-box">
          <h3 class="text-lg font-bold mb-4">Supprimer le lieu</h3>
          <p>Voulez-vous vraiment supprimer « {{ deletedPlace?.name }} » ?</p>
          <p v-if="deletedPlaceOccupants.length" class="mt-2 text-sm text-base-content/70">
            {{ deletedPlaceOccupants.length }} joueur(s) s'y trouvent et n'auront plus de lieu.
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
