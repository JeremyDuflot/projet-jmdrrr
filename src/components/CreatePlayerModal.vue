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
  <dialog v-if="show" class="modal modal-open">
    <div class="modal-box bg-black/90 backdrop-blur-sm border-2 border-amber-500/40 text-amber-500">
      <h3 class="font-bold text-lg mb-4 text-amber-500 font-['Cinzel']">Ajouter un nouveau personnage</h3>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="form-control">
          <label class="label" for="player-campaign">
            <span class="label-text text-amber-500 font-['Cinzel']">Campagne *</span>
          </label>
          <select
            id="player-campaign"
            v-model="formData.campaignId"
            class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl px-4 py-2 text-amber-500 focus:border-amber-400/70 w-full"
            required
          >
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
          <label class="label" for="player-name">
            <span class="label-text text-amber-500 font-['Cinzel']">Nom *</span>
          </label>
          <input
            id="player-name"
            v-model="formData.name"
            type="text"
            placeholder="Nom du personnage"
            class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl px-4 py-2 text-amber-500 focus:border-amber-400/70 w-full"
            required
          />
        </div>

        <div class="form-control">
          <label class="label" for="player-description">
            <span class="label-text text-amber-500 font-['Cinzel']">Description</span>
          </label>
          <textarea
            id="player-description"
            v-model="formData.description"
            placeholder="Description du personnage"
            class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl px-4 py-2 text-amber-500 focus:border-amber-400/70 w-full"
            rows="3"
          />
        </div>

        <div v-show="isGmPath" class="form-control">
          <label class="label" for="player-comment">
            <span class="label-text text-amber-500 font-['Cinzel']">Commentaire</span>
          </label>
          <textarea
            id="player-comment"
            v-model="formData.comment"
            placeholder="Commentaire"
            class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl px-4 py-2 text-amber-500 focus:border-amber-400/70 w-full"
            rows="2"
          />
        </div>

        <div class="form-control">
          <label class="label" for="player-max-hp">
            <span class="label-text text-amber-500 font-['Cinzel']">Points de vie max</span>
          </label>
          <input
            id="player-max-hp"
            v-model.number="formData.maxHp"
            type="number"
            min="1"
            class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl px-4 py-2 text-amber-500 focus:border-amber-400/70 w-full"
          />
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text font-bold text-amber-500 font-['Cinzel']">Inventaire</span>
          </label>
          <div v-if="items.length === 0" class="text-sm text-amber-500/50 mb-2">Aucun objet</div>
          <div v-for="(item, index) in items" :key="index" class="mb-3 p-3 bg-black/30 backdrop-blur-sm border border-amber-500/20 rounded-xl">
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm font-semibold text-amber-500">Objet {{ index + 1 }}</span>
              <button type="button" class="bg-black/50 backdrop-blur-sm border-2 border-red-500/40 rounded-xl px-2 py-1 text-red-500 hover:border-red-400/70 transition-all text-xs" @click="removeItem(index)">
                Supprimer
              </button>
            </div>
            <div class="form-control mb-2">
              <label class="label" :for="`item-name-${index}`">
                <span class="label-text text-sm text-amber-500">Nom de l'objet</span>
              </label>
              <input
                :id="`item-name-${index}`"
                v-model="item.name"
                type="text"
                placeholder="Nom de l'objet"
                class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl px-3 py-1 text-amber-500 focus:border-amber-400/70 w-full text-sm"
              />
            </div>
            <div class="form-control">
              <label class="label" :for="`item-description-${index}`">
                <span class="label-text text-sm text-amber-500">Description de l'objet</span>
              </label>
              <textarea
                :id="`item-description-${index}`"
                v-model="item.description"
                placeholder="Description de l'objet"
                class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl px-3 py-1 text-amber-500 focus:border-amber-400/70 w-full text-sm"
                rows="2"
              />
            </div>
          </div>
          <button type="button" class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl px-3 py-1 text-amber-500 hover:border-amber-400/70 transition-all text-sm mt-2" @click="addItem">
            Ajouter un objet
          </button>
        </div>

        <div class="modal-action">
          <button type="button" class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl px-4 py-2 text-amber-500 hover:border-amber-400/70 transition-all" @click="handleClose">Annuler</button>
          <button type="submit" class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl px-4 py-2 text-amber-500 hover:border-amber-400/70 transition-all">Créer</button>
        </div>
      </form>
    </div>
    <div class="modal-backdrop" @click="handleClose" />
  </dialog>
</template>
