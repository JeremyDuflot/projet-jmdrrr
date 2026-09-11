<script setup>
import CampaignPlayersPanel from '@/components/Campaigns/CampaignPlayersPanel.vue'
import { useCampaignsStore } from '@/stores/rpgStore.js'

const campaignsStore = useCampaignsStore()
</script>

<template>
  <router-view />
  <CampaignPlayersPanel
    v-if="campaignsStore.activeCampaignId"
    :campaign-id="campaignsStore.activeCampaignId"
  />
</template>
