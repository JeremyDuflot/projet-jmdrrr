<script setup>
import { useCampaignsStore } from '@/stores/campaigns'
const campaignsStore = useCampaignsStore()

if (campaignsStore.campaigns.length === 0) {
  const campaign = campaignsStore.createCampaign({ name: 'Campagne de test' })
  campaignsStore.createPlayer({ name: 'Aldric', maxHp: 20 }, campaign.id)
  campaignsStore.createPlayer({ name: 'Lyra', maxHp: 20 }, campaign.id)
}
</script>

<template>
  <main class="min-h-screen"></main>
</template>
