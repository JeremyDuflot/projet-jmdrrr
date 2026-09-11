import { useCampaignsStore } from '@/stores/campaigns'

export function getCampaignNameForPlayer(playerId) {
  const store = useCampaignsStore()
  const campaign = store.campaigns.find((campaign) =>
    campaign.players.some((player) => player.id === playerId),
  )
  return campaign ? campaign.name : 'Campagne inconnue'
}
