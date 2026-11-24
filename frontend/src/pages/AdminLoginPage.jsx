import { KeyRound } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { supabase } from '../auth/supabase'

export function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState({ kind: 'idle', message: '' })
  const [session, setSession] = useState(null)

  if (session) return <Navigate to="/admin" replace />

  async function handleSubmit(event) {
    event.preventDefault()
    if (!supabase) {
      setStatus({
        kind: 'error',
        message: 'Login belum dikonfigurasi. Atur VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.',
      })
      return
    }

    setStatus({ kind: 'loading', message: '' })
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setStatus({ kind: 'error', message: 'Email atau kata sandi tidak valid.' })
      return
    }
    setSession(data.session)
  }

  return (
    <section className="page-main admin-login-page">
      <div className="admin-login-card">
        <span className="admin-login-icon"><KeyRound size={23} /></span>
        <span className="eyebrow">Area pengelola PawLoka</span>
        <h1>Login admin</h1>
        <p>Masuk untuk mengelola katalog, shelter, dan pengajuan adopsi.</p>
        <form className="application-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              name="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            Kata sandi
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {status.kind === 'error' && <p className="form-error" role="alert">{status.message}</p>}
          <button className="button-primary" type="submit" disabled={status.kind === 'loading'}>
            {status.kind === 'loading' ? 'Memeriksa...' : 'Masuk'}
          </button>
        </form>
        <Link className="text-link admin-back-link" to="/">Kembali ke PawLoka</Link>
      </div>
    </section>
  )
}
