import { readonly, ref } from 'vue'
import { readStorage, writeStorage } from '@/utils/storage'

const WRITE_DELAY_MS = 150

export function persistPlugin({ store, options }) {
  if (!options.persist) return

  const config = options.persist === true ? {} : options.persist
  const key = config.key ?? store.$id
  const failed = ref(false)

  const saved = readStorage(key)
  if (saved && typeof saved === 'object') {
    const state = config.hydrate ? config.hydrate(saved) : saved
    store.$patch(pickKnownKeys(state, Object.keys(store.$state)))
  }

  let timer = null

  const save = () => {
    clearTimeout(timer)
    timer = null
    failed.value = !writeStorage(key, store.$state)
  }

  store.$subscribe(
    () => {
      clearTimeout(timer)
      timer = setTimeout(save, WRITE_DELAY_MS)
    },
    { detached: true },
  )

  window.addEventListener('pagehide', save)

  return { persistenceFailed: readonly(failed) }
}

function pickKnownKeys(source, knownKeys) {
  return knownKeys.reduce((result, key) => {
    if (source[key] !== undefined) result[key] = source[key]
    return result
  }, {})
}
