<script setup>
import { ref, watchEffect } from 'vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close'])

const dialog = ref(null)

watchEffect(
  () => {
    const element = dialog.value
    if (!element) return

    if (props.open && !element.open) element.showModal()
    if (!props.open && element.open) element.close()
  },
  { flush: 'post' },
)
</script>

<template>
  <dialog ref="dialog" class="modal" @close="emit('close')">
    <div class="modal-box bg-black/90 backdrop-blur-sm border-2 border-amber-500/40 text-amber-500">
      <h3 v-if="title" class="text-lg font-bold mb-4 text-amber-500 font-['Cinzel']">
        {{ title }}
      </h3>
      <slot />
    </div>
    <form method="dialog" class="modal-backdrop">
      <button type="submit" class="sr-only cursor-pointer">Fermer</button>
    </form>
  </dialog>
</template>
