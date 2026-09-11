<script setup>
import { computed, reactive, ref } from 'vue'
import { useCampaignsStore } from '@/stores/campaigns'
import { CAMPAIGN_STATES } from '@/data/entities'

const STATE_LABELS = {
  draft: 'Brouillon',
  available: 'Disponible',
  active: 'Active',
}

const STATE_BADGES = {
  draft: 'badge-ghost',
  available: 'badge-info',
  active: 'badge-success',
}

const props = defineProps({
  editable: {
    type: Boolean,
    default: false,
  },
})

const campaignsStore = useCampaignsStore()

const campaigns = computed(() => campaignsStore.campaigns)

const editedId = ref(null)
const deletedId = ref(null)
const formError = ref('')

const form = reactive({
  name: '',
  state: 'draft',
  description: '',
  comment: '',
})

const isFormOpen = ref(false)
const isEditing = computed(() => editedId.value !== null)
const deletedCampaign = computed(() => campaignsStore.campaignById(deletedId.value))

function openCreateForm() {
  if (!props.editable) return

  editedId.value = null
  formError.value = ''
  Object.assign(form, { name: '', state: 'draft', description: '', comment: '' })
  isFormOpen.value = true
}

function openEditForm(campaign) {
  if (!props.editable) return

  editedId.value = campaign.id
  formError.value = ''
  Object.assign(form, {
    name: campaign.name,
    state: campaign.state,
    description: campaign.description,
    comment: campaign.comment,
  })
  isFormOpen.value = true
}

function closeForm() {
  isFormOpen.value = false
  editedId.value = null
  formError.value = ''
}

function submitForm() {
  if (!props.editable) return

  const name = form.name.trim()
  if (!name) {
    formError.value = 'Le nom de la campagne est obligatoire.'
    return
  }

  const data = {
    name,
    state: form.state,
    description: form.description.trim(),
    comment: form.comment.trim(),
  }

  const campaign = isEditing.value
    ? campaignsStore.updateCampaign(editedId.value, data)
    : campaignsStore.createCampaign(data)

  if (campaign && form.state === 'active') campaignsStore.setActiveCampaign(campaign.id)

  closeForm()
}

function askDelete(campaign) {
  if (!props.editable) return

  deletedId.value = campaign.id
}

function cancelDelete() {
  deletedId.value = null
}

function confirmDelete() {
  if (!props.editable) return

  campaignsStore.deleteCampaign(deletedId.value)
  if (editedId.value === deletedId.value) closeForm()
  deletedId.value = null
}
</script>

<template>
  <div class="m-2">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-extrabold">Campagnes</h1>
      <button v-if="editable" class="btn btn-primary" @click="openCreateForm">
        Nouvelle campagne
      </button>
    </div>

    <p v-if="campaigns.length === 0" class="text-base-content/60 italic">
      {{
        editable
          ? 'Aucune campagne pour le moment. Créez-en une pour commencer.'
          : 'Aucune campagne disponible pour le moment.'
      }}
    </p>

    <div
      v-for="campaign in campaigns"
      :key="campaign.id"
      class="collapse collapse-arrow bg-base-100 border border-base-300 mb-2 hover:bg-base-200 hover:border-base-content/20 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      <input type="checkbox" :id="'my-campaign-' + campaign.id" />
      <h2 class="collapse-title font-extrabold flex items-center gap-2">
        <span>{{ campaign.name }}</span>
        <span class="badge" :class="STATE_BADGES[campaign.state]">
          {{ STATE_LABELS[campaign.state] }}
        </span>
      </h2>
      <div class="collapse-content font-bold">
        <p v-if="campaign.description" class="mb-2">{{ campaign.description }}</p>
        <p v-else class="mb-2 text-base-content/60 italic">Pas de description.</p>

        <p v-if="editable && campaign.comment" class="mb-2 text-base-content/70">
          {{ campaign.comment }}
        </p>

        <div class="flex flex-wrap gap-2 mb-4 text-sm font-normal">
          <span class="badge badge-outline">{{ campaign.chapters.length }} chapitre(s)</span>
          <span class="badge badge-outline">{{ campaign.players.length }} joueur(s)</span>
          <span class="badge badge-outline">{{ campaign.places.length }} lieu(x)</span>
          <span class="badge badge-outline">{{ campaign.items.length }} objet(s)</span>
          <span class="badge badge-outline">{{ campaign.clues.length }} indice(s)</span>
        </div>

        <div v-if="editable" class="flex justify-end gap-2">
          <button class="btn btn-error btn-outline" @click="askDelete(campaign)">Supprimer</button>
          <button class="btn btn-primary" @click="openEditForm(campaign)">Modifier</button>
        </div>
      </div>
    </div>

    <div v-if="editable" class="modal" :class="{ 'modal-open': isFormOpen }" role="dialog">
      <div class="modal-box">
        <h3 class="text-lg font-bold mb-4">
          {{ isEditing ? 'Modifier la campagne' : 'Nouvelle campagne' }}
        </h3>

        <form @submit.prevent="submitForm">
          <label class="form-control w-full mb-3">
            <span class="label-text">Nom</span>
            <input v-model="form.name" type="text" class="input input-bordered w-full" />
          </label>

          <label class="form-control w-full mb-3">
            <span class="label-text">État</span>
            <select v-model="form.state" class="select select-bordered w-full">
              <option v-for="state in CAMPAIGN_STATES" :key="state" :value="state">
                {{ STATE_LABELS[state] }}
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
            <span class="label-text">Commentaire</span>
            <textarea v-model="form.comment" class="textarea textarea-bordered w-full"></textarea>
          </label>

          <p v-if="formError" class="text-error mb-2">{{ formError }}</p>

          <div class="modal-action">
            <button type="button" class="btn" @click="closeForm">Annuler</button>
            <button type="submit" class="btn btn-primary">
              {{ isEditing ? 'Enregistrer' : 'Créer' }}
            </button>
          </div>
        </form>
      </div>
      <div class="modal-backdrop" @click="closeForm"></div>
    </div>

    <div v-if="editable" class="modal" :class="{ 'modal-open': deletedCampaign }" role="dialog">
      <div class="modal-box">
        <h3 class="text-lg font-bold mb-4">Supprimer la campagne</h3>
        <p>
          Voulez-vous vraiment supprimer « {{ deletedCampaign?.name }} » ? Cette action est
          irréversible.
        </p>
        <div class="modal-action">
          <button type="button" class="btn" @click="cancelDelete">Annuler</button>
          <button type="button" class="btn btn-error" @click="confirmDelete">Supprimer</button>
        </div>
      </div>
      <div class="modal-backdrop" @click="cancelDelete"></div>
    </div>
  </div>
</template>
