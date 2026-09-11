const names = ['Aldric', 'Lyra', 'Brann', 'Elowen', 'Theron', 'Mira']

const placeNames = ['la Forêt Sombre', 'le Château en Ruines', 'le Village de Pierregris']

const mockCampaigns = [
  { id: 'campaign-1', name: "La Malédiction d'Eldrin" },
  { id: 'campaign-2', name: 'Les Ombres du Nord' },
]

/**
 *
 * @param {any[]} arr
 * @returns
 */
function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * @type {Player[]}
 */
const mockPlayers = []

for (let i = 0; i < 6; i++) {
  const maxHp = 20
  const currentHp = Math.floor(Math.random() * (maxHp + 1))
  const randomCampaign = getRandomItem(mockCampaigns)

  mockPlayers.push({
    id: `player-${i}`,
    name: getRandomItem(names),
    state: 'alive',
    currentHp: currentHp,
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

/**
 *
 * @param {Player["campaignId"]} campaignId
 * @returns
 */
export function getCampaignName(campaignId) {
  const campaign = mockCampaigns.find((c) => c.id === campaignId)
  return campaign ? campaign.name : 'Campagne inconnue'
}

/**
 * @param {Player["campaignId"]} campaignId
 * @returns {Player[]}
 */
export function getPlayersByCampaign(campaignId) {
  return mockPlayers.filter((player) => player.campaignId === campaignId)
}
