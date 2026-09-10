import { readStorage, writeStorage } from '@/utils/storage'

const WRITE_DELAY_MS = 150

export function persistPlugin({ store, options }) {
  if (!options.persist) return

  const key = options.persist.key ?? store.$id

  const saved = readStorage(key)
  if (saved && typeof saved === 'object') {
    store.$patch(pickKnownKeys(saved, Object.keys(store.$state)))
  }

  let timer = null
  store.$subscribe(
    (_mutation, state) => {
      clearTimeout(timer)
      timer = setTimeout(() => writeStorage(key, state), WRITE_DELAY_MS)
    },
    { detached: true },
  )
}

function pickKnownKeys(source, knownKeys) {
  return knownKeys.reduce((result, key) => {
    if (source[key] !== undefined) result[key] = source[key]
    return result
  }, {})
}
