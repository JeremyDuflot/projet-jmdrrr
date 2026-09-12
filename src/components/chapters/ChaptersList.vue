<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCampaignsStore } from '@/stores/rpgStore'
import BaseModal from '@/components/BaseModal.vue'
import QuestsList from '@/components/quests/QuestsList.vue'
import IdListPicker from '@/components/IdListPicker.vue'

const STATE_LABELS = {
  inactive: 'Inactif',
  active: 'Actif',
  completed: 'Terminé',
}

function getStateBadgeClass(state) {
  switch (state) {
    case 'active':
      return 'bg-black/50 backdrop-blur-sm border-2 border-green-500/40 px-2 rounded-xl text-green-500'
    case 'completed':
      return 'bg-black/50 backdrop-blur-sm border-2 border-red-500/40 px-2 rounded-xl text-red-500'
    default:
      return 'bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 px-2 rounded-xl text-amber-500'
  }
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
const items = computed(() => campaignsStore.items)
const clues = computed(() => campaignsStore.clues)

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
  requiredItemIds: [],
  rewardItemIds: [],
  rewardClueIds: [],
})

const isFormOpen = ref(false)
const isEditing = computed(() => editedId.value !== null)
const deletedChapter = computed(() => campaignsStore.chapterById(deletedId.value))

function openCreateForm() {
  if (!props.editable) return

  editedId.value = null
  formError.value = ''
  Object.assign(form, {
    name: '',
    description: '',
    comment: '',
    resolutionPassword: '',
    requiredItemIds: [],
    rewardItemIds: [],
    rewardClueIds: [],
  })
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
    requiredItemIds: [...chapter.requiredItemIds],
    rewardItemIds: [...chapter.rewards.itemIds],
    rewardClueIds: [...chapter.rewards.clueIds],
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
    requiredItemIds: [...form.requiredItemIds],
    // Rebuilt whole: applyPatch replaces the rewards object, it does not merge it.
    rewards: {
      itemIds: [...form.rewardItemIds],
      clueIds: [...form.rewardClueIds],
    },
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
        <h1 class="text-2xl font-extrabold text-amber-500 font-['Cinzel']">Chapitres</h1>
        <p v-if="campaign" class="text-amber-500/60 font-['Cinzel']">{{ campaign.name }}</p>
      </div>
      <div v-if="editable && campaign" class="flex gap-2">
        <button
          class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl px-4 py-2 text-amber-500 hover:border-amber-400/70 transition-all cursor-pointer"
          @click="openCreateForm"
        >
          Nouveau chapitre
        </button>
      </div>
    </div>

    <p v-if="!campaign" class="text-amber-500/60 italic font-['Cinzel']">
      Aucune campagne sélectionnée.
    </p>

    <p v-else-if="visibleChapters.length === 0" class="text-amber-500/60 italic font-['Cinzel']">
      {{
        editable
          ? 'Aucun chapitre pour le moment. Créez-en un pour commencer.'
          : 'Aucun chapitre disponible pour le moment.'
      }}
    </p>

    <div
      v-for="{ chapter, index, isFirst, isLast } in visibleChapters"
      :key="chapter.id"
      class="collapse collapse-arrow bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl mb-2 hover:border-amber-400/70 hover:shadow-xl transition-all duration-300"
    >
      <input type="checkbox" :id="'my-chapter-' + chapter.id" />
      <h2 class="collapse-title p-4 flex items-center gap-2">
        <span class="font-extrabold text-amber-500 font-['Cinzel']">{{ chapter.name }}</span>
        <span :class="getStateBadgeClass(chapter.state)">
          {{ STATE_LABELS[chapter.state] }}
        </span>
      </h2>
      <div class="collapse-content p-4">
        <p v-if="chapter.description" class="mb-2 text-amber-500/80 font-medium">
          {{ chapter.description }}
        </p>
        <p v-else class="mb-2 text-amber-500/60 italic">Pas de description.</p>

        <p v-if="editable && chapter.comment" class="mb-2 text-amber-500/70">
          {{ chapter.comment }}
        </p>

        <div class="flex flex-wrap gap-2 mb-4 text-sm font-normal">
          <span class="badge bg-amber-500/20 border border-amber-500/40 text-amber-400"
            >{{ chapter.quests.length }} quête(s)</span
          >
          <span class="badge bg-amber-500/20 border border-amber-500/40 text-amber-400">
            {{ chapter.requiredItemIds.length }} objet(s) requis
          </span>
          <span class="badge bg-amber-500/20 border border-amber-500/40 text-amber-400">
            {{ chapter.rewards.itemIds.length }} objet(s) en récompense
          </span>
          <span class="badge bg-amber-500/20 border border-amber-500/40 text-amber-400">
            {{ chapter.rewards.clueIds.length }} indice(s) en récompense
          </span>
        </div>

        <QuestsList :chapter="chapter" :editable="editable" />

        <div v-if="editable" class="flex flex-wrap justify-between gap-2">
          <div class="flex gap-2">
            <button
              class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl px-4 py-2 text-amber-500 hover:border-amber-400/70 transition-all disabled:opacity-50 cursor-pointer"
              :disabled="isFirst"
              @click="move(chapter, index, -1)"
            >
              Monter
            </button>
            <button
              class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl px-4 py-2 text-amber-500 hover:border-amber-400/70 transition-all disabled:opacity-50 cursor-pointer"
              :disabled="isLast"
              @click="move(chapter, index, 1)"
            >
              Descendre
            </button>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-if="chapter.state === 'active'"
              class="bg-black/50 backdrop-blur-sm border-2 border-green-500/40 rounded-xl px-4 py-2 text-green-500 hover:border-green-400/70 transition-all cursor-pointer"
              @click="markCompleted(chapter)"
            >
              Marquer comme terminé
            </button>
            <button
              class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl px-4 py-2 text-amber-500 hover:border-amber-400/70 transition-all cursor-pointer"
              @click="duplicate(chapter)"
            >
              Dupliquer
            </button>
            <button
              class="bg-black/50 backdrop-blur-sm border-2 border-red-500/40 rounded-xl px-4 py-2 text-red-500 hover:border-red-400/70 transition-all cursor-pointer"
              @click="askDelete(chapter)"
            >
              Supprimer
            </button>
            <button
              class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl px-4 py-2 text-amber-500 hover:border-amber-400/70 transition-all cursor-pointer"
              @click="openEditForm(chapter)"
            >
              Modifier
            </button>
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
          <span class="label-text text-amber-500 font-['Cinzel']">Commentaire</span>
          <textarea
            v-model="form.comment"
            class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl px-4 py-2 text-amber-500 focus:border-amber-400/70 w-full"
          ></textarea>
        </label>

        <IdListPicker
          v-model="form.requiredItemIds"
          :entities="items"
          label="Objets requis pour entrer dans le chapitre"
          empty-text="Aucun objet dans cette campagne. Créez-en depuis la page des campagnes."
        />

        <IdListPicker
          v-model="form.rewardItemIds"
          :entities="items"
          label="Objets en récompense"
          empty-text="Aucun objet dans cette campagne. Créez-en depuis la page des campagnes."
        />

        <IdListPicker
          v-model="form.rewardClueIds"
          :entities="clues"
          label="Indices en récompense"
          empty-text="Aucun indice dans cette campagne. Créez-en depuis la page des campagnes."
        />

        <label class="form-control w-full mb-3">
          <span class="label-text text-amber-500 font-['Cinzel']">Mot de passe de résolution</span>
          <input
            v-model="form.resolutionPassword"
            type="text"
            class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl px-4 py-2 text-amber-500 focus:border-amber-400/70 w-full"
          />
        </label>

        <p v-if="formError" class="text-red-400 mb-2">{{ formError }}</p>

        <div class="modal-action">
          <button
            type="button"
            class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl px-4 py-2 text-amber-500 hover:border-amber-400/70 transition-all cursor-pointer"
            @click="closeForm"
          >
            Annuler
          </button>
          <button
            type="submit"
            class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl px-4 py-2 text-amber-500 hover:border-amber-400/70 transition-all cursor-pointer"
          >
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
      <p class="text-amber-500/80">
        Voulez-vous vraiment supprimer « {{ deletedChapter?.name }} » ? Cette action est
        irréversible.
      </p>
      <div class="modal-action">
        <button
          type="button"
          class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl px-4 py-2 text-amber-500 hover:border-amber-400/70 transition-all cursor-pointer"
          @click="cancelDelete"
        >
          Annuler
        </button>
        <button
          type="button"
          class="bg-black/50 backdrop-blur-sm border-2 border-red-500/40 rounded-xl px-4 py-2 text-red-500 hover:border-red-400/70 transition-all cursor-pointer"
          @click="confirmDelete"
        >
          Supprimer
        </button>
      </div>
    </BaseModal>
  </div>
</template>
