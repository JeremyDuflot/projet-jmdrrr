const PREFIX = 'rpg'

function storageKey(name) {
  return `${PREFIX}:${name}`
}

export function readStorage(name, fallback = null) {
  try {
    const raw = localStorage.getItem(storageKey(name))
    return raw === null ? fallback : JSON.parse(raw)
  } catch (error) {
    console.warn(`[storage] lecture impossible de "${name}"`, error)
    return fallback
  }
}

export function writeStorage(name, value) {
  try {
    localStorage.setItem(storageKey(name), JSON.stringify(value))
    return true
  } catch (error) {
    console.error(`[storage] écriture impossible de "${name}"`, error)
    return false
  }
}
