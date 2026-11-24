import { ArrowRight, Heart, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchPets } from '../api/client'
import { PetCard } from '../components/PetCard'

export function HomePage() {
  const [result, setResult] = useState({ status: 'loading', pets: [] })

  useEffect(() => {
    const controller = new AbortController()
    fetchPets({ status: 'available' }, { signal: controller.signal })
      .then((items) => setResult({ status: 'success', pets: items.slice(0, 3) }))
      .catch(() => {
        if (!controller.signal.aborted) setResult({ status: 'error', pets: [] })
      })
    return () => controller.abort()
  }, [])

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <Sparkles size={16} aria-hidden="true" />
            Teman baru, cerita baru
          </span>
          <h1>Rumah hangat dimulai dari satu pertemuan</h1>
          <p>
          </p>
          <div className="hero-actions">
            <Link className="button-primary" to="/pets">
              Cari temanmu <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link className="text-link" to="/adoption">Cara adopsi</Link>
          </div>
        </div>
        <div className="hero-visual">
          <span className="hero-sparkle" aria-hidden="true">✳</span>
          <div className="hero-photo-wrap">
            <img
              className="hero-photo"
              src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1100&q=88"
              alt="Anjing Golden Retriever yang ramah"
            />
          </div>
          <div className="hero-sticker">
            <Heart size={20} fill="currentColor" aria-hidden="true" />
            <span>Adopsi<br />penuh cinta</span>
          </div>
        </div>
      </section>

      <section className="page-section" aria-labelledby="featured-heading">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Kenalan yuk</span>
            <h2 id="featured-heading">Mereka menunggumu</h2>
          </div>
          <Link className="text-link" to="/pets">
            Lihat semua <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
        {result.status === 'error' ? (
          <div className="error-card" role="alert">
            <p>Hewan pilihan belum dapat dimuat, coba buka katalog atau periksa koneksi</p>
            <Link className="text-link" to="/pets">Buka katalog</Link>
          </div>
        ) : result.status === 'loading' ? (
          <div className="loading-state" role="status">Memuat hewan yang tersedia...</div>
        ) : result.pets.length > 0 ? (
          <div className="pet-grid">
            {result.pets.map((pet) => <PetCard key={pet.id} pet={pet} />)}
          </div>
        ) : (
          <div className="empty-card">
            <p>Belum ada hewan yang tersedia saat ini.</p>
            <Link className="text-link" to="/pets">Lihat katalog</Link>
          </div>
        )}
      </section>
    </>
  )
}
