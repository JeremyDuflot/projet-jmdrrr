<script setup>
const props = defineProps({
  /** Selected entity ids. */
  modelValue: {
    type: Array,
    default: () => [],
  },
  /** Entities to choose from, each with an id and a name. */
  entities: {
    type: Array,
    default: () => [],
  },
  label: {
    type: String,
    default: '',
  },
  emptyText: {
    type: String,
    default: 'Rien à sélectionner.',
  },
})

const emit = defineEmits(['update:modelValue'])

// Props are read-only, so every change emits a brand new array.
function toggle(id) {
  const next = props.modelValue.includes(id)
    ? props.modelValue.filter((selectedId) => selectedId !== id)
    : [...props.modelValue, id]

  emit('update:modelValue', next)
}
</script>

<template>
  <fieldset class="w-full mb-3">
    <legend class="label-text">{{ label }}</legend>

    <p v-if="entities.length === 0" class="text-sm text-base-content/60 italic">
      {{ emptyText }}
    </p>

    <template v-else>
      <div class="max-h-40 overflow-y-auto rounded-box border border-base-300 p-2">
        <label
          v-for="entity in entities"
          :key="entity.id"
          class="flex items-center gap-2 py-1 cursor-pointer"
        >
          <input
            type="checkbox"
            class="checkbox checkbox-sm"
            :checked="modelValue.includes(entity.id)"
            @change="toggle(entity.id)"
          />
          <span>{{ entity.name }}</span>
        </label>
      </div>

      <p class="text-sm text-base-content/60 mt-1">{{ modelValue.length }} sélectionné(s)</p>
    </template>
  </fieldset>
</template>
