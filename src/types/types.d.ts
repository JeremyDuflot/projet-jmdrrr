type Campaign = {
  id: string
  name: string
  state: 'draft' | 'available' | 'active'
  description: string
  comment: string | null
  players: Player[]
  chapters: Chapter[]
}

type Chapter = {
  name: string
  state: 'disabled' | 'enabled' | 'completed'
  description: string
  comment: string | null
  password: string | null
  resolutionItems: Item[]
  rewards: {
    clues: Clue[]
    items: Item[]
  }
}

type Quest = {
  name: string
  state: 'inactive' | 'active' | 'completed' | 'abandonned'
  description: string
  activationPassword: string | null
  resolutionPassword: string
  rewards: {
    clues: Clue[] | null
    items: Item[] | null
  }
}

type Player = {
  id: string
  name: string
  state: 'alive' | 'dead'
  currentHp: number
  maxHp: number
  comment: string
  description: string
  inventory: {
    clues: Clue[]
    items: Item[]
  }
  place: Place
  campaignId: string
}

type Place = {
  name: string
  description: string
  comment: string
}

type Item = {
  name: string
  description: string
  comment: string
}

type Clue = {
  name: string
  description: string
  comment: string
}
