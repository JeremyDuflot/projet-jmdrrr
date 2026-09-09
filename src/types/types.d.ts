type Campaign = {
  name: string
  state: "draft" | "available" | "active"
  description: string
  comment?: string
  players: Player[]
  chapters: Chapter[]
}

type Chapter = {
  name: string
  state: "disabled" | "enabled" | "completed"
  description: string
  comment?: string
  password?: string
  resolutionItems: Item[]
  rewards: {
    clues: Clue[]
    items: Item[]
  }
}

type Player = {
  name: string
  state: "alive" | "dead"
  comment: string
  description: string
  inventory: {
    clues: Clue[]
    items: Item[]
  }
  place: Place
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


