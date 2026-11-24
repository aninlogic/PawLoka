import { ArrowUpRight, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

export function ShelterCard({ shelter }) {
  return (
    <Link className="shelter-card" to={`/shelters/${shelter.id}`}>
      <div className="shelter-card-image">
        <img src={shelter.image_url || '/shelter-fallback.svg'} alt={`Suasana ${shelter.name}`} />
        <span className="shelter-pet-count">Lihat shelter</span>
      </div>
      <div className="shelter-card-copy">
        <h2>{shelter.name}</h2>
        <p><MapPin size={16} aria-hidden="true" /> {shelter.location}</p>
        <ArrowUpRight size={20} className="shelter-arrow" aria-hidden="true" />
      </div>
    </Link>
  )
}
