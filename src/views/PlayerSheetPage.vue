<script setup>
import { computed, ref, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { Check } from '@lucide/vue'
import { useCampaignsStore } from '@/stores/rpgStore.js'
import LifeBar from '@/components/LifeBar.vue'
import ResolutionPasswordPopup from '@/components/ResolutionPasswordPopup.vue'
import PlaceNavigator from '@/components/PlaceNavigator.vue'

const route = useRoute()
const campaignsStore = useCampaignsStore()

const playerName = route.params.playerName
const searchQuery = ref('')

/** @type {import('vue').Ref<HTMLDialogElement | null>} */
const successDialogRef = ref(null)
const successInfo = ref({ type: '', name: '' })

const campaign = computed(() => {
  return campaignsStore.campaigns.find((c) => c.players.some((p) => p.name === playerName)) ?? null
})

const playerId = computed(() => {
  const found = campaign.value?.players.find((p) => p.name === playerName)
  return found ? found.id : null
})

const player = computed(() => (playerId.value ? campaignsStore.playerView(playerId.value) : null))

const activeChapter = computed(
  () => campaign.value?.chapters.find((c) => c.state === 'active') ?? null,
)

const activeQuests = computed(() => {
  if (!campaign.value) return []
  return campaign.value.chapters.flatMap((chapter) =>
    chapter.quests.filter((quest) => quest.state === 'active'),
  )
})

function filterByQuery(items, query) {
  if (!items) return []
  if (!query) return items

  const lowerQuery = query.toLowerCase()
  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery),
  )
}

const filteredItems = computed(() => filterByQuery(player.value?.items ?? [], searchQuery.value))

const filteredClues = computed(() => filterByQuery(player.value?.clues ?? [], searchQuery.value))

function handleUpdateHp(newHp) {
  if (!playerId.value) return

  let state
  if (newHp === 0) {
    state = 'dead'
  } else if (player.value.state === 'dead' && newHp > 0) {
    state = 'alive'
  } else {
    state = player.value.state
  }

  campaignsStore.updatePlayer(playerId.value, { currentHp: newHp, state })
}

async function handleResolved({ type, name }) {
  successInfo.value = { type, name }
  await nextTick()
  successDialogRef.value?.showModal()
}

function closeSuccessDialog() {
  successDialogRef.value?.close()
}
</script>

<template>
  <div class="p-6">
    <dialog ref="successDialogRef" class="modal">
      <div
        class="modal-box bg-black/90 backdrop-blur-sm border-2 border-amber-500/40 text-amber-500"
      >
        <div class="flex flex-col items-center text-center py-4">
          <div class="rounded-full bg-success/20 p-3 mb-3">
            <Check :size="32" class="text-success" />
          </div>
          <h3 class="font-bold text-lg mb-1 text-amber-500 font-['Cinzel']">
            {{ successInfo.type === 'quest' ? 'Quête résolue !' : 'Chapitre résolu !' }}
          </h3>
          <p class="text-gray-400 text-sm">
            "{{ successInfo.name }}" — Bien joué, l'aventure continue.
          </p>
        </div>
        <div class="modal-action justify-center">
          <button
            type="button"
            class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl px-4 py-2 text-amber-500 hover:border-amber-400/70 transition-all"
            @click="closeSuccessDialog"
          >
            Fermer
          </button>
        </div>
      </div>
    </dialog>

    <div v-if="player" class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-bold mb-6 text-center text-amber-500 font-['Cinzel'] drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">Fiche de Personnage</h1>

      <div class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl shadow-xl mb-6 p-6">
        <h2 class="text-2xl font-bold text-amber-500 font-['Cinzel']">{{ player.name }}</h2>
        <div
          class="badge mb-4 bg-amber-500/20 border border-amber-500/40 text-amber-400"
        >
          {{ player.state === 'alive' ? 'Vivant' : 'Mort' }}
        </div>

          <LifeBar
            :current-hp="player.currentHp"
            :max-hp="player.maxHp"
            :editable="true"
            @update-hp="handleUpdateHp"
          />
          <div class="border-b border-amber-500/20 my-4" />

          <div>
            <h3 class="font-bold text-lg mb-2 text-amber-500 font-['Cinzel']">Description</h3>
            <div class="bg-black/30 backdrop-blur-sm border border-amber-500/20 rounded-xl p-4">
              <p class="text-amber-500/80">{{ player.description }}</p>
            </div>
          </div>

          <div class="border-b border-amber-500/20 my-4" />

          <div>
            <h3 class="font-bold text-lg mb-2 text-amber-500 font-['Cinzel']">Localisation</h3>
            <div v-if="player.place" class="bg-black/30 backdrop-blur-sm border border-amber-500/20 rounded-xl p-4 mb-3">
              <h4 class="font-semibold text-amber-500">{{ player.place.name }}</h4>
              <p class="text-sm text-amber-500/70">{{ player.place.description }}</p>
            </div>
            <div v-else class="bg-black/30 backdrop-blur-sm border border-amber-500/20 rounded-xl p-4 mb-3">
              <p class="text-sm text-amber-500/50 italic">Aucune localisation définie</p>
            </div>

            <PlaceNavigator :player-id="playerId" />
          </div>
      </div>

      <div v-if="activeChapter" class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl shadow-xl mb-6 p-6">
        <h3 class="text-xl font-bold text-amber-500 font-['Cinzel'] mb-2">Chapitre en cours</h3>
        <p class="font-semibold text-amber-500">{{ activeChapter.name }}</p>
        <p class="text-sm text-amber-500/70 mb-3">{{ activeChapter.description }}</p>
        <ResolutionPasswordPopup
          type="chapter"
          :entity-id="activeChapter.id"
          :player-id="playerId"
          @resolved="handleResolved"
        />
      </div>

      <div v-if="activeQuests.length > 0" class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl shadow-xl mb-6 p-6">
        <h3 class="text-xl font-bold text-amber-500 font-['Cinzel'] mb-4">Quêtes actives</h3>
        <div class="flex flex-col gap-3">
          <div v-for="quest in activeQuests" :key="quest.id" class="bg-black/30 backdrop-blur-sm border border-amber-500/20 rounded-xl p-4">
            <p class="font-semibold text-amber-500">{{ quest.name }}</p>
            <p class="text-sm text-amber-500/70 mb-2">{{ quest.description }}</p>
            <ResolutionPasswordPopup
              type="quest"
              :entity-id="quest.id"
              :player-id="playerId"
              @resolved="handleResolved"
            />
          </div>
        </div>
      </div>

      <div class="mb-6">
        <label for="search-input" class="sr-only">Rechercher dans l'inventaire</label>
        <input
          id="search-input"
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher dans l'inventaire..."
          class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl px-4 py-2 text-amber-500 focus:border-amber-400/70 w-full"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl shadow-xl p-6">
          <h3 class="text-xl font-bold text-amber-500 font-['Cinzel'] mb-4">Inventaire - Objets</h3>
          <div v-if="filteredItems.length > 0" class="mt-4 space-y-3">
            <div v-for="item in filteredItems" :key="item.id" class="bg-black/30 backdrop-blur-sm border border-amber-500/20 rounded-xl p-4">
              <h4 class="font-semibold text-amber-500">{{ item.name }}</h4>
              <p class="text-sm text-amber-500/70">{{ item.description }}</p>
            </div>
          </div>
          <p v-else class="text-amber-500/50 mt-4">
            {{ searchQuery ? 'Aucun objet correspondant' : 'Aucun objet' }}
          </p>
        </div>

        <div class="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl shadow-xl p-6">
          <h3 class="text-xl font-bold text-amber-500 font-['Cinzel'] mb-4">Inventaire - Indices</h3>
          <div v-if="filteredClues.length > 0" class="mt-4 space-y-3">
            <div v-for="clue in filteredClues" :key="clue.id" class="bg-black/30 backdrop-blur-sm border border-amber-500/20 rounded-xl p-4">
              <h4 class="font-semibold text-amber-500">{{ clue.name }}</h4>
              <p class="text-sm text-amber-500/70">{{ clue.description }}</p>
            </div>
          </div>
          <p v-else class="text-amber-500/50 mt-4">
            {{ searchQuery ? 'Aucun indice correspondant' : 'Aucun indice' }}
          </p>
        </div>
      </div>
    </div>

    <div v-else class="max-w-4xl mx-auto">
      <div class="bg-black/50 backdrop-blur-sm border-2 border-red-500/40 rounded-xl p-6">
        <p class="font-bold text-red-500 font-['Cinzel']">Personnage non trouvé</p>
      </div>
    </div>
  </div>
</template>
