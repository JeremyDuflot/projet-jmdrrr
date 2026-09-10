<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentHp: {
    type: Number,
    required: true,
  },
  maxHp: {
    type: Number,
    required: true,
  },
})

const healthPercentage = computed(() => {
  if (props.maxHp <= 0) return 0
  return Math.round((props.currentHp / props.maxHp) * 100)
})

const healthColor = computed(() => {
  const percentage = healthPercentage.value
  if (percentage > 50) return 'progress-success'
  if (percentage > 25) return 'progress-warning'
  return 'progress-error'
})
</script>

<template>
  <div class="w-full">
    <div class="flex justify-between mb-1">
      <span class="text-sm font-medium">Points de vie</span>
      <span class="text-sm font-medium">{{ currentHp }} / {{ maxHp }}</span>
    </div>
    <progress
      class="progress w-full"
      :class="healthColor"
      :value="currentHp"
      :max="maxHp"
    ></progress>
  </div>
</template>
