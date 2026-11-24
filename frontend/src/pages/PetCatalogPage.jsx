import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { fetchPets } from '../api/client'
import { PetCard } from '../components/PetCard'
import { speciesOptions } from '../utils/pet-format'

export function PetCatalogPage() {
  const [filters, setFilters] = useState({ q: '', species: 'all', status: 'available', age: 'all' })
  const [requestId, setRequestId] = useState(0)
  const [result, setResult] = useState({ requestId: -1, status: 'loading', pets: [], error: '' })

  useEffect(() => {
    const controller = new AbortController()
    fetchPets(filters, { signal: controller.signal })
      .then((pets) => setResult({ requestId, status: 'success', pets, error: '' }))
      .catch(() => {
        if (!controller.signal.aborted) {
          setResult({
            requestId,
            status: 'error',
            pets: [],
            error: 'Katalog belum dapat dimuat. Periksa koneksi, lalu coba lagi.',
          })
        }
      })
    return () => controller.abort()
  }, [filters, requestId])

  function updateFilter(event) {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
    setRequestId((current) => current + 1)
  }

  const loading = result.requestId !== requestId || result.status === 'loading'
  const pets = result.pets

  return (
    <section className="page-main">
      <div className="page-intro">
        <div>
          <span className="eyebrow">Sahabat terbaikmu</span>
          <h1>Temukan teman baru</h1>
          <p>
            Setiap profil punya cerita. Temukan yang paling cocok untuk memulai
            cerita barumu.
          </p>
        </div>
      </div>

      <div className="catalog-controls" aria-label="Cari dan filter hewan">
        <label className="field-control search-control">
          <Search size={19} aria-hidden="true" />
          <span className="visually-hidden">Cari nama atau ras</span>
          <input
            name="q"
            type="search"
            value={filters.q}
            onChange={updateFilter}
            placeholder="Cari nama atau ras..."
          />
        </label>
        <label className="field-control">
          <span className="visually-hidden">Jenis hewan</span>
          <select name="species" value={filters.species} onChange={updateFilter}>
            <option value="all">Semua jenis</option>
            {speciesOptions.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="field-control">
          <span className="visually-hidden">Status adopsi</span>
          <select name="status" value={filters.status} onChange={updateFilter}>
            <option value="all">Semua status</option>
            <option value="available">Siap diadopsi</option>
            <option value="reserved">Sedang diproses</option>
            <option value="adopted">Sudah menemukan rumah</option>
          </select>
        </label>
        <label className="field-control">
          <span className="visually-hidden">Usia hewan</span>
          <select name="age" value={filters.age} onChange={updateFilter}>
            <option value="all">Semua usia</option>
            <option value="young">Anak (0–12 bulan)</option>
            <option value="adult">Dewasa (13+ bulan)</option>
          </select>
        </label>
      </div>

      <p className="catalog-meta" aria-live="polite">
        {loading ? 'Memuat teman-teman...' : `${pets.length} hewan ditemukan`}
      </p>

      {result.status === 'error' && !loading ? (
        <div className="error-card" role="alert">
          <p>{result.error}</p>
          <button
            className="button-secondary"
            type="button"
            onClick={() => setRequestId((key) => key + 1)}
          >
            Coba lagi
          </button>
        </div>
      ) : loading ? (
        <div className="pet-grid" aria-label="Memuat katalog">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      ) : pets.length ? (
        <div className="pet-grid">
          {pets.map((pet) => <PetCard key={pet.id} pet={pet} />)}
        </div>
      ) : (
        <div className="empty-card">
          <p>Belum ada hewan yang cocok dengan pilihanmu.</p>
          <button
            className="button-secondary"
            type="button"
            onClick={() => {
              setFilters({ q: '', species: 'all', status: 'all', age: 'all' })
              setRequestId((key) => key + 1)
            }}
          >
            Hapus filter
          </button>
        </div>
      )}
    </section>
  )
}
