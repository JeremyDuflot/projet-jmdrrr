<script setup>
import CampaignPlayersPanel from '../components/CampaignPlayersPanel.vue'
</script>

<template>
  <router-view />
  <!-- TODO: remplacer 'campaign-1' par la vraie campagne active -->
  <CampaignPlayersPanel campaign-id="campaign-1" />
</template>
