import { useEffect, useState } from 'react'
import { fetchShelters } from '../api/client'
import { ShelterCard } from '../components/ShelterCard'

export function ShelterDirectoryPage() {
  const [result, setResult] = useState({ status: 'loading', shelters: [], error: '' })
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    fetchShelters({ signal: controller.signal })
      .then((shelters) => setResult({ status: 'success', shelters, error: '' }))
      .catch(() => {
        if (!controller.signal.aborted) {
          setResult({
            status: 'error',
            shelters: [],
            error: 'Direktori belum dapat dimuat. Periksa koneksi, lalu coba lagi.',
          })
        }
      })
    return () => controller.abort()
  }, [retry])

  return (
    <section className="page-main">
      <div className="page-intro">
        <div>
          <span className="eyebrow">Tempat bertumbuhnya harapan</span>
          <h1>Kenali shelter di dekatmu</h1>
          <p>Temukan cerita dan informasi kontak tempat yang merawat mereka.</p>
        </div>
      </div>
      {result.status === 'loading' ? (
        <div className="loading-state" role="status">Memuat direktori shelter...</div>
      ) : result.status === 'error' ? (
        <div className="error-card" role="alert">
          <p>{result.error}</p>
          <button className="button-secondary" type="button" onClick={() => setRetry((value) => value + 1)}>
            Coba lagi
          </button>
        </div>
      ) : result.shelters.length ? (
        <div className="shelter-grid">
          {result.shelters.map((shelter) => <ShelterCard key={shelter.id} shelter={shelter} />)}
        </div>
      ) : (
        <div className="empty-card">Informasi shelter akan segera tersedia.</div>
      )}
    </section>
  )
}
