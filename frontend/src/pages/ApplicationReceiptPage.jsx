import { ArrowLeft, ClipboardCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchApplication } from '../api/client'
import { readApplicationClaims } from '../utils/application-history-storage'
import { speciesNames } from '../utils/pet-format'

const statusNames = {
  pending: 'Menunggu Konfirmasi',
  reviewing: 'Sedang Diproses',
  approved: 'Disetujui',
  declined: 'Ditolak',
  closed: 'Ditutup',
}

function formatApplicationDate(value) {
  return value
    ? new Date(value).toLocaleDateString('id-ID', { dateStyle: 'long' })
    : 'Tanggal belum tersedia'
}

export function ApplicationReceiptPage() {
  const { id } = useParams()

  const [pageState, setPageState] = useState({
    kind: 'loading',
    application: null,
    message: '',
  })

  useEffect(() => {
    let active = true

    async function loadApplication() {
      const { claims, error } = readApplicationClaims()

      if (error) {
        if (active) {
          setPageState({
            kind: 'error',
            application: null,
            message: error,
          })
        }
        return
      }

      const claim = claims.find((item) => item.id === id)

      if (!claim) {
        if (active) {
          setPageState({
            kind: 'error',
            application: null,
            message:
              'Akses riwayat tidak ditemukan di perangkat ini. Pengajuan hanya dapat dilihat dari perangkat yang menyimpan akses riwayatnya.',
          })
        }
        return
      }

      try {
        const application = await fetchApplication(id, claim.accessToken)

        if (active) {
          setPageState({
            kind: 'success',
            application,
            message: '',
          })
        }
      } catch (error) {
        if (active) {
          setPageState({
            kind: 'error',
            application: null,
            message: error.response?.status === 404
              ? 'Detail pengajuan tidak ditemukan. Pengajuan mungkin sudah dihapus atau akses riwayat tidak lagi tersedia.'
              : 'Detail pengajuan belum dapat dimuat. Periksa koneksi internet, lalu coba lagi.',
          })
        }
      }
    }

    loadApplication()

    return () => {
      active = false
    }
  }, [id])

  if (pageState.kind === 'loading') {
    return (
      <section className="page-main loading-state" role="status">
        Memuat detail pengajuan...
      </section>
    )
  }

  if (pageState.kind === 'error') {
    return (
      <section className="page-main">
        <div className="error-card" role="alert">
          <p>{pageState.message}</p>

          <Link className="text-link" to="/applications">
            <ArrowLeft size={17} />
            Kembali ke riwayat pengajuan
          </Link>
        </div>
      </section>
    )
  }

  const application = pageState.application
  const pet = application.pet
  const shelter = application.shelter

  return (
    <section className="page-main application-page">
      <div className="application-success">
        <span className="about-paw">
          <ClipboardCheck size={30} />
        </span>

        <span className="eyebrow">
          Bukti pengajuan adopsi
        </span>

        <h1>Pengajuan Berhasil Disimpan!</h1>

        <p>
          Berikut adalah detail pengajuan adopsi yang sebelumnya kamu
          kirimkan melalui PawLoka.
        </p>

        <p>
          Status saat ini:{' '}
          <strong>
            {statusNames[application.status] || 'Status belum tersedia'}
          </strong>.
        </p>

        <dl className="application-summary">
          <div>
            <dt>Nama calon adopter</dt>
            <dd>{application.applicant_name || 'Data tidak tersedia'}</dd>
          </div>

          <div>
            <dt>Domisili</dt>
            <dd>{application.domicile || 'Data tidak tersedia'}</dd>
          </div>

          <div>
            <dt>Hewan</dt>
            <dd>
              {pet?.name || 'Hewan pilihan'}
              {pet?.species
                ? ` · ${speciesNames[pet.species] || pet.species}`
                : ''}
            </dd>
          </div>

          {shelter?.name && (
            <div>
              <dt>Shelter</dt>
              <dd>{shelter.name}</dd>
            </div>
          )}

          <div>
            <dt>Tanggal pengajuan</dt>
            <dd>{formatApplicationDate(application.created_at)}</dd>
          </div>

          <div>
            <dt>Alasan ingin mengadopsi</dt>
            <dd>{application.adoption_reason || 'Data tidak tersedia'}</dd>
          </div>

          <div>
            <dt>Pengalaman memelihara hewan</dt>
            <dd>{application.pet_experience || 'Data tidak tersedia'}</dd>
          </div>

          {application.message && (
            <div>
              <dt>Catatan tambahan</dt>
              <dd>{application.message}</dd>
            </div>
          )}
        </dl>

        <div className="application-success-actions">
          {pet?.id && (
            <Link
              className="button-secondary"
              to={`/pets/${encodeURIComponent(pet.id)}`}
            >
              Lihat detail hewan
            </Link>
          )}

          <Link
            className="button-primary"
            to="/applications"
          >
            <ArrowLeft size={17} />
            Kembali ke riwayat pengajuan
          </Link>
        </div>
      </div>
    </section>
  )
}