<script setup>
import { ref, computed } from 'vue'
import { Pencil } from '@lucide/vue'

const props = defineProps({
  currentHp: {
    type: Number,
    required: true,
  },
  maxHp: {
    type: Number,
    required: true,
  },
  editable: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['updateHp'])

const isEditing = ref(false)
const hp = ref(props.currentHp)

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

/**
 * @param {number} amount
 */
function adjustHp(amount) {
  const newValue = hp.value + amount
  if (newValue >= 0 && newValue <= props.maxHp) {
    hp.value = newValue
  }
}

function handleHpInput() {
  if ((typeof hp.value === 'string' && hp.value === '') || Number.isNaN(hp.value)) {
    hp.value = 0
  } else if (hp.value < 0) {
    hp.value = 0
  } else if (hp.value > props.maxHp) {
    hp.value = props.maxHp
  }
}

/**
 * @param {KeyboardEvent} event
 */
function preventInvalidKeys(event) {
  if (event.key === 'e' || event.key === 'E' || event.key === '-' || event.key === '+') {
    event.preventDefault()
  }
}

function saveHp() {
  if ((typeof hp.value === 'string' && hp.value === '') || Number.isNaN(hp.value)) {
    hp.value = 0
  }
  emit('updateHp', hp.value)
  isEditing.value = false
}
</script>

<template>
  <div class="w-full">
    <div class="flex justify-between mb-1 items-center">
      <span class="font-bold">Points de vie</span>
      <div class="flex items-center gap-2">
        <span class="font-bold">{{ currentHp }} / {{ maxHp }}</span>
        <button
          v-if="editable"
          @click="isEditing = true"
          class="btn btn-xs btn-ghost btn-circle"
          title="Modifier les points de vie"
        >
          <Pencil :size="16" />
        </button>
      </div>
    </div>
    <progress
      class="progress w-full"
      :class="healthColor"
      :value="currentHp"
      :max="maxHp"
    ></progress>

    <!-- édition des points de vie -->
    <div v-if="editable" v-show="isEditing" class="flex justify-end gap-4 mt-4">
      <div class="flex items-center gap-2">
        <button @click="adjustHp(-10)" class="btn btn-circle btn-sm" :disabled="hp <= 0">-</button>

        <label for="hp-input" class="sr-only">Points de vie</label>
        <input
          id="hp-input"
          v-model.number="hp"
          @input="handleHpInput"
          @keydown="preventInvalidKeys"
          type="number"
          class="input input-bordered w-20 text-center"
          min="0"
          :max="maxHp"
        />

        <button @click="adjustHp(10)" class="btn btn-circle btn-sm" :disabled="hp >= maxHp">
          +
        </button>
      </div>

      <div class="flex gap-2">
        <button @click="isEditing = false" class="btn">Annuler</button>
        <button @click="saveHp" class="btn btn-primary">Valider</button>
      </div>
    </div>
  </div>
</template>
