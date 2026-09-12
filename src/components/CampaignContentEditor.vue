<script setup>
import { computed, reactive, ref } from 'vue'
import { useCampaignsStore } from '@/stores/rpgStore'
import BaseModal from '@/components/BaseModal.vue'

const LABELS = {
  places: {
    title: 'Lieux',
    add: 'Ajouter un lieu',
    create: 'Nouveau lieu',
    edit: 'Modifier le lieu',
    remove: 'Supprimer le lieu',
    empty: 'Aucun lieu dans cette campagne.',
    nameRequired: 'Le nom du lieu est obligatoire.',
  },
  items: {
    title: 'Objets',
    add: 'Ajouter un objet',
    create: 'Nouvel objet',
    edit: "Modifier l'objet",
    remove: "Supprimer l'objet",
    empty: 'Aucun objet dans cette campagne.',
    nameRequired: "Le nom de l'objet est obligatoire.",
  },
  clues: {
    title: 'Indices',
    add: 'Ajouter un indice',
    create: 'Nouvel indice',
    edit: "Modifier l'indice",
    remove: "Supprimer l'indice",
    empty: 'Aucun indice dans cette campagne.',
    nameRequired: "Le nom de l'indice est obligatoire.",
  },
}

const props = defineProps({
  /** @type {import('vue').PropType<Campaign>} */
  campaign: {
    type: Object,
    required: true,
  },
  collection: {
    type: String,
    required: true,
    // Inlined on purpose: defineProps is hoisted out of setup() and cannot
    // reference LABELS. Keep both lists in sync.
    validator: (value) => ['places', 'items', 'clues'].includes(value),
  },
})

const campaignsStore = useCampaignsStore()

// Explicit wiring rather than string-built method names, so that a typo fails
// at write time instead of at click time.
const ACTIONS = {
  places: {
    create: (data, campaignId) => campaignsStore.createPlace(data, campaignId),
    update: (id, patch) => campaignsStore.updatePlace(id, patch),
    remove: (id) => campaignsStore.deletePlace(id),
    byId: (id) => campaignsStore.placeById(id),
  },
  items: {
    create: (data, campaignId) => campaignsStore.createItem(data, campaignId),
    update: (id, patch) => campaignsStore.updateItem(id, patch),
    remove: (id) => campaignsStore.deleteItem(id),
    byId: (id) => campaignsStore.itemById(id),
  },
  clues: {
    create: (data, campaignId) => campaignsStore.createClue(data, campaignId),
    update: (id, patch) => campaignsStore.updateClue(id, patch),
    remove: (id) => campaignsStore.deleteClue(id),
    byId: (id) => campaignsStore.clueById(id),
  },
}

const labels = computed(() => LABELS[props.collection])
const actions = computed(() => ACTIONS[props.collection])
const entities = computed(() => props.campaign[props.collection])

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
const deletedEntity = computed(() => actions.value.byId(deletedId.value))

// The store already clears every reference when an entity is deleted, so this
// only tells the game master what is about to be silently detached.
const deletionImpacts = computed(() => {
  const id = deletedId.value
  if (!id) return []

  const { players, chapters } = props.campaign
  const quests = chapters.flatMap((chapter) => chapter.quests)
  const impacts = []

  const count = (label, total) => {
    if (total > 0) impacts.push(`${total} ${label}`)
  }

  if (props.collection === 'places') {
    count("joueur(s) s'y trouvent", players.filter((player) => player.placeId === id).length)
    count("quête(s) s'y déroulent", quests.filter((quest) => quest.placeId === id).length)
  }

  if (props.collection === 'items') {
    count(
      'joueur(s) le portent',
      players.filter((player) => player.inventory.itemIds.includes(id)).length,
    )
    count(
      'chapitre(s) le demandent ou le donnent',
      chapters.filter(
        (chapter) => chapter.requiredItemIds.includes(id) || chapter.rewards.itemIds.includes(id),
      ).length,
    )
    count(
      'quête(s) le donnent en récompense',
      quests.filter((quest) => quest.rewards.itemIds.includes(id)).length,
    )
  }

  if (props.collection === 'clues') {
    count(
      'chapitre(s) le donnent en récompense',
      chapters.filter((chapter) => chapter.rewards.clueIds.includes(id)).length,
    )
    count(
      'quête(s) le donnent en récompense',
      quests.filter((quest) => quest.rewards.clueIds.includes(id)).length,
    )
  }

  return impacts
})

function openCreateForm() {
  editedId.value = null
  formError.value = ''
  Object.assign(form, { name: '', description: '', comment: '' })
  isFormOpen.value = true
}

function openEditForm(entity) {
  editedId.value = entity.id
  formError.value = ''
  Object.assign(form, {
    name: entity.name,
    description: entity.description,
    comment: entity.comment,
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
    formError.value = labels.value.nameRequired
    return
  }

  const data = {
    name,
    description: form.description.trim(),
    comment: form.comment.trim(),
  }

  if (isEditing.value) actions.value.update(editedId.value, data)
  else actions.value.create(data, props.campaign.id)

  closeForm()
}

function confirmDelete() {
  actions.value.remove(deletedId.value)
  if (editedId.value === deletedId.value) closeForm()
  deletedId.value = null
}
</script>

<template>
  <section class="font-normal">
    <div class="flex items-center justify-between gap-2 mb-2">
      <h3 class="font-bold">{{ labels.title }}</h3>
      <button class="btn btn-sm btn-outline" @click="openCreateForm">{{ labels.add }}</button>
    </div>

    <p v-if="entities.length === 0" class="text-sm text-base-content/60 italic">
      {{ labels.empty }}
    </p>

    <ul v-else class="list bg-base-200 rounded-box">
      <li v-for="entity in entities" :key="entity.id" class="list-row items-center">
        <div class="list-col-grow">
          <p class="font-bold">{{ entity.name }}</p>
          <p v-if="entity.description" class="text-sm text-base-content/70">
            {{ entity.description }}
          </p>
        </div>
        <button class="btn btn-sm btn-ghost" @click="openEditForm(entity)">Modifier</button>
        <button class="btn btn-sm btn-ghost text-error" @click="deletedId = entity.id">
          Supprimer
        </button>
      </li>
    </ul>

    <BaseModal
      :open="isFormOpen"
      :title="isEditing ? labels.edit : labels.create"
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
    </BaseModal>

    <BaseModal :open="deletedEntity !== null" :title="labels.remove" @close="deletedId = null">
      <p>Voulez-vous vraiment supprimer « {{ deletedEntity?.name }} » ?</p>

      <ul v-if="deletionImpacts.length" class="mt-2 text-sm text-base-content/70 list-disc ms-5">
        <li v-for="impact in deletionImpacts" :key="impact">{{ impact }}</li>
      </ul>

      <div class="modal-action">
        <button type="button" class="btn" @click="deletedId = null">Annuler</button>
        <button type="button" class="btn btn-error" @click="confirmDelete">Supprimer</button>
      </div>
    </BaseModal>
  </section>
</template>
