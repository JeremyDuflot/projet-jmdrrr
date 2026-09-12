<script setup>
import { ref, computed } from 'vue'
import { Pencil, Check, X } from '@lucide/vue'

const props = defineProps({
  currentHp: { type: Number, required: true },
  maxHp: { type: Number, required: true },
  editable: { type: Boolean, default: false },
  showLabel: { type: Boolean, default: true },
})

const emit = defineEmits(['updateHp'])

const isEditing = ref(false)
const hp = ref(props.currentHp)

const displayedHp = computed(() => (isEditing.value ? hp.value : props.currentHp))

const healthPercentage = computed(() => {
  if (props.maxHp <= 0) return 0
  return Math.round((displayedHp.value / props.maxHp) * 100)
})

const healthColor = computed(() => {
  const percentage = healthPercentage.value
  if (percentage > 50) return 'progress-success'
  if (percentage > 25) return 'progress-warning'
  return 'progress-error'
})

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

function preventInvalidKeys(event) {
  if (event.key === '.' || event.key === ',' || event.key === '-' || event.key === '+') {
    event.preventDefault()
  }
}

function startEditing() {
  hp.value = props.currentHp
  isEditing.value = true
}

function cancelEditing() {
  isEditing.value = false
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
    <span v-if="showLabel" class="font-bold block mb-1 text-amber-500 font-['Cinzel']">Points de vie</span>

    <div v-if="!isEditing" class="flex items-center gap-2">
      <span class="font-bold text-white/80">{{ currentHp }} / {{ maxHp }}</span>
      <button
        v-if="editable"
        type="button"
        @click="startEditing"
        class="btn btn-xs btn-ghost btn-circle text-white/80"
        title="Modifier les points de vie"
      >
        <Pencil :size="16" />
      </button>
    </div>

    <div v-else class="flex items-center gap-0.5 flex-wrap text-white/80">
      <button
        type="button"
        @click="adjustHp(-10)"
        class="btn btn-circle btn-xs bg-transparent border-none shadow-none text-white/80 hover:bg-amber-500/20 text-[10px] min-h-0 h-6 w-6 p-0"
        :disabled="hp <= 0"
        title="-10"
      >
        -10
      </button>
      <button
        type="button"
        @click="adjustHp(-1)"
        class="btn btn-circle btn-xs bg-transparent border-none shadow-none text-white/80 hover:bg-amber-500/20 text-base min-h-0 h-6 w-6 p-0"
        :disabled="hp <= 0"
        title="-1"
      >
        -
      </button>

      <label for="hp-input" class="sr-only">Points de vie</label>
      <input
        id="hp-input"
        v-model.number="hp"
        @input="handleHpInput"
        @keydown="preventInvalidKeys"
        type="number"
        class="input input-xs w-12 text-center text-base font-bold bg-transparent border-none shadow-none text-gray-200 px-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        min="0"
        :max="maxHp"
      />

      <button
        type="button"
        @click="adjustHp(1)"
        class="btn btn-circle btn-xs bg-transparent border-none shadow-none text-white/80 hover:bg-amber-500/20 text-base min-h-0 h-6 w-6 p-0"
        :disabled="hp >= maxHp"
        title="+1"
      >
        +
      </button>
      <button
        type="button"
        @click="adjustHp(10)"
        class="btn btn-circle btn-xs bg-transparent border-none shadow-none text-white/80 hover:bg-amber-500/20 text-[10px] min-h-0 h-6 w-6 p-0"
        :disabled="hp >= maxHp"
        title="+10"
      >
        +10
      </button>

      <button
        type="button"
        @click="saveHp"
        class="btn btn-circle btn-xs btn-ghost text-success min-h-0 h-6 w-6 p-0 ml-1"
        title="Valider"
      >
        <Check :size="16" />
      </button>
      <button
        type="button"
        @click="cancelEditing"
        class="btn btn-circle btn-xs btn-ghost text-error min-h-0 h-6 w-6 p-0"
        title="Annuler"
      >
        <X :size="16" />
      </button>
    </div>

    <progress
      class="progress w-full"
      :class="healthColor"
      :value="displayedHp"
      :max="maxHp"
    ></progress>
  </div>
</template>
