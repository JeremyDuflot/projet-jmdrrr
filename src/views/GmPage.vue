<script setup>
import { onMounted } from 'vue'
import { useCampaignsStore } from '@/stores/rpgStore.js'

const campaignsStore = useCampaignsStore()

onMounted(() => {
  const campaign = campaignsStore.createCampaign({ name: 'Campagne test MDPA' })
  campaignsStore.createPlayer({ name: 'TestJoueur2', maxHp: 20 }, campaign.id)
  campaignsStore.setActiveCampaign(campaign.id)

  const chapter = campaignsStore.createChapter(
    { name: 'Chapitre 12', resolutionPassword: 'chap1234' },
    campaign.id,
  )
  campaignsStore.createQuest(chapter.id, {
    name: 'Quête test1',
    resolutionPassword: 'quest1234',
  })
})
</script>

<template>
  <main class="min-h-screen"></main>
</template>
