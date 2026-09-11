<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCampaignsStore } from '@/stores/rpgStore'

const props = defineProps({
  show: { type: Boolean, required: true },
})

const emit = defineEmits(['close', 'created'])

const route = useRoute()
const campaignsStore = useCampaignsStore()

const isGmPath = computed(() => route.path.startsWith('/gm'))

const formData = ref({
  name: '',
  description: '',
  comment: '',
  maxHp: 100,
  campaignId: campaignsStore.selectedCampaignId || campaignsStore.activeCampaignId,
})

const items = ref([])

function addItem() {
  items.value.push({ name: '', description: '' })
}

function removeItem(index) {
  items.value.splice(index, 1)
}

function handleSubmit() {
  if (!formData.value.name.trim()) return
  if (!formData.value.campaignId) {
    alert('Erreur: Aucune campagne sélectionnée. Veuillez sélectionner une campagne.')
    return
  }

  const itemIds = []
  for (const item of items.value) {
    if (item.name.trim()) {
      const newItem = campaignsStore.createItem(
        {
          name: item.name,
          description: item.description,
        },
        formData.value.campaignId,
      )
      if (newItem) {
        itemIds.push(newItem.id)
      }
    }
  }

  const newPlayer = campaignsStore.createPlayer(
    {
      name: formData.value.name,
      description: formData.value.description,
      comment: isGmPath.value ? formData.value.comment : '',
      currentHp: formData.value.maxHp,
      maxHp: formData.value.maxHp,
      inventory: { itemIds },
    },
    formData.value.campaignId,
  )

  if (newPlayer) {
    emit('created', newPlayer)
    emit('close')
    resetForm()
  } else {
    alert('Erreur lors de la création du personnage.')
  }
}

function resetForm() {
  formData.value = {
    name: '',
    description: '',
    comment: '',
    maxHp: 100,
    campaignId: campaignsStore.selectedCampaignId || campaignsStore.activeCampaignId,
  }
  items.value = []
}

function handleClose() {
  emit('close')
  resetForm()
}
</script>

<template>
  <div v-if="show" class="modal modal-open">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">Ajouter un nouveau personnage</h3>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text">Campagne *</span>
          </label>
          <select v-model="formData.campaignId" class="select select-bordered w-full" required>
            <option
              v-for="campaign in campaignsStore.campaigns"
              :key="campaign.id"
              :value="campaign.id"
            >
              {{ campaign.name }}
            </option>
          </select>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Nom *</span>
          </label>
          <input
            v-model="formData.name"
            type="text"
            placeholder="Nom du personnage"
            class="input input-bordered w-full"
            required
          />
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Description</span>
          </label>
          <textarea
            v-model="formData.description"
            placeholder="Description du personnage"
            class="textarea textarea-bordered w-full"
            rows="3"
          />
        </div>

        <div v-show="isGmPath" class="form-control">
          <label class="label">
            <span class="label-text">Commentaire</span>
          </label>
          <textarea
            v-model="formData.comment"
            placeholder="Commentaire (visible uniquement par le MJ)"
            class="textarea textarea-bordered w-full"
            rows="2"
          />
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Points de vie max</span>
          </label>
          <input
            v-model.number="formData.maxHp"
            type="number"
            min="1"
            class="input input-bordered w-full"
          />
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text font-bold">Inventaire</span>
          </label>
          <div v-if="items.length === 0" class="text-sm text-base-content/50 mb-2">Aucun objet</div>
          <div v-for="(item, index) in items" :key="index" class="mb-3 p-3 bg-base-200 rounded-lg">
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm font-semibold">Objet {{ index + 1 }}</span>
              <button type="button" class="btn btn-xs btn-error" @click="removeItem(index)">
                Supprimer
              </button>
            </div>
            <div class="form-control mb-2">
              <input
                v-model="item.name"
                type="text"
                placeholder="Nom de l'objet"
                class="input input-bordered input-sm w-full"
              />
            </div>
            <div class="form-control">
              <textarea
                v-model="item.description"
                placeholder="Description de l'objet"
                class="textarea textarea-bordered textarea-sm w-full"
                rows="2"
              />
            </div>
          </div>
          <button type="button" class="btn btn-sm btn-outline mt-2" @click="addItem">
            Ajouter un objet
          </button>
        </div>

        <div class="modal-action">
          <button type="button" class="btn" @click="handleClose">Annuler</button>
          <button type="submit" class="btn btn-primary">Créer</button>
        </div>
      </form>
    </div>
    <div class="modal-backdrop" @click="handleClose" />
  </div>
</template>
