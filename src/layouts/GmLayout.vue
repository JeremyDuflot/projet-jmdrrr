<script setup>
import CampaignPlayersPanel from '@/components/campaigns/CampaignPlayersPanel.vue'
import { useCampaignsStore } from '@/stores/rpgStore.js'

const campaignsStore = useCampaignsStore()
</script>

<template>
  <div :class="campaignsStore.activeCampaignId ? 'pb-20' : ''">
    <slot />
  </div>
  <CampaignPlayersPanel
    v-if="campaignsStore.activeCampaignId"
    :campaign-id="campaignsStore.activeCampaignId"
  />
</template>
