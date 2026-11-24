
import { ArrowLeft, ClipboardCheck, HeartHandshake, MessageCircle } from 'lucide-react'

import { useEffect, useRef, useState } from 'react'

import { Link, useParams } from 'react-router-dom'

import { fetchPet, submitApplication } from '../api/client'

import { saveApplicationClaim } from '../utils/application-history-storage'

import { speciesNames } from '../utils/pet-format'

import { createPetWhatsAppUrl } from '../utils/whatsapp'


const initialValues = {
  applicant_name: '',
  domicile: '',
  adoption_reason: '',
  pet_experience: '',
  message: '',
  consent: false,
}


const applicationStatusNames = {
  pending: 'Menunggu Konfirmasi',
  reviewing: 'Sedang Diproses',
  approved: 'Disetujui',
  declined: 'Ditolak',
  closed: 'Ditutup',
}


const petStatusNames = {
  reserved: 'sedang diproses',
  adopted: 'sudah menemukan rumah',
}


function formatApplicationDate(value) {
  return value
    ? new Date(value).toLocaleDateString('id-ID', { dateStyle: 'long' })
    : 'Tanggal belum tersedia'
}


export function ApplicationPage() {
  const { petId } = useParams()

  return <ApplicationForm key={petId} petId={petId} />
}


function ApplicationForm({ petId }) {
  const [petResult, setPetResult] = useState({
    id: null,
    status: 'loading',
    pet: null,
    error: '',
  })

  const [values, setValues] = useState(initialValues)

  const [formStatus, setFormStatus] = useState({
    kind: 'idle',
    message: '',
  })

  const [submission, setSubmission] = useState(null)
  const [fallbackWhatsAppUrl, setFallbackWhatsAppUrl] = useState('')
  const submissionInProgress = useRef(false)


  useEffect(() => {
    const controller = new AbortController()

    fetchPet(petId, { signal: controller.signal })
      .then((pet) => {
        setPetResult({
          id: petId,
          status: 'success',
          pet,
          error: '',
        })
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setPetResult({
            id: petId,
            status: 'error',
            pet: null,
            error: error.response?.status === 404
              ? 'Hewan tidak ditemukan.'
              : 'Detail hewan belum dapat dimuat. Coba lagi sebentar.',
          })
        }
      })

    return () => controller.abort()
  }, [petId])


  function updateField(event) {
    const { name, value, checked, type } = event.target

    setValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }


  const loadingPet =
    petResult.id !== petId || petResult.status === 'loading'


  if (loadingPet) {
    return (
      <section className="page-main loading-state" role="status">
        Memuat detail hewan...
      </section>
    )
  }


  if (petResult.error || !petResult.pet) {
    return (
      <section className="page-main">
        <div className="error-card" role="alert">
          <p>{petResult.error || 'Hewan tidak ditemukan.'}</p>

          <Link className="text-link" to="/pets">
            <ArrowLeft size={17} />
            Kembali ke katalog
          </Link>
        </div>
      </section>
    )
  }


  const pet = petResult.pet


  if (pet.status !== 'available') {
    return (
      <section className="page-main application-page">
        <div className="application-whatsapp-notice" role="status">
          <p>
            {pet.name} {petStatusNames[pet.status] || 'tidak tersedia'} untuk
            pengajuan adopsi.
          </p>

          <Link
            className="text-link application-back-link"
            to={`/pets/${encodeURIComponent(petId)}`}
          >
            <ArrowLeft size={17} />
            Kembali ke detail hewan
          </Link>
        </div>
      </section>
    )
  }


  const shelter = pet.shelter

  const whatsAppUrl = createPetWhatsAppUrl(
    pet,
    submission?.values || values
  )


  async function handleSubmit(event) {
    event.preventDefault()
    if (submissionInProgress.current) return

    submissionInProgress.current = true

    const whatsAppWindow = window.open('about:blank', '_blank')

    setFormStatus({
      kind: 'loading',
      message: '',
    })

    try {
      const application = await submitApplication({
        ...values,
        pet_id: petId,
      })

      const historyError = saveApplicationClaim({
        id: application.id,
        accessToken: application.access_token,
      })

      if (whatsAppWindow) {
        whatsAppWindow.opener = null

        whatsAppWindow.location.href = createPetWhatsAppUrl(
          pet,
          values
        )
      }

      setSubmission({
        application,
        values,
        historyError,
        whatsappOpened: Boolean(whatsAppWindow),
      })

    } catch (error) {
      submissionInProgress.current = false
      const fallbackUrl = createPetWhatsAppUrl(pet, values)
      setFallbackWhatsAppUrl(fallbackUrl)

      if (whatsAppWindow) {
        whatsAppWindow.opener = null
        whatsAppWindow.location.href = fallbackUrl
      }

      setFormStatus({
        kind: 'error',
        message:
          `${error.response?.data?.error?.message || 'Pengajuan belum dapat dikirim. Periksa koneksi, lalu coba lagi.'} Data pengajuan belum tersimpan ke database.`,
      })
    }
  }


  // ==========================================
  // SUCCESS CONFIRMATION
  // ==========================================

  if (submission) {
    const adopterValues = submission.values

    return (
      <section className="page-main application-page">
        <div className="application-success" role="status">

          <span className="about-paw">
            <ClipboardCheck size={30} />
          </span>

          <span className="eyebrow">
            Pengajuan berhasil
          </span>

          <h1>Pengajuan Berhasil Disimpan!</h1>

          <p>
            Terima kasih, {adopterValues.applicant_name}.
            Pengajuan adopsimu untuk {pet.name} telah berhasil disimpan.
          </p>

          <p>
            Status saat ini:{' '}
            <strong>
              {applicationStatusNames[submission.application.status]}
            </strong>.
            {submission.whatsappOpened
              ? ' Draf WhatsApp telah dibuka di tab baru. Pesan belum terkirim sampai kamu menekan tombol Kirim.'
              : ' Draf WhatsApp tidak terbuka otomatis. Gunakan tombol di bawah untuk melanjutkan komunikasi.'}
          </p>

          <dl className="application-summary">

            <div>
              <dt>Nama calon adopter</dt>
              <dd>{adopterValues.applicant_name}</dd>
            </div>

            <div>
              <dt>Domisili</dt>
              <dd>{adopterValues.domicile}</dd>
            </div>

            <div>
              <dt>Hewan</dt>
              <dd>
                {pet.name} · {speciesNames[pet.species] || pet.species}
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
              <dd>
                {formatApplicationDate(submission.application.created_at)}
              </dd>
            </div>

            <div>
              <dt>Alasan adopsi</dt>
              <dd>{adopterValues.adoption_reason}</dd>
            </div>

            <div>
              <dt>Pengalaman memelihara hewan</dt>
              <dd>{adopterValues.pet_experience}</dd>
            </div>

            {adopterValues.message && (
              <div>
                <dt>Catatan tambahan</dt>
                <dd>{adopterValues.message}</dd>
              </div>
            )}

          </dl>

          {submission.historyError && (
            <p className="form-error" role="alert">
              {submission.historyError}
              {' '}Riwayat tidak akan tersedia di perangkat ini.
            </p>
          )}

          <a
            className="button-primary"
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={18} />
            Buka WhatsApp
          </a>

          <div className="application-success-actions">

            <Link
              className="button-secondary"
              to="/applications"
            >
              Lihat riwayat pengajuan
            </Link>

            <Link
              className="text-link"
              to="/pets"
            >
              Kembali ke katalog
            </Link>

          </div>

        </div>
      </section>
    )
  }


  // ==========================================
  // APPLICATION FORM
  // ==========================================

  return (
    <section className="page-main application-page">

      <Link
        className="text-link application-back-link"
        to={`/pets/${encodeURIComponent(petId)}`}
      >
        <ArrowLeft size={17} />
        Kembali ke detail hewan
      </Link>


      <div className="application-intro">

        <div className="application-title-row">

          <span className="application-title-icon">
            <HeartHandshake size={26} />
          </span>

          <h1>Ajukan adopsi {pet.name}</h1>

        </div>

        <p>
          Isi formulir untuk menyimpan pengajuan. WhatsApp PawLoka akan
          terbuka otomatis setelah pengajuan tersimpan.
        </p>

      </div>


      <form
        className="application-form"
        aria-busy={formStatus.kind === 'loading'}
        onSubmit={handleSubmit}
      >

        <label>
          Nama lengkap

          <input
            name="applicant_name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={80}
            value={values.applicant_name}
            onChange={updateField}
          />
        </label>


        <label>
          Domisili

          <input
            name="domicile"
            autoComplete="address-level2"
            minLength={2}
            maxLength={150}
            required
            value={values.domicile}
            onChange={updateField}
          />
        </label>


        <label>
          Alasan ingin mengadopsi

          <textarea
            name="adoption_reason"
            rows={4}
            minLength={10}
            maxLength={1000}
            required
            value={values.adoption_reason}
            onChange={updateField}
          />
        </label>


        <label>
          Pengalaman memelihara hewan

          <textarea
            name="pet_experience"
            rows={4}
            minLength={2}
            maxLength={1000}
            required
            value={values.pet_experience}
            onChange={updateField}
          />
        </label>


        <label>
          Catatan tambahan <span>(opsional)</span>

          <textarea
            name="message"
            rows={4}
            maxLength={1000}
            value={values.message}
            onChange={updateField}
          />
        </label>


        <label className="consent-control">

          <input
            name="consent"
            type="checkbox"
            required
            checked={values.consent}
            onChange={updateField}
          />

          <span>
            Saya setuju data nama, domisili, alasan, pengalaman, dan
            catatan untuk disimpan.
          </span>

        </label>


        {formStatus.kind === 'error' && (
          <div className="form-error" role="alert">
            <p>{formStatus.message}</p>
            {fallbackWhatsAppUrl && (
              <a
                className="button-secondary"
                href={fallbackWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={18} />
                Lanjut ke WhatsApp
              </a>
            )}
          </div>
        )}


        <button
          className="button-primary"
          type="submit"
          disabled={formStatus.kind === 'loading'}
        >
          {formStatus.kind === 'loading'
            ? 'Menyimpan pengajuan...'
            : 'Kirim Pengajuan'}
        </button>

      </form>

    </section>
  )
}