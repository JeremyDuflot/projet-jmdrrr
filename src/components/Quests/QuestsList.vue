<script setup>
import { computed, reactive, ref } from 'vue'
import { Copy, Eye, Pencil, Trash } from '@lucide/vue'
import { useCampaignsStore } from '@/stores/rpgStore'
import BaseModal from '@/components/BaseModal.vue'
import IdListPicker from '@/components/IdListPicker.vue'

const STATE_LABELS = {
  inactive: 'Inactive',
  active: 'Active',
  completed: 'Terminée',
  abandoned: 'Abandonnée',
}

const STATE_BADGES = {
  inactive: 'badge-ghost',
  active: 'badge-success',
  completed: 'badge-neutral',
  abandoned: 'badge-error',
}

const props = defineProps({
  /** @type {import('vue').PropType<Chapter>} */
  chapter: {
    type: Object,
    required: true,
  },
  editable: {
    type: Boolean,
    default: false,
  },
})

const campaignsStore = useCampaignsStore()

const quests = computed(() => props.chapter.quests)
const places = computed(() => campaignsStore.places)
const items = computed(() => campaignsStore.items)
const clues = computed(() => campaignsStore.clues)

const editedId = ref(null)
const deletedId = ref(null)
const detailedId = ref(null)
const formError = ref('')

const form = reactive({
  name: '',
  description: '',
  comment: '',
  placeId: '',
  activationPassword: '',
  resolutionPassword: '',
  rewardItemIds: [],
  rewardClueIds: [],
})

const isFormOpen = ref(false)
const isEditing = computed(() => editedId.value !== null)
const deletedQuest = computed(() => campaignsStore.questById(deletedId.value))
const detailedQuest = computed(() => campaignsStore.questById(detailedId.value))

// Players get the name and the state of every quest, but the description and
// the rewards only once the quest is out of its inactive state.
function showDetails(quest) {
  return props.editable || quest.state !== 'inactive'
}

function openDetail(quest) {
  if (!showDetails(quest)) return

  detailedId.value = quest.id
}

function closeDetail() {
  detailedId.value = null
}

function rewardCount(quest) {
  return quest.rewards.itemIds.length + quest.rewards.clueIds.length
}

function placeName(placeId) {
  return places.value.find((place) => place.id === placeId)?.name ?? ''
}

function openCreateForm() {
  if (!props.editable) return

  editedId.value = null
  formError.value = ''
  Object.assign(form, {
    name: '',
    description: '',
    comment: '',
    placeId: '',
    activationPassword: '',
    resolutionPassword: '',
    rewardItemIds: [],
    rewardClueIds: [],
  })
  isFormOpen.value = true
}

function openEditForm(quest) {
  if (!props.editable) return

  editedId.value = quest.id
  formError.value = ''
  Object.assign(form, {
    name: quest.name,
    description: quest.description,
    comment: quest.comment,
    placeId: quest.placeId ?? '',
    activationPassword: quest.activationPassword ?? '',
    resolutionPassword: quest.resolutionPassword,
    rewardItemIds: [...quest.rewards.itemIds],
    rewardClueIds: [...quest.rewards.clueIds],
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
    formError.value = 'Le nom de la quête est obligatoire.'
    return
  }

  const data = {
    name,
    description: form.description.trim(),
    comment: form.comment.trim(),
    placeId: form.placeId || null,
    activationPassword: form.activationPassword.trim() || null,
    resolutionPassword: form.resolutionPassword.trim(),
    // Rebuilt whole: applyPatch replaces the rewards object, it does not merge it.
    rewards: {
      itemIds: [...form.rewardItemIds],
      clueIds: [...form.rewardClueIds],
    },
  }

  if (isEditing.value) campaignsStore.updateQuest(editedId.value, data)
  else campaignsStore.createQuest(props.chapter.id, data)

  closeForm()
}

function askDelete(quest) {
  if (!props.editable) return

  deletedId.value = quest.id
}

function cancelDelete() {
  deletedId.value = null
}

function confirmDelete() {
  if (!props.editable) return

  campaignsStore.deleteQuest(deletedId.value)
  if (editedId.value === deletedId.value) closeForm()
  deletedId.value = null
}

function duplicate(quest) {
  if (!props.editable) return

  campaignsStore.duplicateQuest(quest.id)
}
</script>

<template>
  <div class="mb-4">
    <div class="flex items-center justify-between gap-2 mb-2">
      <h3 class="font-bold text-amber-500 font-['Cinzel']">Quêtes</h3>
      <button
        v-if="editable"
        class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl px-4 py-2 text-amber-500 hover:border-amber-400/70 transition-all cursor-pointer"
        @click="openCreateForm"
      >
        Nouvelle quête
      </button>
    </div>

    <p v-if="quests.length === 0" class="text-amber-500/60 italic font-normal font-['Cinzel']">
      {{ editable ? 'Aucune quête dans ce chapitre.' : 'Aucune quête pour le moment.' }}
    </p>

    <ul v-else class="flex flex-col gap-2">
      <li
        v-for="quest in quests"
        :key="quest.id"
        class="flex items-start justify-between gap-2 rounded-xl border border-amber-500/20 bg-black/30 backdrop-blur-sm p-3"
        :class="{ 'opacity-60': !showDetails(quest) }"
      >
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <button
              v-if="showDetails(quest)"
              type="button"
              class="font-semibold text-left hover:underline text-amber-500 cursor-pointer"
              @click="openDetail(quest)"
            >
              {{ quest.name }}
            </button>
            <span v-else class="font-semibold text-amber-500">{{ quest.name }}</span>
            <span class="badge bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs">
              {{ STATE_LABELS[quest.state] }}
            </span>
            <span
              v-if="showDetails(quest)"
              class="badge bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-normal"
            >
              {{ rewardCount(quest) }} récompense(s)
            </span>
            <span
              v-if="editable && quest.placeId"
              class="badge bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-normal"
            >
              {{ placeName(quest.placeId) }}
            </span>
          </div>

          <p
            v-if="showDetails(quest) && quest.description"
            class="mt-1 text-sm font-normal text-amber-500/70 line-clamp-2"
          >
            {{ quest.description }}
          </p>
        </div>

        <div class="flex shrink-0 gap-1">
          <button
            v-if="showDetails(quest)"
            class="bg-black/50 backdrop-blur-sm border border-amber-500/40 rounded-lg p-2 text-amber-500 hover:border-amber-400/70 transition-all cursor-pointer"
            aria-label="Voir le détail de la quête"
            title="Voir le détail"
            @click="openDetail(quest)"
          >
            <Eye :size="16" />
          </button>
          <button
            v-if="editable"
            class="bg-black/50 backdrop-blur-sm border border-amber-500/40 rounded-lg p-2 text-amber-500 hover:border-amber-400/70 transition-all cursor-pointer"
            aria-label="Modifier la quête"
            title="Modifier"
            @click="openEditForm(quest)"
          >
            <Pencil :size="16" />
          </button>
          <button
            v-if="editable"
            class="bg-black/50 backdrop-blur-sm border border-amber-500/40 rounded-lg p-2 text-amber-500 hover:border-amber-400/70 transition-all cursor-pointer"
            aria-label="Dupliquer la quête"
            title="Dupliquer"
            @click="duplicate(quest)"
          >
            <Copy :size="16" />
          </button>
          <button
            v-if="editable"
            class="bg-black/50 backdrop-blur-sm border border-red-500/40 rounded-lg p-2 text-red-500 hover:border-red-400/70 transition-all cursor-pointer"
            aria-label="Supprimer la quête"
            title="Supprimer"
            @click="askDelete(quest)"
          >
            <Trash :size="16" />
          </button>
        </div>
      </li>
    </ul>

    <BaseModal :open="detailedQuest !== null" :title="detailedQuest?.name" @close="closeDetail">
      <div v-if="detailedQuest">
        <div class="flex flex-wrap items-center gap-2 mb-3">
          <span class="badge bg-amber-500/20 border border-amber-500/40 text-amber-400">
            {{ STATE_LABELS[detailedQuest.state] }}
          </span>
          <span class="badge bg-amber-500/20 border border-amber-500/40 text-amber-400">
            {{ detailedQuest.rewards.itemIds.length }} objet(s) en récompense
          </span>
          <span class="badge bg-amber-500/20 border border-amber-500/40 text-amber-400">
            {{ detailedQuest.rewards.clueIds.length }} indice(s) en récompense
          </span>
          <span
            v-if="detailedQuest.placeId"
            class="badge bg-amber-500/20 border border-amber-500/40 text-amber-400"
          >
            {{ placeName(detailedQuest.placeId) }}
          </span>
        </div>

        <p v-if="detailedQuest.description" class="whitespace-pre-line text-amber-500/80">
          {{ detailedQuest.description }}
        </p>
        <p v-else class="text-amber-500/60 italic">Pas de description.</p>

        <template v-if="editable">
          <p v-if="detailedQuest.comment" class="mt-3 text-amber-500/70 whitespace-pre-line">
            {{ detailedQuest.comment }}
          </p>

          <div class="mt-3 text-sm text-amber-500/70">
            <p>
              Mot de passe d'activation :
              {{ detailedQuest.activationPassword || 'aucun' }}
            </p>
            <p>
              Mot de passe de résolution :
              {{ detailedQuest.resolutionPassword || 'aucun' }}
            </p>
          </div>
        </template>
      </div>

      <div class="modal-action">
        <button
          type="button"
          class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl px-4 py-2 text-amber-500 hover:border-amber-400/70 transition-all cursor-pointer"
          @click="closeDetail"
        >
          Fermer
        </button>
      </div>
    </BaseModal>

    <BaseModal
      v-if="editable"
      :open="isFormOpen"
      :title="isEditing ? 'Modifier la quête' : 'Nouvelle quête'"
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
          <span class="label-text text-amber-500 font-['Cinzel']">Lieu</span>
          <select
            v-model="form.placeId"
            class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl px-4 py-2 text-amber-500 focus:border-amber-400/70 w-full"
          >
            <option value="">Aucun lieu</option>
            <option v-for="place in places" :key="place.id" :value="place.id">
              {{ place.name }}
            </option>
          </select>
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
          <span class="label-text text-amber-500 font-['Cinzel']">Mot de passe d'activation</span>
          <input
            v-model="form.activationPassword"
            type="text"
            class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl px-4 py-2 text-amber-500 focus:border-amber-400/70 w-full"
          />
        </label>

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
      :open="deletedQuest !== null"
      title="Supprimer la quête"
      @close="cancelDelete"
    >
      <p class="text-amber-500/80">
        Voulez-vous vraiment supprimer « {{ deletedQuest?.name }} » ? Cette action est irréversible.
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
