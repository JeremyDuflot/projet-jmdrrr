<script setup>
import { faker } from '@faker-js/faker'

/** @returns {Campaign} */
function createCampaign() {
  return {
    id: crypto.randomUUID(),
    name: faker.book.title(),
    state: 'active',
    chapters: [
      {
        name: faker.book.title(),
        state: 'completed',
        description: faker.lorem.text(),
        comment: faker.lorem.sentence(),
        password: faker.word.words(),
        resolutionItems: [
          {
            name: faker.word.words(),
            description: faker.lorem.text(),
            comment: faker.lorem.sentence(),
          },
        ],
        rewards: {
          clues: [
            {
              name: faker.word.words(),
              description: faker.lorem.text(),
              comment: faker.lorem.sentence(),
            },
          ],
          items: [
            {
              name: faker.word.words(),
              description: faker.lorem.text(),
              comment: faker.lorem.sentence(),
            },
          ],
        },
      },
    ],
    comment: faker.lorem.sentence(),
    players: [
      {
        name: faker.person.firstName(),
        state: 'alive',
        comment: faker.lorem.sentence(),
        description: faker.lorem.text(),
        currentHp: 100,
        maxHp: 150,
        inventory: {
          clues: [
            {
              name: faker.word.words(),
              description: faker.lorem.text(),
              comment: faker.lorem.sentence(),
            },
          ],
          items: [
            {
              name: faker.word.words(),
              description: faker.lorem.text(),
              comment: faker.lorem.sentence(),
            },
          ],
        },
        place: {
          name: faker.location.city(),
          description: faker.lorem.text(),
          comment: faker.lorem.sentence(),
        },
      },
    ],
    description: faker.lorem.text(),
  }
}

/** @type {Campaign[]} */
const arrayOfFakeData = Array.from({ length: 20 }, createCampaign)
</script>

<template>
  <div class="m-2">
    <div
      v-for="campaign in arrayOfFakeData"
      :key="campaign.id"
      class="collapse collapse-arrow bg-base-100 border border-base-300 mb-2 hover:bg-base-200 hover:border-base-content/20 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      <input type="checkbox" :id="'my-campaign-' + campaign.id" />
      <h2 class="collapse-title font-extrabold">{{ campaign.name }}</h2>
      <div class="collapse-content font-bold">
        <p class="mb-2">{{ campaign.description }}</p>
        <div class="flex justify-end">
          <button class="btn btn-primary">See more</button>
        </div>
      </div>
    </div>
  </div>
</template>
