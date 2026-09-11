<script setup>
import ResolutionPasswordPopup from '../components/ResolutionPasswordPopup.vue'
import { useCampaignsStore } from '@/stores/campaigns'

const campaignsStore = useCampaignsStore()

// Réinitialisation forcée à chaque rechargement, pour un test propre et reproductible
campaignsStore.campaigns.splice(0, campaignsStore.campaigns.length)

const campaign = campaignsStore.createCampaign({ name: 'Campagne de test' })
const testPlayer = campaignsStore.createPlayer({ name: 'Aldric', maxHp: 20 }, campaign.id)
campaignsStore.selectCampaign(campaign.id)

const chapter1 = campaignsStore.createChapter(
  { name: 'Chapitre 1', resolutionPassword: 'chap1pass' },
  campaign.id,
)
const chapter2 = campaignsStore.createChapter(
  { name: 'Chapitre 2', resolutionPassword: 'chap2pass' },
  campaign.id,
)
</script>

<template>
  <main class="min-h-screen p-6">
    <p class="mb-2">
      Chapitre 1 : <strong>{{ chapter1.state }}</strong> — mot de passe attendu :
      <strong>chap1pass</strong>
    </p>
    <p class="mb-4">
      Chapitre 2 : <strong>{{ chapter2.state }}</strong> — mot de passe attendu :
      <strong>chap2pass</strong>
    </p>

    <div class="flex gap-2">
      <ResolutionPasswordPopup type="chapter" :entity-id="chapter1.id" :player-id="testPlayer.id" />
      <ResolutionPasswordPopup type="chapter" :entity-id="chapter2.id" :player-id="testPlayer.id" />
    </div>
  </main>
</template>
