<script setup>
import { useCampaignsStore } from '@/stores/rpgStore.js'
import CampaignPlayersPanel from '../components/CampaignPlayersPanel.vue'

const campaignsStore = useCampaignsStore()
</script>

<template>
  <router-view />
  <CampaignPlayersPanel
    v-if="campaignsStore.activeCampaignId"
    :campaign-id="campaignsStore.activeCampaignId"
  />
</template>
