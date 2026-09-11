<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const routesNames = router
  .getRoutes()
  .filter((route) => !route.path.includes(':'))
  .map((route) => route.name)
</script>

<template>
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
