<script setup>
import { computed, reactive, ref } from 'vue'
import { useCampaignsStore } from '@/stores/rpgStore'
import { CAMPAIGN_STATES } from '@/data/entities'
import BaseModal from './BaseModal.vue'
import CampaignPlacesEditor from './CampaignPlacesEditor.vue'
import CampaignPlayersEditor from './CampaignPlayersEditor.vue'
import {
  CAMPAIGN_FILE_EXTENSION,
  downloadCampaignFile,
  readCampaignFile,
} from '@/utils/campaignFile'

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

const fileInput = ref(null)
const importFeedback = ref(null)

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

function exportCampaign(campaign) {
  if (!props.editable) return

  downloadCampaignFile(campaign)
}

function openImportDialog() {
  if (!props.editable) return

  fileInput.value.click()
}

async function importFile(event) {
  const [file] = event.target.files
  // Réinitialisé pour pouvoir réimporter le même fichier.
  event.target.value = ''
  if (!file) return

  try {
    const campaign = campaignsStore.importCampaign(await readCampaignFile(file))
    importFeedback.value = { type: 'success', text: `Campagne « ${campaign.name} » importée.` }
  } catch (error) {
    importFeedback.value = {
      type: 'error',
      text: error.message || 'Impossible de lire ce fichier de campagne.',
    }
  }
}
</script>

<template>
  <div class="m-2">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-extrabold">Campagnes</h1>
      <div v-if="editable" class="flex gap-2">
        <button class="btn btn-outline" @click="openImportDialog">Importer</button>
        <button class="btn btn-primary" @click="openCreateForm">Nouvelle campagne</button>
        <label for="campaign-import-input" class="sr-only">Fichier de campagne à importer</label>
        <input
          id="campaign-import-input"
          ref="fileInput"
          type="file"
          :accept="`${CAMPAIGN_FILE_EXTENSION},application/json`"
          class="hidden"
          @change="importFile"
        />
      </div>
    </div>

    <div
      v-if="editable && importFeedback"
      role="alert"
      class="alert mb-4"
      :class="importFeedback.type === 'error' ? 'alert-error' : 'alert-success'"
    >
      <span>{{ importFeedback.text }}</span>
      <button class="btn btn-sm btn-ghost" @click="importFeedback = null">Fermer</button>
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

        <div v-if="editable" class="grid gap-4 mb-4 md:grid-cols-2">
          <CampaignPlacesEditor :campaign="campaign" />
          <CampaignPlayersEditor :campaign="campaign" />
        </div>

        <div v-if="editable" class="flex justify-end gap-2">
          <button class="btn btn-outline" @click="exportCampaign(campaign)">Exporter</button>
          <button class="btn btn-error btn-outline" @click="askDelete(campaign)">Supprimer</button>
          <button class="btn btn-primary" @click="openEditForm(campaign)">Modifier</button>
        </div>
      </div>
    </div>

    <BaseModal
      v-if="editable"
      :open="isFormOpen"
      :title="isEditing ? 'Modifier la campagne' : 'Nouvelle campagne'"
      @close="closeForm"
    >
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
          <textarea v-model="form.description" class="textarea textarea-bordered w-full"></textarea>
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
    </BaseModal>

    <BaseModal
      v-if="editable"
      :open="deletedCampaign !== null"
      title="Supprimer la campagne"
      @close="cancelDelete"
    >
      <p>
        Voulez-vous vraiment supprimer « {{ deletedCampaign?.name }} » ? Cette action est
        irréversible.
      </p>
      <div class="modal-action">
        <button type="button" class="btn" @click="cancelDelete">Annuler</button>
        <button type="button" class="btn btn-error" @click="confirmDelete">Supprimer</button>
      </div>
    </BaseModal>
  </div>
</template>
