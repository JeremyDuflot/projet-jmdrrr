<script setup>
import { useRouter } from 'vue-router'
import { useCampaignsStore } from '@/stores/rpgStore'

const campaignsStore = useCampaignsStore()
const router = useRouter()
const routesNames = router
  .getRoutes()
  .filter((route) => !route.path.includes(':'))
  .map((route) => route.name)
</script>

<template>
  <div v-if="campaignsStore.persistenceFailed" role="alert" class="alert alert-error">
    <span
      >Sauvegarde impossible : les modifications seront perdues au rechargement de la page.</span
    >
  </div>

  <RouterLink
    v-for="(routeName, index) in routesNames"
    :key="index"
    :to="{ name: routeName }"
    class="btn btn-active btn-primary"
    >{{ routeName }}</RouterLink
  >

  <RouterView />
</template>

<style scoped></style>
