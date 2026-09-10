type Rewards = {
  itemIds: string[]
  clueIds: string[]
}

type Campaign = {
  id: string
  name: string
  state: 'draft' | 'available' | 'active'
  description: string
  comment: string
  players: Player[]
  chapters: Chapter[]
  places: Place[]
  items: Item[]
  clues: Clue[]
  revealedClueIds: string[]
}

type Chapter = {
  id: string
  name: string
  state: 'inactive' | 'active' | 'completed'
  description: string
  comment: string
  activationPassword: string
  requiredItemIds: string[]
  resolutionPassword: string
  rewards: Rewards
  quests: Quest[]
}

type Quest = {
  id: string
  name: string
  state: 'inactive' | 'active' | 'completed' | 'abandoned'
  description: string
  comment: string
  placeId: string | null
  activationPassword: string | null
  resolutionPassword: string
  rewards: Rewards
}

type Player = {
  id: string
  name: string
  state: 'alive' | 'dead'
  description: string
  comment: string
  currentHp: number
  maxHp: number
  placeId: string | null
  inventory: {
    itemIds: string[]
  }
}

type Place = {
  id: string
  name: string
  description: string
  comment: string
}

type Item = {
  id: string
  name: string
  description: string
  comment: string
}

type Clue = {
  id: string
  name: string
  text: string
  comment: string
}

type PlayerView = Player & {
  place: Place | null
  items: Item[]
  clues: Clue[]
}
