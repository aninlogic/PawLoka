import { ArrowRight, ClipboardCheck, RotateCw, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchApplication } from '../api/client'
import {
  readApplicationClaims,
  removeApplicationClaim,
} from '../utils/application-history-storage'
import { speciesNames } from '../utils/pet-format'

const statusNames = {
  pending: 'Menunggu Konfirmasi',
  reviewing: 'Sedang Diproses',
  approved: 'Disetujui',
  declined: 'Ditolak',
  closed: 'Ditutup',
}

function formatDate(value) {
  return value
    ? new Date(value).toLocaleDateString('id-ID', { dateStyle: 'long' })
    : 'Tanggal belum tersedia'
}

export function ApplicationsPage() {
  const [records, setRecords] = useState([])
  const [pageStatus, setPageStatus] = useState({
    kind: 'loading',
    message: '',
  })
  const [refreshKey, setRefreshKey] = useState(0)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    let active = true

    async function loadApplications() {
      setPageStatus({ kind: 'loading', message: '' })

      const { claims, error } = readApplicationClaims()

      if (error) {
        if (active) {
          setPageStatus({ kind: 'error', message: error })
        }
        return
      }

      if (!claims.length) {
        if (active) {
          setRecords([])
          setPageStatus({ kind: 'empty', message: '' })
        }
        return
      }

      const results = await Promise.all(
        claims.map(async (claim) => {
          try {
            const application = await fetchApplication(
              claim.id,
              claim.accessToken
            )

            return {
              id: claim.id,
              application,
              error: '',
            }
          } catch (requestError) {
            return {
              id: claim.id,
              application: null,
              error: requestError.response?.status === 404
                ? 'Riwayat ini tidak tersedia. Pengajuan mungkin telah dihapus oleh admin.'
                : 'Status belum dapat dimuat. Periksa koneksi, lalu coba muat ulang.',
            }
          }
        })
      )

      if (active) {
        setRecords(results)
        setPageStatus({ kind: 'success', message: '' })
      }
    }

    loadApplications()

    return () => {
      active = false
    }
  }, [refreshKey])

  function removeFromDevice(id) {
    const error = removeApplicationClaim(id)

    if (error) {
      setActionError(error)
      return
    }

    setActionError('')
    setRefreshKey((key) => key + 1)
  }

  return (
    <section className="page-main applications-page">
      <header className="applications-heading">
        <div>
          <span className="eyebrow">
            <ClipboardCheck size={16} />
            Langkah adopsimu
          </span>

          <h1>Riwayat pengajuan</h1>

          <p>
            Pantau status terbaru pengajuan yang tersimpan di perangkat ini.
          </p>
        </div>

        <Link className="text-link" to="/adoption">
          Baca panduan adopsi <ArrowRight size={17} />
        </Link>
      </header>

      {actionError && (
        <p className="form-error" role="alert">
          {actionError}
        </p>
      )}

      {pageStatus.kind === 'loading' && (
        <div className="loading-state" role="status">
          Memuat riwayat pengajuan...
        </div>
      )}

      {pageStatus.kind === 'error' && (
        <div className="error-card" role="alert">
          <p>{pageStatus.message}</p>

          <button
            className="button-secondary"
            type="button"
            onClick={() => setRefreshKey((key) => key + 1)}
          >
            <RotateCw size={16} /> Coba lagi
          </button>
        </div>
      )}

      {pageStatus.kind === 'empty' && (
        <div className="empty-card applications-empty">
          <h2>Belum ada riwayat di perangkat ini</h2>

          <p>
            Pengajuan yang disimpan dari perangkat ini akan muncul di sini.
          </p>

          <Link className="button-primary" to="/pets">
            Jelajahi Hewan
          </Link>
        </div>
      )}

      {pageStatus.kind === 'success' && records.length > 0 && (
        <div className="application-history-list">
          {records.map(({ id, application, error }) => (
            <article className="application-history-card" key={id}>
              {application?.pet?.id ? (
                <Link
                  className="application-history-image-link"
                  to={`/pets/${encodeURIComponent(application.pet.id)}`}
                  aria-label={`Lihat detail ${application.pet.name || 'hewan'}`}
                >
                  <img
                    src={application.pet.image_url || '/shelter-fallback.svg'}
                    alt={application.pet.name || 'Hewan'}
                  />
                </Link>
              ) : (
                <img
                  src="/shelter-fallback.svg"
                  alt="Hewan"
                />
              )}

              <div className="application-history-details">
                {application ? (
                  <>
                    <span
                      className={`application-status application-status--${application.status}`}
                    >
                      {statusNames[application.status] || 'Status belum tersedia'}
                    </span>

                    {application.pet?.id ? (
                      <Link
                        className="application-history-title-link"
                        to={`/pets/${encodeURIComponent(application.pet.id)}`}
                      >
                        <h2>{application.pet.name || 'Hewan pilihan'}</h2>
                      </Link>
                    ) : (
                      <h2>{application.pet?.name || 'Hewan pilihan'}</h2>
                    )}

                    <p>
                      {application.pet?.species
                        ? speciesNames[application.pet.species] ||
                          application.pet.species
                        : 'Jenis hewan belum tersedia'}

                      {application.shelter?.name
                        ? ` · ${application.shelter.name}`
                        : ''}
                    </p>

                    <small>
                      Diajukan {formatDate(application.created_at)}
                    </small>
                  </>
                ) : (
                  <p className="form-error" role="alert">
                    {error}
                  </p>
                )}
              </div>

              <div className="application-history-actions">
                {error && (
                  <button
                    className="button-secondary"
                    type="button"
                    onClick={() => setRefreshKey((key) => key + 1)}
                  >
                    <RotateCw size={16} /> Muat ulang
                  </button>
                )}

                {application && (
                  <Link
                    className="button-secondary"
                    to={`/applications/${encodeURIComponent(id)}/receipt`}
                  >
                    <ClipboardCheck size={16} />
                    Lihat detail pengajuan
                  </Link>
                )}

                <button
                  className="text-button"
                  type="button"
                  onClick={() => removeFromDevice(id)}
                >
                  <Trash2 size={16} />
                  Hapus dari perangkat
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}