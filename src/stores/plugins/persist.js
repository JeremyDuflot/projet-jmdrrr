import { isStorageAvailable, readStorage, removeStorage, writeStorage } from '@/utils/storage'

const WRITE_DELAY_MS = 150

export function persistPlugin({ store, options }) {
  const config = normalizeConfig(options.persist)
  if (!config) return

  const key = config.key ?? store.$id
  const available = isStorageAvailable()

  if (available) {
    const saved = readStorage(key)
    if (saved && typeof saved === 'object') {
      store.$patch(pickKnownKeys(saved, Object.keys(store.$state), config.paths))
    }
  } else {
    console.warn(`[persist] localStorage indisponible : "${key}" ne sera pas sauvegardé.`)
  }

  let timer = null
  store.$subscribe(
    (_mutation, state) => {
      if (!available) return
      clearTimeout(timer)
      timer = setTimeout(() => {
        writeStorage(key, pickKnownKeys(state, Object.keys(state), config.paths))
      }, WRITE_DELAY_MS)
    },
    { detached: true },
  )

  return {
    $persistKey: key,
    $clearPersistedState: () => removeStorage(key),
  }
}

function normalizeConfig(persist) {
  if (!persist) return null
  return persist === true ? {} : persist
}

function pickKnownKeys(source, knownKeys, paths) {
  const allowed = paths ? knownKeys.filter((key) => paths.includes(key)) : knownKeys

  return allowed.reduce((result, key) => {
    if (source[key] !== undefined) result[key] = source[key]
    return result
  }, {})
}
