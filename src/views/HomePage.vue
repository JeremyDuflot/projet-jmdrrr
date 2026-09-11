<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCampaignsStore } from '@/stores/rpgStore.js'
const router = useRouter()
const campaignsStore = useCampaignsStore()
import SelectableRoleCard from '../components/SelectableRoleCard.vue'

/** @param {import('vue-router').RouteRecordNameGeneric} routeName */
function handleRoleSelect(routeName) {
  router.push({ name: routeName })
}

onMounted(() => {
  const campaign = campaignsStore.createCampaign({ name: 'Campagne test déplacement' })
  campaignsStore.createPlayer({ name: 'TestNav', maxHp: 20 }, campaign.id)
  campaignsStore.setActiveCampaign(campaign.id)

  const forest = campaignsStore.createPlace(
    { name: 'Forêt Sombre', description: 'Un bois dense.' },
    campaign.id,
  )
  const village = campaignsStore.createPlace(
    { name: 'Village de Pierregris', description: 'Un petit village.' },
    campaign.id,
  )

  const chapter = campaignsStore.createChapter(
    { name: 'Chapitre 1', resolutionPassword: 'chap1' },
    campaign.id,
  )

  campaignsStore.createQuest(chapter.id, {
    name: 'Quête 1 - Explorer la forêt',
    resolutionPassword: 'quest1',
    placeId: forest.id,
  })

  campaignsStore.createQuest(chapter.id, {
    name: 'Quête 2 - Enquête au village',
    resolutionPassword: 'quest2',
    placeId: village.id,
  })
})
</script>
