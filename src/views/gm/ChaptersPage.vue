<script setup>
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCampaignsStore } from '@/stores/rpgStore'
import ChaptersList from '@/components/Chapters/ChaptersList.vue'

const route = useRoute()
const campaignsStore = useCampaignsStore()

// Keeps the store in sync with the campaign in the URL, including when
// navigating from one campaign to another without unmounting this page.
watch(
  () => route.params.campaignId,
  (campaignId) => campaignsStore.selectCampaign(campaignId),
  { immediate: true },
)
</script>

<template>
  <div class="m-4">
    <ChaptersList editable />
  </div>
</template>
