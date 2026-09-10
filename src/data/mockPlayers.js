const names = ['Aldric', 'Lyra', 'Brann', 'Elowen', 'Theron', 'Mira']
const placeNames = ['la Forêt Sombre', 'le Château en Ruines', 'le Village de Pierregris']
const mockCampaigns = [
  { id: 'campaign-1', name: "La Malédiction d'Eldrin" },
  { id: 'campaign-2', name: 'Les Ombres du Nord' },
]

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

const mockPlayers = []

for (let i = 0; i < 6; i++) {
  const maxHp = 20
  const randomCampaign = getRandomItem(mockCampaigns)

  mockPlayers.push({
    id: `player-${i}`,
    name: getRandomItem(names),
    state: 'alive',
    currentHp: maxHp,
    maxHp: maxHp,
    comment: '',
    description: 'Un aventurier prêt à en découdre.',
    inventory: {
      clues: [],
      items: [],
    },
    place: {
      name: getRandomItem(placeNames),
      description: '',
      comment: '',
    },
    campaignId: randomCampaign.id,
  })
}

export function getPlayers() {
  return mockPlayers
}

export function getCampaignName(campaignId) {
  const campaign = mockCampaigns.find((c) => c.id === campaignId)
  return campaign ? campaign.name : 'Campagne inconnue'
}
