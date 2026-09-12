import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as entities from '@/data/entities'

export const useCampaignsStore = defineStore(
  'campaigns',
  () => {
    const campaigns = ref([])
    const activeCampaignId = ref(null)
    const selectedCampaignId = ref(null)

    const activeCampaign = computed(() => findCampaign(activeCampaignId.value))
    const selectedCampaign = computed(() => findCampaign(selectedCampaignId.value))

    const campaignById = computed(() => findCampaign)

    const chapters = computed(() => selectedCampaign.value?.chapters ?? [])
    const players = computed(() => selectedCampaign.value?.players ?? [])
    const places = computed(() => selectedCampaign.value?.places ?? [])
    const items = computed(() => selectedCampaign.value?.items ?? [])
    const clues = computed(() => selectedCampaign.value?.clues ?? [])
    const quests = computed(() => chapters.value.flatMap((chapter) => chapter.quests))

    const chapterById = computed(() => (id) => locateChapter(id)?.chapter ?? null)
    const questById = computed(() => (id) => locateQuest(id)?.quest ?? null)
    const playerById = computed(() => (id) => locatePlayer(id)?.player ?? null)
    const placeById = computed(() => (id) => locateContent('places', id)?.entity ?? null)
    const itemById = computed(() => (id) => locateContent('items', id)?.entity ?? null)
    const clueById = computed(() => (id) => locateContent('clues', id)?.entity ?? null)

    const questsOfChapter = computed(
      () => (chapterId) => locateChapter(chapterId)?.chapter.quests ?? [],
    )
    const chapterOfQuest = computed(() => (questId) => locateQuest(questId)?.chapter ?? null)

    const playerView = computed(() => (playerId) => {
      const found = locatePlayer(playerId)
      if (!found) return null

      const { campaign, player } = found

      return {
        ...player,
        place: campaign.places.find((place) => place.id === player.placeId) ?? null,
        items: pickByIds(campaign.items, player.inventory.itemIds),
        clues: pickByIds(campaign.clues, campaign.revealedClueIds),
      }
    })

    function createCampaign(data = {}) {
      const campaign = pushInto(campaigns.value, entities.createCampaign(data))
      selectedCampaignId.value = campaign.id

      return campaign
    }

    function updateCampaign(campaignId, patch) {
      const campaign = findCampaign(campaignId)
      if (!campaign) return null

      applyPatch(campaign, patch, ['players', 'chapters', 'places', 'items', 'clues'])

      return campaign
    }

    function duplicateCampaign(campaignId) {
      const campaign = findCampaign(campaignId)
      if (!campaign) return null

      return pushInto(campaigns.value, entities.duplicateCampaign(campaign))
    }

    function importCampaign(data) {
      const campaign = pushInto(campaigns.value, entities.importCampaign(data))
      selectedCampaignId.value = campaign.id

      return campaign
    }

    function deleteCampaign(campaignId) {
      const index = campaigns.value.findIndex((campaign) => campaign.id === campaignId)
      if (index === -1) return false

      campaigns.value.splice(index, 1)
      if (activeCampaignId.value === campaignId) activeCampaignId.value = null
      if (selectedCampaignId.value === campaignId) selectedCampaignId.value = null

      return true
    }

    function selectCampaign(campaignId) {
      selectedCampaignId.value = findCampaign(campaignId) ? campaignId : null
    }

    function setActiveCampaign(campaignId) {
      const campaign = findCampaign(campaignId)
      if (!campaign) return null

      campaigns.value.forEach((other) => {
        if (other.state === 'active') other.state = 'available'
      })

      campaign.state = 'active'
      activeCampaignId.value = campaign.id

      return campaign
    }

    function createChapter(data = {}, campaignId = selectedCampaignId.value) {
      const campaign = findCampaign(campaignId)
      if (!campaign) return null

      const chapter = pushInto(campaign.chapters, entities.createChapter(data))
      entities.activateFirstChapter(campaign)

      return chapter
    }

    function updateChapter(chapterId, patch) {
      const found = locateChapter(chapterId)
      if (!found) return null

      const wasCompleted = found.chapter.state === 'completed'
      applyPatch(found.chapter, patch, ['quests'])
      if (!wasCompleted && found.chapter.state === 'completed') {
        activateNextChapter(found)
        abandonUnresolvedQuests(found.chapter)
      }
      entities.activateFirstChapter(found.campaign)

      return found.chapter
    }

    function completeChapter(chapterId) {
      return updateChapter(chapterId, { state: 'completed' })
    }

    function duplicateChapter(chapterId) {
      const found = locateChapter(chapterId)
      if (!found) return null

      return insertInto(
        found.campaign.chapters,
        found.index + 1,
        entities.duplicateChapter(found.chapter),
      )
    }

    function deleteChapter(chapterId) {
      const found = locateChapter(chapterId)
      if (!found) return false

      found.campaign.chapters.splice(found.index, 1)
      entities.activateFirstChapter(found.campaign)

      return true
    }

    function moveChapter(chapterId, toIndex) {
      const found = locateChapter(chapterId)
      if (!found) return false

      const [previousFirst] = found.campaign.chapters
      move(found.campaign.chapters, found.index, toIndex)
      if (found.campaign.chapters[0] !== previousFirst && previousFirst.state === 'active') {
        previousFirst.state = 'inactive'
      }
      entities.activateFirstChapter(found.campaign)

      return true
    }

    function createQuest(chapterId, data = {}) {
      const found = locateChapter(chapterId)
      if (!found) return null

      return pushInto(found.chapter.quests, entities.createQuest(data))
    }

    function updateQuest(questId, patch) {
      const found = locateQuest(questId)
      if (!found) return null

      const wasLocked = Boolean(found.quest.activationPassword)
      applyPatch(found.quest, patch)
      syncQuestLock(found.quest, wasLocked)

      return found.quest
    }

    function duplicateQuest(questId) {
      const found = locateQuest(questId)
      if (!found) return null

      return insertInto(found.chapter.quests, found.index + 1, entities.duplicateQuest(found.quest))
    }

    function deleteQuest(questId) {
      const found = locateQuest(questId)
      if (!found) return false

      found.chapter.quests.splice(found.index, 1)

      return true
    }

    function moveQuest(questId, toIndex) {
      const found = locateQuest(questId)
      if (!found) return false

      move(found.chapter.quests, found.index, toIndex)

      return true
    }

    function moveQuestToChapter(questId, targetChapterId, toIndex = null) {
      const found = locateQuest(questId)
      const target = locateChapter(targetChapterId)
      if (!found || !target || found.campaign.id !== target.campaign.id) return false
      if (found.chapter.id === target.chapter.id) return moveQuest(questId, toIndex ?? found.index)

      const [quest] = found.chapter.quests.splice(found.index, 1)
      const insertAt =
        toIndex === null
          ? target.chapter.quests.length
          : clamp(toIndex, 0, target.chapter.quests.length)
      target.chapter.quests.splice(insertAt, 0, quest)

      return true
    }

    function createPlayer(data = {}, campaignId = selectedCampaignId.value) {
      const campaign = findCampaign(campaignId)
      if (!campaign) return null

      return pushInto(campaign.players, entities.createPlayer(data))
    }

    function updatePlayer(playerId, patch) {
      const found = locatePlayer(playerId)
      if (!found) return null

      applyPatch(found.player, patch, ['inventory'])

      return found.player
    }

    function duplicatePlayer(playerId) {
      const found = locatePlayer(playerId)
      if (!found) return null

      return insertInto(
        found.campaign.players,
        found.index + 1,
        entities.duplicatePlayer(found.player),
      )
    }

    function deletePlayer(playerId) {
      const found = locatePlayer(playerId)
      if (!found) return false

      found.campaign.players.splice(found.index, 1)

      return true
    }

    function createPlace(data = {}, campaignId = selectedCampaignId.value) {
      return addContent('places', entities.createPlace(data), campaignId)
    }

    function createItem(data = {}, campaignId = selectedCampaignId.value) {
      return addContent('items', entities.createItem(data), campaignId)
    }

    function createClue(data = {}, campaignId = selectedCampaignId.value) {
      return addContent('clues', entities.createClue(data), campaignId)
    }

    function updatePlace(placeId, patch) {
      return editContent('places', placeId, patch)
    }

    function updateItem(itemId, patch) {
      return editContent('items', itemId, patch)
    }

    function updateClue(clueId, patch) {
      return editContent('clues', clueId, patch)
    }

    function duplicatePlace(placeId) {
      return copyContent('places', placeId, 'place')
    }

    function duplicateItem(itemId) {
      return copyContent('items', itemId, 'item')
    }

    function duplicateClue(clueId) {
      return copyContent('clues', clueId, 'clue')
    }

    function deletePlace(placeId) {
      const found = locateContent('places', placeId)
      if (!found) return false

      const { campaign } = found
      campaign.places.splice(found.index, 1)
      campaign.players.forEach((player) => {
        if (player.placeId === placeId) player.placeId = null
      })
      eachQuest(campaign, (quest) => {
        if (quest.placeId === placeId) quest.placeId = null
      })

      return true
    }

    function deleteItem(itemId) {
      const found = locateContent('items', itemId)
      if (!found) return false

      const { campaign } = found
      campaign.items.splice(found.index, 1)
      campaign.players.forEach((player) => {
        player.inventory.itemIds = without(player.inventory.itemIds, itemId)
      })
      campaign.chapters.forEach((chapter) => {
        chapter.requiredItemIds = without(chapter.requiredItemIds, itemId)
        chapter.rewards.itemIds = without(chapter.rewards.itemIds, itemId)
      })
      eachQuest(campaign, (quest) => {
        quest.rewards.itemIds = without(quest.rewards.itemIds, itemId)
      })

      return true
    }

    function deleteClue(clueId) {
      const found = locateContent('clues', clueId)
      if (!found) return false

      const { campaign } = found
      campaign.clues.splice(found.index, 1)
      campaign.revealedClueIds = without(campaign.revealedClueIds, clueId)
      campaign.chapters.forEach((chapter) => {
        chapter.rewards.clueIds = without(chapter.rewards.clueIds, clueId)
      })
      eachQuest(campaign, (quest) => {
        quest.rewards.clueIds = without(quest.rewards.clueIds, clueId)
      })

      return true
    }

    function findCampaign(campaignId) {
      return campaigns.value.find((campaign) => campaign.id === campaignId) ?? null
    }

    function locateChapter(chapterId) {
      for (const campaign of campaigns.value) {
        const index = campaign.chapters.findIndex((chapter) => chapter.id === chapterId)
        if (index !== -1) return { campaign, chapter: campaign.chapters[index], index }
      }

      return null
    }

    function locateQuest(questId) {
      for (const campaign of campaigns.value) {
        for (const chapter of campaign.chapters) {
          const index = chapter.quests.findIndex((quest) => quest.id === questId)
          if (index !== -1) return { campaign, chapter, quest: chapter.quests[index], index }
        }
      }

      return null
    }

    function locatePlayer(playerId) {
      for (const campaign of campaigns.value) {
        const index = campaign.players.findIndex((player) => player.id === playerId)
        if (index !== -1) return { campaign, player: campaign.players[index], index }
      }

      return null
    }

    function locateContent(collection, entityId) {
      for (const campaign of campaigns.value) {
        const index = campaign[collection].findIndex((entity) => entity.id === entityId)
        if (index !== -1) return { campaign, entity: campaign[collection][index], index }
      }

      return null
    }

    function addContent(collection, entity, campaignId) {
      const campaign = findCampaign(campaignId)
      if (!campaign) return null

      return pushInto(campaign[collection], entity)
    }

    function editContent(collection, entityId, patch) {
      const found = locateContent(collection, entityId)
      if (!found) return null

      applyPatch(found.entity, patch)

      return found.entity
    }

    function copyContent(collection, entityId, prefix) {
      const found = locateContent(collection, entityId)
      if (!found) return null

      return insertInto(
        found.campaign[collection],
        found.index + 1,
        entities.duplicateContent(found.entity, prefix),
      )
    }

    return {
      campaigns,
      activeCampaignId,
      selectedCampaignId,

      activeCampaign,
      selectedCampaign,
      campaignById,
      chapters,
      quests,
      players,
      places,
      items,
      clues,
      chapterById,
      questById,
      playerById,
      placeById,
      itemById,
      clueById,
      questsOfChapter,
      chapterOfQuest,
      playerView,

      createCampaign,
      updateCampaign,
      duplicateCampaign,
      importCampaign,
      deleteCampaign,
      selectCampaign,
      setActiveCampaign,

      createChapter,
      updateChapter,
      completeChapter,
      duplicateChapter,
      deleteChapter,
      moveChapter,

      createQuest,
      updateQuest,
      duplicateQuest,
      deleteQuest,
      moveQuest,
      moveQuestToChapter,

      createPlayer,
      updatePlayer,
      duplicatePlayer,
      deletePlayer,

      createPlace,
      updatePlace,
      duplicatePlace,
      deletePlace,

      createItem,
      updateItem,
      duplicateItem,
      deleteItem,

      createClue,
      updateClue,
      duplicateClue,
      deleteClue,
    }
  },
  { persist: { hydrate: hydrateState } },
)

function hydrateState(saved) {
  const campaigns = Array.isArray(saved.campaigns)
    ? saved.campaigns.map((campaign) => entities.createCampaign(campaign))
    : []

  const knownId = (id) => (campaigns.some((campaign) => campaign.id === id) ? id : null)

  return {
    campaigns,
    activeCampaignId: knownId(saved.activeCampaignId),
    selectedCampaignId: knownId(saved.selectedCampaignId),
  }
}

function applyPatch(target, patch, protectedKeys = []) {
  if (!patch) return target

  Object.entries(patch).forEach(([key, value]) => {
    if (key === 'id' || protectedKeys.includes(key)) return
    target[key] = value
  })

  return target
}

function move(list, fromIndex, toIndex) {
  const target = clamp(toIndex, 0, list.length - 1)
  const [entity] = list.splice(fromIndex, 1)
  list.splice(target, 0, entity)
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function without(ids, removedId) {
  return ids.filter((id) => id !== removedId)
}

function pushInto(list, entity) {
  list.push(entity)

  return list[list.length - 1]
}

function insertInto(list, index, entity) {
  list.splice(index, 0, entity)

  return list[index]
}

function pickByIds(list, ids) {
  return ids.map((id) => list.find((entity) => entity.id === id)).filter(Boolean)
}

function syncQuestLock(quest, wasLocked) {
  const isLocked = Boolean(quest.activationPassword)
  if (isLocked === wasLocked) return

  if (!isLocked && quest.state === 'inactive') quest.state = 'active'
  else if (isLocked && quest.state === 'active') quest.state = 'inactive'
}

function activateNextChapter({ campaign, index }) {
  const next = campaign.chapters[index + 1]
  if (next?.state === 'inactive') next.state = 'active'
}

function abandonUnresolvedQuests(chapter) {
  chapter.quests.forEach((quest) => {
    if (quest.state !== 'completed') quest.state = 'abandoned'
  })
}

function eachQuest(campaign, callback) {
  campaign.chapters.forEach((chapter) => chapter.quests.forEach(callback))
}
