import { Check, HeartHandshake, ShieldCheck } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'

const steps = [
  ['Kenali kebutuhanmu', 'Pikirkan waktu, ruang, biaya, dan gaya hidup sebelum memilih teman baru.'],
  ['Kenali calon teman', 'Baca profil, status, dan karakter hewan. Tanyakan detail pada shelter.'],
  ['Hubungi shelter', 'Sampaikan minat dan ikuti proses serta persyaratan dari shelter terkait.'],
  ['Siapkan rumah', 'Persiapkan lingkungan aman, makanan, dan pemeriksaan kesehatan yang dibutuhkan.'],
]

export function AdoptionGuidePage() {
  const [searchParams] = useSearchParams()
  const selectedPetId = searchParams.get('pet')

  return (
    <section className="page-main guide-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow"><HeartHandshake size={16} /> Langkah kecil, komitmen besar</span>
          <h1>Adopsi dengan hati dan persiapan</h1>
          <p>Adopsi adalah komitmen jangka panjang. Luangkan waktu untuk memastikan kamu dan calon temanmu cocok.</p>
        </div>
      </div>
      {selectedPetId && (
        <div className="notice-card">
          Kamu sedang melihat informasi adopsi untuk hewan pilihan. Lanjutkan dengan meninjau detail dan menghubungi shelter secara langsung.
        </div>
      )}
      <div className="guide-grid">
        <div className="guide-steps">
          {steps.map(([title, description], index) => (
            <article className="guide-step" key={title}>
              <span className="guide-step-number">{String(index + 1).padStart(2, '0')}</span>
              <div><h2>{title}</h2><p>{description}</p></div>
            </article>
          ))}
        </div>
        <aside className="guide-checklist">
          <ShieldCheck size={30} aria-hidden="true" />
          <h2>Sebelum mengadopsi</h2>
          <ul>
            <li><Check size={17} /> Pastikan semua anggota rumah setuju</li>
            <li><Check size={17} /> Siapkan waktu dan biaya perawatan</li>
            <li><Check size={17} /> Tanyakan riwayat kesehatan dan kebiasaan</li>
            <li><Check size={17} /> Ikuti ketentuan shelter yang bersangkutan</li>
          </ul>
          <p>Persyaratan dan keputusan akhir ditetapkan masing-masing shelter.</p>
          <Link className="button-primary" to="/shelters">Cari shelter</Link>
        </aside>
      </div>
    </section>
  )
}
