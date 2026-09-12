import { faker } from '@faker-js/faker/locale/fr'
import { createId } from '@/data/entities'
import { useCampaignsStore } from '@/stores/rpgStore'

const SEED = 20260912

const PLACE_PREFIXES = [
  'Les Ruines de',
  'La Forêt de',
  'Le Donjon de',
  'Le Village de',
  'La Crypte de',
  'Les Marais de',
  'La Citadelle de',
  'Le Sanctuaire de',
  'Le Col de',
  'La Taverne de',
]

const LOCATION_NAMES = [
  'Eldrin',
  'Morghast',
  'Vaelen',
  'Brumelac',
  'Pierregris',
  'Sombrebois',
  'Ysoria',
  'Ombrelune',
  'Valdaren',
  'Grisemont',
]

const ITEM_NOUNS = [
  'Épée',
  'Dague',
  'Amulette',
  'Grimoire',
  'Potion',
  'Anneau',
  'Bouclier',
  'Arc',
  'Talisman',
  'Cape',
  'Clé',
  'Lanterne',
  'Fiole',
  'Parchemin',
  'Couronne',
]

const ITEM_QUALIFIERS = [
  'des Ombres',
  'de Braise',
  'du Crépuscule',
  "d'Argent",
  'des Anciens',
  'de Givre',
  'du Pacte',
  'des Brumes',
  'de Sang',
  'du Veilleur',
]

const CLUE_NOUNS = [
  'Lettre déchirée',
  'Symbole gravé',
  'Empreinte étrange',
  'Sceau brisé',
  'Confession murmurée',
  'Page arrachée',
  'Marque de cendre',
  'Chant oublié',
  'Portrait lacéré',
  'Rumeur de taverne',
  'Fragment de carte',
  'Odeur de soufre',
]

const QUEST_VERBS = [
  'Retrouver',
  'Escorter',
  'Déjouer',
  'Explorer',
  'Libérer',
  'Traquer',
  'Sceller',
  'Récupérer',
  'Protéger',
  'Infiltrer',
]

const QUEST_OBJECTS = [
  'le convoi disparu',
  'la relique volée',
  'le rituel interdit',
  'les galeries noyées',
  'le prisonnier du bailli',
  'la bête des tourbières',
  'la faille béante',
  'le testament du duc',
  'la caravane marchande',
  'le repaire des contrebandiers',
]

const CHAPTER_TITLES = [
  "L'Appel du Corbeau",
  'Les Cendres du Serment',
  'La Route des Brumes',
  'Le Prix du Silence',
  'La Marche des Oubliés',
  'Le Dernier Rempart',
  'Sous les Racines',
  'La Veillée des Loups',
]

const CAMPAIGN_BLUEPRINTS = [
  {
    name: "La Malédiction d'Eldrin",
    description: 'Un serment rompu il y a trois siècles réclame enfin son dû.',
    progress: 'finished',
    playerCount: 3,
  },
  {
    name: 'Les Ombres du Nord',
    description: "Les convois ne reviennent plus des cols gelés. Quelqu'un doit y monter.",
    progress: 'ongoing',
    playerCount: 4,
  },
  {
    name: 'Le Pacte de Brumelac',
    description: 'Le bourg prospère trop vite, et personne ne veut dire pourquoi.',
    progress: 'fresh',
    playerCount: 2,
  },
]

export function seedCampaigns(pinia) {
  const store = useCampaignsStore(pinia)

  faker.seed(SEED)

  const totalPlayers = CAMPAIGN_BLUEPRINTS.reduce((total, plan) => total + plan.playerCount, 0)
  const playerNames = unique(
    () => `${faker.person.firstName()} ${faker.person.lastName()}`,
    totalPlayers,
  )

  let cursor = 0
  const created = CAMPAIGN_BLUEPRINTS.map((blueprint) => {
    const names = playerNames.slice(cursor, cursor + blueprint.playerCount)
    cursor += blueprint.playerCount

    return store.createCampaign(buildCampaign(blueprint, names))
  })

  const ongoing = created.find((_, index) => CAMPAIGN_BLUEPRINTS[index].progress === 'ongoing')
  store.setActiveCampaign(ongoing.id)
  store.selectCampaign(ongoing.id)

  return created
}

function buildCampaign({ name, description, progress }, playerNames) {
  const places = buildPlaces()
  const items = buildItems()
  const clues = buildClues()
  const chapters = buildChapters(progress, { places, items, clues })

  return {
    id: createId('campaign'),
    name,
    state: progress === 'fresh' ? 'draft' : 'available',
    description,
    comment: '',
    places,
    items,
    clues,
    chapters,
    players: buildPlayers(playerNames, progress, { places, items }),
    revealedClueIds: collectRevealedClues(chapters),
  }
}

function buildPlaces() {
  const names = unique(
    () => `${pick(PLACE_PREFIXES)} ${pick(LOCATION_NAMES)}`,
    faker.number.int({ min: 5, max: 8 }),
  )

  return names.map((name) => ({
    id: createId('place'),
    name,
    description: faker.lorem.sentences(2),
    comment: '',
  }))
}

function buildItems() {
  const names = unique(
    () => `${pick(ITEM_NOUNS)} ${pick(ITEM_QUALIFIERS)}`,
    faker.number.int({ min: 10, max: 15 }),
  )

  return names.map((name) => ({
    id: createId('item'),
    name,
    description: faker.lorem.sentence(),
    comment: '',
  }))
}

function buildClues() {
  const names = unique(
    () => `${pick(CLUE_NOUNS)} — ${pick(LOCATION_NAMES)}`,
    faker.number.int({ min: 8, max: 12 }),
  )

  return names.map((name) => ({
    id: createId('clue'),
    name,
    description: faker.lorem.sentence(),
    comment: '',
  }))
}

function buildChapters(progress, catalogues) {
  const count = faker.number.int({ min: 4, max: 5 })
  const titles = faker.helpers.arrayElements(CHAPTER_TITLES, count)

  return titles.map((title, index) => {
    const state = chapterState(progress, index)

    return {
      id: createId('chapter'),
      name: `${index + 1}. ${title}`,
      state,
      description: faker.lorem.paragraph(),
      comment: '',
      requiredItemIds: index === 0 ? [] : idsOf(sample(catalogues.items, 0, 2)),
      resolutionPassword: password(),
      rewards: {
        itemIds: idsOf(sample(catalogues.items, 1, 3)),
        clueIds: idsOf(sample(catalogues.clues, 1, 2)),
      },
      quests: buildQuests(state, catalogues),
    }
  })
}

function buildQuests(parentState, { places, items, clues }) {
  const count = faker.number.int({ min: 8, max: 12 })
  const names = unique(() => `${pick(QUEST_VERBS)} ${pick(QUEST_OBJECTS)}`, count)

  return names.map((name) => {
    const state = questState(parentState)

    return {
      id: createId('quest'),
      name,
      state,
      description: faker.lorem.paragraph(),
      comment: '',
      placeId: pick(places).id,
      activationPassword: state === 'inactive' ? password() : null,
      resolutionPassword: password(),
      rewards: {
        itemIds: idsOf(sample(items, 0, 2)),
        clueIds: idsOf(sample(clues, 0, 2)),
      },
    }
  })
}

function buildPlayers(names, progress, { places, items }) {
  const maxHp = 20
  const untouched = progress === 'fresh'

  return names.map((name, index) => {
    const dead = progress === 'finished' && index === 0

    return {
      id: createId('player'),
      name,
      state: dead ? 'dead' : 'alive',
      description: faker.lorem.sentences(2),
      comment: '',
      maxHp,
      currentHp: dead || untouched ? (dead ? 0 : maxHp) : faker.number.int({ min: 6, max: maxHp }),
      placeId: pick(places).id,
      inventory: { itemIds: idsOf(untouched ? sample(items, 0, 1) : sample(items, 2, 5)) },
    }
  })
}

function chapterState(progress, index) {
  if (progress === 'finished') return 'completed'
  if (progress === 'fresh') return 'inactive'
  if (index < 2) return 'completed'
  if (index === 2) return 'active'

  return 'inactive'
}

function questState(parentState) {
  if (parentState === 'completed') {
    return faker.helpers.weightedArrayElement([
      { value: 'completed', weight: 8 },
      { value: 'abandoned', weight: 2 },
    ])
  }

  if (parentState === 'active') {
    return faker.helpers.weightedArrayElement([
      { value: 'completed', weight: 3 },
      { value: 'active', weight: 4 },
      { value: 'inactive', weight: 3 },
    ])
  }

  return 'inactive'
}

// Aligne l'état de départ sur ce que `grantRewards` aurait produit en jouant la campagne.
function collectRevealedClues(chapters) {
  const revealed = new Set()
  const reveal = (rewards) => rewards.clueIds.forEach((id) => revealed.add(id))

  chapters.forEach((chapter) => {
    if (chapter.state === 'completed') reveal(chapter.rewards)
    chapter.quests.forEach((quest) => {
      if (quest.state === 'completed') reveal(quest.rewards)
    })
  })

  return [...revealed]
}

function pick(list) {
  return faker.helpers.arrayElement(list)
}

function sample(list, min, max) {
  return faker.helpers.arrayElements(list, faker.number.int({ min, max }))
}

function unique(factory, count) {
  return faker.helpers.uniqueArray(factory, count)
}

function idsOf(list) {
  return list.map((entity) => entity.id)
}

function password() {
  return faker.string.alphanumeric({ length: 6 }).toUpperCase()
}
