<script setup>
import { computed } from 'vue'
import { useCampaignsStore } from '@/stores/rpgStore'
import { useRoute } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import GmLayout from '@/layouts/GmLayout.vue'

const campaignsStore = useCampaignsStore()
const route = useRoute()

const isGmRoute = computed(() => route.path.startsWith('/gm/'))
</script>

<template>
  <div v-if="campaignsStore.persistenceFailed" role="alert" class="alert alert-error">
    <span
      >Sauvegarde impossible : les modifications seront perdues au rechargement de la page.</span
    >
  </div>

  <MainLayout v-if="route.meta.useLayout">
    <GmLayout v-if="isGmRoute">
      <RouterView />
    </GmLayout>
    <RouterView v-else />
  </MainLayout>
  <RouterView v-else />
</template>
