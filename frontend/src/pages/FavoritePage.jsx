import { Heart, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchPet } from '../api/client'
import { PetCard } from '../components/PetCard'
import { readFavoriteIds, writeFavoriteIds } from '../utils/favorite-storage'

export function FavoritePage() {
  const [favorites, setFavorites] = useState(readFavoriteIds)
  const [retryKey, setRetryKey] = useState(0)
  const [result, setResult] = useState({
    requestKey: '',
    pets: [],
    unavailableIds: [],
    error: '',
  })
  const favoritesKey = JSON.stringify(favorites.ids)
  const requestKey = `${favoritesKey}:${retryKey}`
  const hasCurrentResult = result.requestKey === requestKey
  const loading = !favorites.error && favorites.ids.length > 0 && !hasCurrentResult

  useEffect(() => {
    if (favorites.error || favorites.ids.length === 0) return undefined

    const controller = new AbortController()
    Promise.allSettled(
      favorites.ids.map((id) => fetchPet(id, { signal: controller.signal })),
    ).then((responses) => {
      if (controller.signal.aborted) return

      const pets = []
      const unavailableIds = []
      let error = ''

      responses.forEach((response, index) => {
        if (response.status === 'fulfilled') {
          pets.push(response.value)
        } else if (response.reason?.response?.status === 404) {
          unavailableIds.push(favorites.ids[index])
        } else {
          error = 'Favorite belum dapat dimuat. Periksa koneksi, lalu coba lagi.'
        }
      })

      setResult({ requestKey, pets, unavailableIds, error })
    })

    return () => controller.abort()
  }, [favorites.error, favorites.ids, requestKey])

  function removeFavorite(id) {
    const nextIds = favorites.ids.filter((favoriteId) => favoriteId !== id)
    const error = writeFavoriteIds(nextIds)

    if (error) {
      setFavorites((current) => ({ ...current, error }))
      return
    }

    setFavorites({ ids: nextIds, error: '' })
  }

  const pets = hasCurrentResult ? result.pets : []
  const unavailableIds = hasCurrentResult ? result.unavailableIds : []
  const error = favorites.error || (hasCurrentResult ? result.error : '')

  return (
    <section className="page-main">
      <div className="page-intro">
        <div>
          <span className="eyebrow"><Heart size={16} aria-hidden="true" /> Simpan yang menarik</span>
          <h1>Favorite</h1>
          <p>Hewan yang Anda tandai tersimpan di perangkat ini.</p>
        </div>
      </div>

      {error && (
        <div className="error-card" role="alert">
          <p>{error}</p>
          {!favorites.error && (
            <button
              className="button-secondary"
              type="button"
              onClick={() => setRetryKey((current) => current + 1)}
            >
              Coba lagi
            </button>
          )}
        </div>
      )}

      {loading && <div className="loading-state" role="status">Memuat Favorite...</div>}

      {!loading && !error && favorites.ids.length === 0 && (
        <div className="empty-card favorite-empty">
          <Heart size={34} aria-hidden="true" />
          <h2>Belum ada hewan Favorite</h2>
          <p>Simpan hewan yang menarik agar mudah ditemukan kembali.</p>
          <Link className="button-primary" to="/pets">Jelajahi Hewan</Link>
        </div>
      )}

      {!loading && (pets.length > 0 || unavailableIds.length > 0) && (
        <div className="pet-grid">
          {pets.map((pet) => (
            <article className="favorite-pet-item" key={pet.id}>
              <PetCard pet={pet} showFavoriteButton={false} />
              <button
                className="button-secondary favorite-remove-button"
                type="button"
                aria-label={`Hapus ${pet.name} dari Favorite`}
                onClick={() => removeFavorite(pet.id)}
              >
                <Trash2 size={16} aria-hidden="true" /> Hapus
              </button>
            </article>
          ))}
          {unavailableIds.map((id) => (
            <article className="empty-card favorite-pet-unavailable" key={id}>
              <p>Hewan Favorite ini sudah tidak tersedia di katalog.</p>
              <button
                className="button-secondary favorite-remove-button"
                type="button"
                aria-label="Hapus hewan yang tidak tersedia dari Favorite"
                onClick={() => removeFavorite(id)}
              >
                <Trash2 size={16} aria-hidden="true" /> Hapus
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
