<script setup>
import CampaignPlayersPanel from '../components/CampaignPlayersPanel.vue'

const props = defineProps({
  editable: {
    type: Boolean,
    default: true,
  },
})
</script>

<template>
  <main class="min-h-screen flex items-center justify-center">
    <CampaignPlayersPanel campaign-id="campaign-1" />
  </main>
</template>
