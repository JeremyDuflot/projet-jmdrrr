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
})

const emit = defineEmits(['updateHp'])

const isEditing = ref(false)
const tempHp = ref(props.currentHp)

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

function openEditModal() {
  tempHp.value = props.currentHp
  isEditing.value = true
}

function closeEditModal() {
  isEditing.value = false
}

function adjustHp(amount) {
  const newValue = tempHp.value + amount
  if (newValue >= 0 && newValue <= props.maxHp) {
    tempHp.value = newValue
  }
}

function saveHp() {
  emit('updateHp', tempHp.value)
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
          @click="openEditModal"
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

    <!-- Modal d'édition HP -->
    <dialog class="modal" :class="{ 'modal-open': isEditing }">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Modifier les points de vie</h3>

        <div class="flex items-center gap-4 mb-4">
          <button @click="adjustHp(-10)" class="btn btn-circle btn-sm" :disabled="tempHp <= 0">
            -
          </button>

          <input
            v-model.number="tempHp"
            type="number"
            class="input input-bordered w-24 text-center"
            min="0"
            :max="maxHp"
          />

          <button @click="adjustHp(10)" class="btn btn-circle btn-sm" :disabled="tempHp >= maxHp">
            +
          </button>
        </div>

        <div class="modal-action">
          <button @click="closeEditModal" class="btn">Annuler</button>
          <button @click="saveHp" class="btn btn-primary">Valider</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="closeEditModal">close</button>
      </form>
    </dialog>
  </div>
</template>
