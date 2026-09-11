export const CAMPAIGN_STATES = ['draft', 'available', 'active']
export const CHAPTER_STATES = ['inactive', 'active', 'completed']
export const QUEST_STATES = ['inactive', 'active', 'completed', 'abandoned']
export const PLAYER_STATES = ['alive', 'dead']

export function createId(prefix = 'id') {
  return `${prefix}_${crypto.randomUUID()}`
}

export function createPlace(data = {}) {
  return {
    id: data.id ?? createId('place'),
    name: data.name ?? 'Nouveau lieu',
    description: data.description ?? '',
    comment: data.comment ?? '',
  }
}

export function createItem(data = {}) {
  return {
    id: data.id ?? createId('item'),
    name: data.name ?? 'Nouvel objet',
    description: data.description ?? '',
    comment: data.comment ?? '',
  }
}

export function createClue(data = {}) {
  return {
    id: data.id ?? createId('clue'),
    name: data.name ?? 'Nouvel indice',
    description: data.description ?? '',
    comment: data.comment ?? '',
  }
}

export function createRewards(data = {}) {
  return {
    itemIds: toIdList(data.itemIds),
    clueIds: toIdList(data.clueIds),
  }
}

export function createPlayer(data = {}) {
  const maxHp = Number.isFinite(data.maxHp) ? data.maxHp : 10

  return {
    id: data.id ?? createId('player'),
    name: data.name ?? 'Nouveau joueur',
    state: data.state ?? 'alive',
    description: data.description ?? '',
    comment: data.comment ?? '',
    maxHp,
    currentHp: Number.isFinite(data.currentHp) ? data.currentHp : maxHp,
    placeId: data.placeId ?? null,
    inventory: { itemIds: toIdList(data.inventory?.itemIds) },
  }
}

export function createQuest(data = {}) {
  const activationPassword = data.activationPassword || null

  return {
    id: data.id ?? createId('quest'),
    name: data.name ?? 'Nouvelle quête',
    state: data.state ?? (activationPassword ? 'inactive' : 'active'),
    description: data.description ?? '',
    comment: data.comment ?? '',
    placeId: data.placeId ?? null,
    activationPassword,
    resolutionPassword: data.resolutionPassword ?? '',
    rewards: createRewards(data.rewards),
  }
}

export function createChapter(data = {}) {
  return {
    id: data.id ?? createId('chapter'),
    name: data.name ?? 'Nouveau chapitre',
    state: data.state ?? 'inactive',
    description: data.description ?? '',
    comment: data.comment ?? '',
    requiredItemIds: toIdList(data.requiredItemIds),
    resolutionPassword: data.resolutionPassword ?? '',
    rewards: createRewards(data.rewards),
    quests: Array.isArray(data.quests) ? data.quests.map(createQuest) : [],
  }
}

export function createCampaign(data = {}) {
  return activateFirstChapter({
    id: data.id ?? createId('campaign'),
    name: data.name ?? 'Nouvelle campagne',
    state: data.state ?? 'draft',
    description: data.description ?? '',
    comment: data.comment ?? '',
    players: Array.isArray(data.players) ? data.players.map(createPlayer) : [],
    chapters: Array.isArray(data.chapters) ? data.chapters.map(createChapter) : [],
    places: Array.isArray(data.places) ? data.places.map(createPlace) : [],
    items: Array.isArray(data.items) ? data.items.map(createItem) : [],
    clues: Array.isArray(data.clues) ? data.clues.map(createClue) : [],
    revealedClueIds: toIdList(data.revealedClueIds),
  })
}

export function activateFirstChapter(campaign) {
  const [first] = campaign.chapters
  if (first && first.state !== 'completed') first.state = 'active'

  return campaign
}

export function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

export function duplicateCampaign(campaign) {
  const copy = renewCampaignIds(clone(campaign))

  copy.name = `${campaign.name} (copie)`
  copy.state = 'draft'

  return copy
}

export function importCampaign(data) {
  const campaign = renewCampaignIds(createCampaign(clone(data)))
  if (campaign.state === 'active') campaign.state = 'available'

  return campaign
}

function renewCampaignIds(campaign) {
  const idMap = new Map()

  const renew = (entity, prefix) => {
    const nextId = createId(prefix)
    idMap.set(entity.id, nextId)
    entity.id = nextId
  }

  campaign.places.forEach((place) => renew(place, 'place'))
  campaign.items.forEach((item) => renew(item, 'item'))
  campaign.clues.forEach((clue) => renew(clue, 'clue'))
  campaign.players.forEach((player) => renew(player, 'player'))
  campaign.chapters.forEach((chapter) => {
    renew(chapter, 'chapter')
    chapter.quests.forEach((quest) => renew(quest, 'quest'))
  })

  remapReferences(campaign, (id) => idMap.get(id) ?? id)
  campaign.id = createId('campaign')

  return campaign
}

export function duplicateChapter(chapter) {
  const copy = clone(chapter)

  copy.id = createId('chapter')
  copy.name = `${chapter.name} (copie)`
  copy.state = 'inactive'
  copy.quests = copy.quests.map((quest) => resetQuestCopy(quest))

  return copy
}

export function duplicateQuest(quest) {
  const copy = resetQuestCopy(clone(quest))
  copy.name = `${quest.name} (copie)`

  return copy
}

export function duplicatePlayer(player) {
  const copy = clone(player)

  copy.id = createId('player')
  copy.name = `${player.name} (copie)`

  return copy
}

export function duplicateContent(entity, prefix) {
  const copy = clone(entity)

  copy.id = createId(prefix)
  copy.name = `${entity.name} (copie)`

  return copy
}

export function remapReferences(campaign, remap) {
  const remapList = (ids) => (Array.isArray(ids) ? ids.map((id) => remap(id)) : [])
  const remapOne = (id) => (id ? remap(id) : null)

  campaign.revealedClueIds = remapList(campaign.revealedClueIds)

  campaign.players.forEach((player) => {
    player.placeId = remapOne(player.placeId)
    player.inventory.itemIds = remapList(player.inventory.itemIds)
  })

  campaign.chapters.forEach((chapter) => {
    chapter.requiredItemIds = remapList(chapter.requiredItemIds)
    chapter.rewards.itemIds = remapList(chapter.rewards.itemIds)
    chapter.rewards.clueIds = remapList(chapter.rewards.clueIds)

    chapter.quests.forEach((quest) => {
      quest.placeId = remapOne(quest.placeId)
      quest.rewards.itemIds = remapList(quest.rewards.itemIds)
      quest.rewards.clueIds = remapList(quest.rewards.clueIds)
    })
  })

  return campaign
}

function resetQuestCopy(quest) {
  quest.id = createId('quest')
  quest.state = quest.activationPassword ? 'inactive' : 'active'

  return quest
}

function toIdList(value) {
  return Array.isArray(value) ? value.filter((id) => typeof id === 'string') : []
}
