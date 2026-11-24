import { Heart } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { readFavoriteIds, writeFavoriteIds } from '../utils/favorite-storage'
import { formatAge, speciesNames } from '../utils/pet-format'

export function PetCard({ pet, showFavoriteButton = true }) {
  const [favorites, setFavorites] = useState(readFavoriteIds)
  const isFavorite = favorites.ids.includes(pet.id)

  function toggleFavorite(event) {
    event.stopPropagation()

    const nextIds = isFavorite
      ? favorites.ids.filter((favoriteId) => favoriteId !== pet.id)
      : [...favorites.ids, pet.id]
    const error = writeFavoriteIds(nextIds)

    if (error) {
      setFavorites((current) => ({ ...current, error }))
      return
    }

    setFavorites({ ids: nextIds, error: '' })
  }

  return (
    <div className="pet-card">
      <Link className="pet-card-link" to={`/pets/${pet.id}`}>
        <div className="pet-card-photo">
          <img
            src={pet.image_url || '/shelter-fallback.svg'}
            alt={`${pet.name}, ${speciesNames[pet.species] || pet.species}`}
          />
          <span className="status-pill">
            {pet.status === 'available' ? 'Siap diadopsi' : 'Sedang diproses'}
          </span>
        </div>
        <div className="pet-card-info">
          <h3>{pet.name}</h3>
          <p>
            {speciesNames[pet.species] || pet.species} · {formatAge(pet.age_months)} ·{' '}
            {pet.sex === 'female' ? 'Betina' : 'Jantan'}
          </p>
        </div>
      </Link>
      {showFavoriteButton && (
        <button
          className={`pet-card-favorite${isFavorite ? ' is-favorite' : ''}`}
          type="button"
          aria-label={isFavorite ? `Hapus ${pet.name} dari favorit` : `Tambahkan ${pet.name} ke favorit`}
          aria-pressed={isFavorite}
          onClick={toggleFavorite}
        >
          <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} aria-hidden="true" />
        </button>
      )}
      {favorites.error && <p className="pet-card-favorite-error" role="alert">{favorites.error}</p>}
    </div>
  )
}
