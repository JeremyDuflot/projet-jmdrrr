<script setup>
import { useCampaignsStore } from '@/stores/rpgStore'
const campaignsStore = useCampaignsStore()
</script>

<template>
  <div v-if="campaignsStore.persistenceFailed" role="alert" class="alert alert-error">
    <span
      >Sauvegarde impossible : les modifications seront perdues au rechargement de la page.</span
    >
  </div>

  <RouterView />
</template>
