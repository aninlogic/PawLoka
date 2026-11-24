const favoriteStorageKey = 'pawloka:favorites'

export function readFavoriteIds() {
  try {
    const storedFavorites = window.localStorage.getItem(favoriteStorageKey)
    if (!storedFavorites) return { ids: [], error: '' }

    const ids = JSON.parse(storedFavorites)
    if (!Array.isArray(ids) || ids.some((id) => typeof id !== 'string')) {
      return { ids: [], error: 'Data favorit di perangkat tidak dapat dibaca.' }
    }

    return { ids, error: '' }
  } catch {
    return { ids: [], error: 'Penyimpanan favorit di perangkat tidak dapat diakses.' }
  }
}

export function writeFavoriteIds(ids) {
  try {
    window.localStorage.setItem(favoriteStorageKey, JSON.stringify(ids))
    return ''
  } catch {
    return 'Favorit belum dapat disimpan di perangkat ini.'
  }
}
