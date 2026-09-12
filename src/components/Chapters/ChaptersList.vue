<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCampaignsStore } from '@/stores/rpgStore'
import BaseModal from '@/components/BaseModal.vue'
import QuestsList from '@/components/Quests/QuestsList.vue'

const STATE_LABELS = {
  inactive: 'Inactif',
  active: 'Actif',
  completed: 'Terminé',
}

const STATE_BADGES = {
  inactive: 'badge-ghost',
  active: 'badge-success',
  completed: 'badge-neutral',
}

const props = defineProps({
  editable: {
    type: Boolean,
    default: false,
  },
})

const route = useRoute()
const campaignsStore = useCampaignsStore()

// Keeps the store in sync with the campaign in the URL, including when
// navigating from one campaign to another without unmounting this component.
watch(
  () => route.params.campaignId,
  (campaignId) => campaignsStore.selectCampaign(campaignId),
  { immediate: true },
)

const campaign = computed(() => campaignsStore.selectedCampaign)

// Players only see the chapters they have reached: active and completed ones.
// Each entry keeps the index the chapter has in the store, so that reordering
// stays correct even when the list is filtered.
const visibleChapters = computed(() => {
  /** @type {Chapter[]} */
  const all = campaignsStore.chapters

  return all
    .map((chapter, index) => ({
      chapter,
      index,
      isFirst: index === 0,
      isLast: index === all.length - 1,
    }))
    .filter(({ chapter }) => props.editable || chapter.state !== 'inactive')
})

const editedId = ref(null)
const deletedId = ref(null)
const formError = ref('')

const form = reactive({
  name: '',
  description: '',
  comment: '',
  resolutionPassword: '',
})

const isFormOpen = ref(false)
const isEditing = computed(() => editedId.value !== null)
const deletedChapter = computed(() => campaignsStore.chapterById(deletedId.value))

function openCreateForm() {
  if (!props.editable) return

  editedId.value = null
  formError.value = ''
  Object.assign(form, { name: '', description: '', comment: '', resolutionPassword: '' })
  isFormOpen.value = true
}

function openEditForm(chapter) {
  if (!props.editable) return

  editedId.value = chapter.id
  formError.value = ''
  Object.assign(form, {
    name: chapter.name,
    description: chapter.description,
    comment: chapter.comment,
    resolutionPassword: chapter.resolutionPassword,
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
    formError.value = 'Le nom du chapitre est obligatoire.'
    return
  }

  const data = {
    name,
    description: form.description.trim(),
    comment: form.comment.trim(),
    resolutionPassword: form.resolutionPassword.trim(),
  }

  if (isEditing.value) campaignsStore.updateChapter(editedId.value, data)
  else campaignsStore.createChapter(data)

  closeForm()
}

function askDelete(chapter) {
  if (!props.editable) return

  deletedId.value = chapter.id
}

function cancelDelete() {
  deletedId.value = null
}

function confirmDelete() {
  if (!props.editable) return

  campaignsStore.deleteChapter(deletedId.value)
  if (editedId.value === deletedId.value) closeForm()
  deletedId.value = null
}

function markCompleted(chapter) {
  if (!props.editable) return

  campaignsStore.completeChapter(chapter.id)
}

function duplicate(chapter) {
  if (!props.editable) return

  campaignsStore.duplicateChapter(chapter.id)
}

function move(chapter, index, offset) {
  if (!props.editable) return

  campaignsStore.moveChapter(chapter.id, index + offset)
}
</script>

<template>
  <div class="m-2">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h1 class="text-2xl font-extrabold">Chapitres</h1>
        <p v-if="campaign" class="text-base-content/60">{{ campaign.name }}</p>
      </div>
      <div v-if="editable && campaign" class="flex gap-2">
        <button class="btn btn-primary" @click="openCreateForm">Nouveau chapitre</button>
      </div>
    </div>

    <p v-if="!campaign" class="text-base-content/60 italic">Aucune campagne sélectionnée.</p>

    <p v-else-if="visibleChapters.length === 0" class="text-base-content/60 italic">
      {{
        editable
          ? 'Aucun chapitre pour le moment. Créez-en un pour commencer.'
          : 'Aucun chapitre disponible pour le moment.'
      }}
    </p>

    <div
      v-for="{ chapter, index, isFirst, isLast } in visibleChapters"
      :key="chapter.id"
      class="collapse collapse-arrow bg-base-100 border border-base-300 mb-2 hover:bg-base-200 hover:border-base-content/20 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      <input type="checkbox" :id="'my-chapter-' + chapter.id" />
      <h2 class="collapse-title font-extrabold flex items-center gap-2">
        <span>{{ chapter.name }}</span>
        <span class="badge" :class="STATE_BADGES[chapter.state]">
          {{ STATE_LABELS[chapter.state] }}
        </span>
      </h2>
      <div class="collapse-content font-bold">
        <p v-if="chapter.description" class="mb-2">{{ chapter.description }}</p>
        <p v-else class="mb-2 text-base-content/60 italic">Pas de description.</p>

        <p v-if="editable && chapter.comment" class="mb-2 text-base-content/70">
          {{ chapter.comment }}
        </p>

        <div class="flex flex-wrap gap-2 mb-4 text-sm font-normal">
          <span class="badge badge-outline">{{ chapter.quests.length }} quête(s)</span>
          <span class="badge badge-outline">
            {{ chapter.requiredItemIds.length }} objet(s) requis
          </span>
          <span class="badge badge-outline">
            {{ chapter.rewards.itemIds.length }} objet(s) en récompense
          </span>
          <span class="badge badge-outline">
            {{ chapter.rewards.clueIds.length }} indice(s) en récompense
          </span>
        </div>

        <QuestsList :chapter="chapter" :editable="editable" />

        <div v-if="editable" class="flex flex-wrap justify-between gap-2">
          <div class="flex gap-2">
            <button class="btn btn-outline" :disabled="isFirst" @click="move(chapter, index, -1)">
              Monter
            </button>
            <button class="btn btn-outline" :disabled="isLast" @click="move(chapter, index, 1)">
              Descendre
            </button>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-if="chapter.state === 'active'"
              class="btn btn-success btn-outline"
              @click="markCompleted(chapter)"
            >
              Marquer comme terminé
            </button>
            <button class="btn btn-outline" @click="duplicate(chapter)">Dupliquer</button>
            <button class="btn btn-error btn-outline" @click="askDelete(chapter)">Supprimer</button>
            <button class="btn btn-primary" @click="openEditForm(chapter)">Modifier</button>
          </div>
        </div>
      </div>
    </div>

    <BaseModal
      v-if="editable"
      :open="isFormOpen"
      :title="isEditing ? 'Modifier le chapitre' : 'Nouveau chapitre'"
      @close="closeForm"
    >
      <form @submit.prevent="submitForm">
        <label class="form-control w-full mb-3">
          <span class="label-text">Nom</span>
          <input v-model="form.name" type="text" class="input input-bordered w-full" />
        </label>

        <label class="form-control w-full mb-3">
          <span class="label-text">Description</span>
          <textarea v-model="form.description" class="textarea textarea-bordered w-full"></textarea>
        </label>

        <label class="form-control w-full mb-3">
          <span class="label-text">Commentaire</span>
          <textarea v-model="form.comment" class="textarea textarea-bordered w-full"></textarea>
        </label>

        <label class="form-control w-full mb-3">
          <span class="label-text">Mot de passe de résolution</span>
          <input
            v-model="form.resolutionPassword"
            type="text"
            class="input input-bordered w-full"
          />
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
      :open="deletedChapter !== null"
      title="Supprimer le chapitre"
      @close="cancelDelete"
    >
      <p>
        Voulez-vous vraiment supprimer « {{ deletedChapter?.name }} » ? Cette action est
        irréversible.
      </p>
      <div class="modal-action">
        <button type="button" class="btn" @click="cancelDelete">Annuler</button>
        <button type="button" class="btn btn-error" @click="confirmDelete">Supprimer</button>
      </div>
    </BaseModal>
  </div>
</template>
