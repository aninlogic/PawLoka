import { ArrowLeft, Mail, MapPin, Phone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchShelter } from '../api/client'
import { PetCard } from '../components/PetCard'

export function ShelterDetailPage() {
  const { id } = useParams()
  const [result, setResult] = useState({ id: null, status: 'loading', shelter: null, error: '' })

  useEffect(() => {
    const controller = new AbortController()
    fetchShelter(id, { signal: controller.signal })
      .then((shelter) => setResult({ id, status: 'success', shelter, error: '' }))
      .catch((requestError) => {
        if (!controller.signal.aborted) {
          setResult({
            id,
            status: 'error',
            shelter: null,
            error: requestError.response?.status === 404
              ? 'Shelter tidak ditemukan.'
              : 'Detail shelter belum dapat dimuat. Coba lagi.',
          })
        }
      })
    return () => controller.abort()
  }, [id])

  if (result.id !== id || result.status === 'loading') {
    return <section className="page-main loading-state" role="status">Memuat detail shelter...</section>
  }

  if (result.error || !result.shelter) {
    return (
      <section className="page-main">
        <div className="error-card" role="alert">
          <p>{result.error || 'Shelter tidak ditemukan.'}</p>
          <Link className="text-link" to="/shelters"><ArrowLeft size={17} /> Kembali ke direktori</Link>
        </div>
      </section>
    )
  }

  const shelter = result.shelter

  return (
    <section className="page-main">
      <Link className="text-link" to="/shelters"><ArrowLeft size={17} /> Kembali ke direktori</Link>
      <div className="shelter-detail">
        <img className="shelter-detail-image" src={shelter.image_url || '/shelter-fallback.svg'} alt={`Suasana ${shelter.name}`} />
        <div className="shelter-detail-copy">
          <span className="eyebrow">Tempat penuh kepedulian</span>
          <h1>{shelter.name}</h1>
          <p>{shelter.description}</p>
          <p className="shelter-detail-contact"><MapPin size={18} /> {shelter.location}</p>
          {shelter.phone && (
            <a className="shelter-detail-contact" href={`tel:${shelter.phone.replace(/[^\d+]/g, '')}`}>
              <Phone size={18} /> {shelter.phone}
            </a>
          )}
          {shelter.email && (
            <a className="shelter-detail-contact" href={`mailto:${shelter.email}`}>
              <Mail size={18} /> {shelter.email}
            </a>
          )}
        </div>
      </div>
      <div className="section-heading shelter-pets-heading">
        <div>
          <span className="eyebrow">Kenalan dengan mereka</span>
          <h2>Hewan di shelter ini</h2>
        </div>
      </div>
      {shelter.pets?.length ? (
        <div className="pet-grid">
          {shelter.pets.map((pet) => <PetCard key={pet.id} pet={pet} />)}
        </div>
      ) : (
        <div className="empty-card">Belum ada hewan yang dipublikasikan dari shelter ini.</div>
      )}
    </section>
  )
}
