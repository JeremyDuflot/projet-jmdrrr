import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePlayerStore = defineStore('player', () => {
  // Fake data pour tester la vue de la Fiche de Perso en allant sur '/player/Lady Jessica'
  const testPlayer = ref({
    name: 'Lady Jessica',
    state: 'alive',
    currentHp: 85,
    maxHp: 100,
    comment: "Bene Gesserit, mère de Paul Muad'Dib",
    description:
      'Lady Jessica est une Bene Gesserit et la concubine officielle du Duc Leto Atreides. Elle possède des capacités physiques et mentales exceptionnelles grâce à son entraînement Bene Gesserit, ainsi que la Voix.',
    inventory: {
      clues: [
        {
          name: 'Prophétie du Kwisatz Haderach',
          description: 'Anciens textes Bene Gesserit sur la venue du super-être.',
          comment: "Secret de l'ordre",
        },
      ],
      items: [
        {
          name: 'Gom Jabbar',
          description: "Une aiguille empoisonnée utilisée pour le test de l'humanité.",
          comment: 'Arme secrète',
        },
        {
          name: 'Module de navigation',
          description: 'Dispositif de calcul pour les voyages spatiaux sans Guild.',
          comment: 'Technologie rare',
        },
      ],
    },
    place: {
      name: 'Arrakis',
      description:
        "Planète désertique également connue sous le nom de Dune, seule source de l'épice.",
      comment: 'Monde hostile',
    },
  })

  // TODO: Ajouter la récup des campaigns actives pour récup les players
  // Utilise testPlayer en attendant
  function loadFromStorage() {
    const storedTest = localStorage.getItem('testPlayer')
    if (storedTest) {
      testPlayer.value = JSON.parse(storedTest)
    }
  }

  // TODO: à update pour récup les vrai players
  //  Utilise testPlayer en attendant
  function getPlayer(playerName) {
    if (testPlayer.value.name === playerName) {
      return testPlayer.value
    }
    return null
  }

  function updateTestPlayer(updatedPlayer) {
    testPlayer.value = updatedPlayer
    localStorage.setItem('testPlayer', JSON.stringify(testPlayer.value))
  }

  loadFromStorage()

  return {
    testPlayer,
    getPlayer,
    updateTestPlayer,
  }
})
