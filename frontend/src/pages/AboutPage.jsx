import {
  ArrowRight,
  BookOpenText,
  Camera,
  ClipboardCheck,
  Code2,
  Database,
  Heart,
  HeartHandshake,
  House,
  PawPrint,
  Search,
  Server,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserRound,
  WifiOff,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const missions = [
  {
    icon: HeartHandshake,
    title: 'Adopsi dengan tanggung jawab',
    description: 'Mendorong calon adopter memahami komitmen dan kebutuhan hewan sebelum mengambil keputusan',
  },
  {
    icon: Search,
    title: 'Informasi lebih mudah dijangkau',
    description: 'Menyatukan profil hewan dan informasi shelter agar langkah awal pencarian terasa lebih sederhana',
  },
  {
    icon: PawPrint,
    title: 'Peduli kesejahteraan hewan',
    description: 'Menumbuhkan kepedulian pada hewan yang membutuhkan tempat aman dan keluarga baru',
  },
]

const features = [
  {
    icon: PawPrint,
    title: 'Pet Catalog',
    description: 'Jelajahi katalog hewan yang tersedia untuk diadopsi',
  },
  {
    icon: House,
    title: 'Shelter Directory',
    description: 'Temukan shelter beserta lokasi dan informasi kontaknya',
  },
  {
    icon: Heart,
    title: 'Pet Details',
    description: 'Kenali usia, ras, status, deskripsi, dan shelter terkait',
  },
  {
    icon: BookOpenText,
    title: 'Adoption Guide',
    description: 'Baca langkah dan hal yang perlu dipertimbangkan sebelum adopsi',
  },
  {
    icon: ClipboardCheck,
    title: 'Adoption Application',
    description: 'Saat backend aktif, simpan pengajuan dan lanjutkan percakapan melalui WhatsApp PawLoka',
  },
]

const technologies = [
  {
    icon: Code2,
    title: 'Frontend',
    description: 'React, Vite, React Router, dan Axios',
  },
  {
    icon: Server,
    title: 'Backend & API',
    description: 'Node.js dan Express untuk API PawLoka',
  },
  {
    icon: Database,
    title: 'Database & autentikasi',
    description: 'Supabase Postgres dan Supabase Auth',
  },
  {
    icon: Smartphone,
    title: 'PWA',
    description: 'vite-plugin-pwa dan Workbox untuk app shell serta aset statis',
  },
]

export function AboutPage({ notFound = false }) {
  if (notFound) {
    return (
      <section className="page-main coming-soon">
        <span className="eyebrow">PawLoka</span>
        <h1>Halaman tidak ditemukan</h1>
        <Link className="button-primary" to="/">Kembali ke beranda</Link>
      </section>
    )
  }

  return <AboutContent />
}

function AboutContent() {
 
  return (
   <section className="page-main about-page">
      <header className="about-hero" aria-labelledby="about-title">
        <div className="about-hero-copy">
          <span className="about-kicker"><PawPrint size={17} /> Cerita di balik PawLoka</span>
          <h1 id="about-title">Setiap teman layak punya rumah.</h1>
          <p>
            PawLoka membantu calon adopter menemukan hewan yang membutuhkan rumah baru
            dan mengenal shelter yang merawat mereka
          </p>
          <div className="about-hero-actions">
            <Link className="button-primary" to="/pets">
              Jelajahi hewan <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link className="about-hero-link" to="/adoption">Kenali proses adopsi</Link>
          </div>
        </div>
        <div className="about-hero-art" aria-hidden="true">
          <span className="about-hero-orbit about-hero-orbit--large" />
          <span className="about-hero-orbit about-hero-orbit--small" />
          <span className="about-hero-sun" />
          <span className="about-hero-paw about-hero-paw--one"><PawPrint size={42} /></span>
          <span className="about-hero-paw about-hero-paw--two"><PawPrint size={27} /></span>
          <span className="about-hero-sticker">
            <Sparkles size={18} />
            <strong>Temukan.<br />Kenali.<br />Peduli.</strong>
          </span>
        </div>
      </header>

      <div className="about-intro-grid">
        <section className="about-story-card" aria-labelledby="about-story-title">
          <span className="about-section-label">Tentang PawLoka</span>
          <h2 id="about-story-title">Satu tempat untuk memulai cerita baru</h2>
          <p>
            PawLoka adalah platform informasi adopsi hewan peliharaan dan direktori shelter.
            Kami ingin membantu calon adopter menemukan hewan yang sedang mencari rumah,
            lalu mengenal shelter yang dapat dihubungi untuk bertanya lebih lanjut.
          </p>
          <p>
            PawLoka mempertemukan informasi dan calon adopter; proses serta keputusan adopsi
            tetap berada pada shelter.
          </p>
          <div className="about-story-note">
            <ShieldCheck size={19} aria-hidden="true" />
            <span>Kenali kebutuhannya, lalu konfirmasi langsung kepada shelter.</span>
          </div>
        </section>

        <section className="about-mission-card" aria-labelledby="about-mission-title">
          <span className="about-section-label">Misi PawLoka</span>
          <h2 id="about-mission-title">Kepedulian dalam setiap langkah</h2>
          <div className="about-mission-list">
            {missions.map(({ icon: Icon, title, description }) => (
              <article className="about-mission-item" key={title}>
                <span className="about-mission-icon"><Icon size={19} aria-hidden="true" /></span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="about-section" aria-labelledby="about-developer-title">
        <div className="about-section-heading">
          <div>
            <span className="about-section-label"></span>
            <h2 id="about-developer-title">Identitas Pengembang</h2>
          </div>
          <p></p>
        </div>
        <article className="about-developer-card">
          <div className="about-developer-avatar" aria-hidden="true">AF</div>
          <div className="about-developer-info">
            <span className="about-profile-tag"><UserRound size={15} /> Pengembang PawLoka</span>
            <h3>Anindya Fairuz Az Zahra</h3>
            <p>NIM 21120124120018</p>
          </div>
          <div className="about-developer-note">
            <PawPrint size={22} aria-hidden="true" />
            <span>Mahasiswa Teknik Komputer</span>
          </div>
        </article>
      </section>

      <section className="about-section" aria-labelledby="about-features-title">
        <div className="about-section-heading">
          <div>
            <span className="about-section-label"></span>
            <h2 id="about-features-title">Fitur PawLoka</h2>
          </div>
          <p></p>
        </div>
        <div className="about-feature-grid">
          {features.map(({ icon: Icon, title, description }, index) => (
            <article className="about-feature-card" key={title}>
              <span className={`about-feature-icon about-feature-icon--${index + 1}`}>
                <Icon size={21} aria-hidden="true" />
              </span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section" aria-labelledby="about-tech-title">
        <div className="about-section-heading">
          <div>
            <span className="about-section-label"></span>
            <h2 id="about-tech-title">Teknologi PawLoka</h2>
          </div>
          <p></p>
        </div>
        <div className="about-tech-grid">
          {technologies.map(({ icon: Icon, title, description }) => (
            <article className="about-tech-card" key={title}>
              <Icon size={20} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section" aria-labelledby="about-notes-title">
        <div className="about-section-heading">
          <div>
            <span className="about-section-label"></span>
            <h2 id="about-notes-title">Informasi Data dan Konten</h2>
          </div>
        </div>
        <div className="about-notes-grid">
          <article className="about-note-card about-note-card--mint">
            <span className="about-note-icon"><ShieldCheck size={20} /></span>
            <h3>Data & informasi</h3>
            <p>
              Informasi hewan dan shelter mengikuti data yang tersedia di PawLoka.
              Status ketersediaan, detail, dan prosedur adopsi perlu dikonfirmasi
              langsung kepada shelter terkait.
            </p>
          </article>
          <article className="about-note-card about-note-card--lavender">
            <span className="about-note-icon"><Heart size={20} /></span>
            <h3>Favorit</h3>
            <p>
              Favorit disimpan di perangkat ini saja melalui localStorage. Belum
              tersedia penyimpanan di database maupun sinkronisasi akun.
            </p>
          </article>
          <article className="about-note-card about-note-card--yellow">
            <span className="about-note-icon"><WifiOff size={20} /></span>
            <h3>Pengalaman offline</h3>
            <p>
              Service worker dapat menyajikan app shell dan aset statis yang sudah
              tersimpan. Data katalog, detail, dan permintaan API tetap memerlukan
              koneksi internet.
            </p>
          </article>
          <article className="about-note-card about-note-card--coral">
            <span className="about-note-icon"><Camera size={20} /></span>
            <h3>Kredit foto</h3>
            <p>
              Beberapa foto contoh ditautkan dari Unsplash. PawLoka belum menyimpan
              nama fotografer atau metadata lisensi per foto; periksa sumber dan hak
              penggunaan, terutama untuk gambar yang ditambahkan admin.
            </p>
          </article>
          <article className="about-note-card about-note-card--mint">
            <span className="about-note-icon"><ClipboardCheck size={20} /></span>
            <h3>Riwayat pengajuan</h3>
            <p>
              Data pengajuan disimpan di database PawLoka untuk ditinjau admin. Token akses
              riwayat disimpan di localStorage perangkat ini; tidak ada akun atau sinkronisasi.
              Menghapus data situs menghilangkan akses riwayat dari perangkat. Pesan WhatsApp
              hanya terkirim jika pengguna menekan Kirim di WhatsApp.
            </p>
          </article>
        </div>
      </section>

      <div className="about-closing">
        <PawPrint size={23} aria-hidden="true" />
        <p>Siap menemukan teman yang tepat?</p>
        <Link className="button-primary" to="/pets">
          Temukan teman baru <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
