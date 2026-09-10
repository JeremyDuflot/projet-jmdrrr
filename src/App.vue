<script setup></script>

<template>
  <RouterLink :to="{ name: 'homepage' }" class="btn btn-active btn-primary">Accueil</RouterLink>
  <RouterLink :to="{ name: 'campaigns' }" class="btn btn-active btn-primary">Campagnes</RouterLink>

  <RouterView />
</template>

<style scoped></style>
