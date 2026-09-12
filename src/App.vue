<script setup>
import { useCampaignsStore } from '@/stores/rpgStore'
import { useRoute } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

const campaignsStore = useCampaignsStore()
const route = useRoute()
</script>

<template>
  <div v-if="campaignsStore.persistenceFailed" role="alert" class="alert alert-error">
    <span
      >Sauvegarde impossible : les modifications seront perdues au rechargement de la page.</span
    >
  </div>

  <MainLayout v-if="route.meta.useLayout">
    <RouterView />
  </MainLayout>
  <RouterView v-else />
</template>
