<script setup>
import { computed } from 'vue'
import { useCampaignsStore } from '@/stores/campaigns'
import CampaignPlayersPanel from '../components/CampaignPlayersPanel.vue'

const campaignsStore = useCampaignsStore()

// TODO: remplacer par la vraie campagne active une fois la sélection de campagne construite
const firstCampaignId = computed(() => campaignsStore.campaigns[0]?.id)
</script>

<template>
  <router-view />
  <CampaignPlayersPanel v-if="firstCampaignId" :campaign-id="firstCampaignId" />
</template>
