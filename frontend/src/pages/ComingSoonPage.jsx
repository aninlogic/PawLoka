import { Link } from 'react-router-dom'

export function ComingSoonPage({ title }) {
  return (
    <section className="page-main coming-soon">
      <span className="eyebrow">PawLoka</span>
      <h1>{title}</h1>
      <p>Bagian ini sedang disiapkan.</p>
      <Link className="button-primary" to="/pets">Lihat katalog hewan</Link>
    </section>
  )
}
