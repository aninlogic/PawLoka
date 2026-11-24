import { ArrowLeft, ArrowRight, Heart, MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchPet } from '../api/client'
import { readFavoriteIds, writeFavoriteIds } from '../utils/favorite-storage'
import { formatAge, speciesNames } from '../utils/pet-format'

const descriptionPreviewLimit = 240

const sexNames = {
  female: 'Betina',
  male: 'Jantan',
}

const statusNames = {
  adopted: 'Sudah menemukan rumah',
  available: 'Siap diadopsi',
  reserved: 'Sedang diproses',
}

export function PetDetailPage() {
  const { id } = useParams()
  const [result, setResult] = useState({ id: null, status: 'loading', pet: null, error: '' })
  const [favorites, setFavorites] = useState(readFavoriteIds)
  const [expandedDescriptionId, setExpandedDescriptionId] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    fetchPet(id, { signal: controller.signal })
      .then((pet) => setResult({ id, status: 'success', pet, error: '' }))
      .catch((requestError) => {
        if (!controller.signal.aborted) {
          const error = requestError.response?.status === 404
            ? 'Hewan tidak ditemukan.'
            : 'Detail hewan belum dapat dimuat. Coba lagi sebentar.'
          setResult({ id, status: 'error', pet: null, error })
        }
      })
    return () => controller.abort()
  }, [id])

  const loading = result.id !== id || result.status === 'loading'
  const pet = result.pet
  const descriptionExpanded = expandedDescriptionId === id

  if (loading) {
    return <section className="page-main loading-state" role="status">Memuat detail hewan...</section>
  }

  if (result.error || !pet) {
    return (
      <section className="page-main">
        <div className="error-card" role="alert">
          <p>{result.error || 'Hewan tidak ditemukan.'}</p>
          <Link className="text-link" to="/pets"><ArrowLeft size={17} /> Kembali ke katalog</Link>
        </div>
      </section>
    )
  }

  const shelter = pet.shelter
  const speciesName = speciesNames[pet.species] || pet.species
  const statusName = statusNames[pet.status] || 'Status belum tersedia'
  const sexName = sexNames[pet.sex]
  const breed = typeof pet.breed === 'string' ? pet.breed.trim() : ''
  const description = typeof pet.description === 'string' ? pet.description.trim() : ''
  const hasLongDescription = description.length > descriptionPreviewLimit
  const visibleDescription = hasLongDescription && !descriptionExpanded
    ? `${description.slice(0, descriptionPreviewLimit).trimEnd()}…`
    : description
  const isFavorite = favorites.ids.includes(pet.id)
  const petFacts = [
    breed && { label: 'Ras', value: breed },
    Number.isFinite(pet.age_months)
      && { label: 'Usia', value: formatAge(pet.age_months) },
    sexName && { label: 'Jenis kelamin', value: sexName },
    { label: 'Status', value: statusName },
  ].filter(Boolean)

  function toggleFavorite() {
    const nextIds = isFavorite
      ? favorites.ids.filter((favoriteId) => favoriteId !== pet.id)
      : [...favorites.ids, pet.id]

    const error = writeFavoriteIds(nextIds)
    if (error) {
      setFavorites((current) => ({
        ...current,
        error,
      }))
      return
    }

    setFavorites({ ids: nextIds, error: '' })
  }

  return (
    <section className="page-main">
      <div className="pet-detail">
        <div className="pet-detail-photo">
          <img
            src={pet.image_url || '/shelter-fallback.svg'}
            alt={speciesName ? `${pet.name}, ${speciesName}` : pet.name}
          />
          <div className="pet-detail-photo-actions">
            <Link className="pet-photo-back" to="/pets">
              <ArrowLeft size={17} aria-hidden="true" />
              Kembali ke katalog
            </Link>
            <button
              className={`pet-favorite-button${isFavorite ? ' is-favorite' : ''}`}
              type="button"
              aria-label={isFavorite ? 'Hapus dari favorit' : 'Tambahkan ke favorit'}
              aria-pressed={isFavorite}
              onClick={toggleFavorite}
            >
              <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} aria-hidden="true" />
            </button>
          </div>
          <span className="status-pill">{statusName}</span>
        </div>
        <div className="pet-detail-copy">
          {speciesName && <span className="eyebrow">{speciesName}</span>}
          <h1>{pet.name}</h1>
          {favorites.error && <p className="pet-favorite-error" role="alert">{favorites.error}</p>}
          {petFacts.length > 0 && (
            <div className="pet-facts">
              {petFacts.map(({ label, value }) => (
                <div className="pet-fact" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          )}
          {description && (
            <section className="pet-detail-summary" aria-labelledby="pet-summary-title">
              <h2 id="pet-summary-title">Tentang {pet.name}</h2>
              <p>{visibleDescription}</p>
              {hasLongDescription && (
                <button
                  className="pet-detail-read-more"
                  type="button"
                  aria-expanded={descriptionExpanded}
                  onClick={() => setExpandedDescriptionId(descriptionExpanded ? null : id)}
                >
                  {descriptionExpanded ? 'Tampilkan lebih sedikit' : 'Baca selengkapnya'}
                </button>
              )}
            </section>
          )}
          {shelter && (shelter.name || shelter.location || shelter.id) && (
            <div className="shelter-callout">
              {shelter.name && <strong>{shelter.name}</strong>}
              {shelter.location && (
                <p><MapPin size={15} aria-hidden="true" /> {shelter.location}</p>
              )}
              {shelter.id && (
                <Link className="text-link" to={`/shelters/${shelter.id}`}>
                  Lihat shelter
                </Link>
              )}
            </div>
          )}
          {pet.status === 'available' ? (
            <Link
              className="button-primary pet-detail-adoption"
              to={`/apply/${encodeURIComponent(pet.id)}`}
            >
              Ajukan Adopsi <ArrowRight size={17} aria-hidden="true" />
            </Link>
          ) : (
            <button className="button-primary pet-detail-adoption" type="button" disabled>
              {statusName}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
