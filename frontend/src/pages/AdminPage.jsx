import { LogOut, RefreshCw, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { adminRequest } from '../api/admin-client'
import { supabase } from '../auth/supabase'
import { speciesOptions } from '../utils/pet-format'

const sections = [
  ['pets', 'Hewan'],
  ['shelters', 'Shelter'],
  ['applications', 'Pengajuan'],
]

export function AdminPage() {
  const [session, setSession] = useState(() => (supabase ? undefined : null))
  const [activeSection, setActiveSection] = useState('applications')
  const [records, setRecords] = useState([])
  const [status, setStatus] = useState({ kind: 'loading', message: '' })
  const [refreshKey, setRefreshKey] = useState(0)
  const [shelters, setShelters] = useState([])
  const [editor, setEditor] = useState(null)

  useEffect(() => {
    if (!supabase) return undefined

    let active = true
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return
      if (error) {
        setSession(null)
        return
      }
      setSession(data.session)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })
    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!session) return undefined
    let active = true

    async function loadRecords() {
      try {
        const data = await adminRequest(session, 'get', `/admin/${activeSection}`)
        const shelterData = activeSection === 'pets'
          ? await adminRequest(session, 'get', '/admin/shelters')
          : null
        if (!active) return
        setRecords(data || [])
        if (shelterData) setShelters(shelterData)
        setStatus({ kind: 'success', message: '' })
      } catch (error) {
        if (!active) return
        setStatus({
          kind: 'error',
          message: error.response?.data?.error?.message || 'Data admin belum dapat dimuat.',
        })
      }
    }

    loadRecords()
    return () => {
      active = false
    }
  }, [activeSection, refreshKey, session])

  if (session === undefined) {
    return <section className="page-main loading-state" role="status">Memeriksa sesi admin...</section>
  }
  if (!session) return <Navigate to="/admin/login" replace />

  async function updateApplication(id, nextStatus) {
    try {
      await adminRequest(session, 'patch', `/admin/applications/${id}`, { status: nextStatus })
      setRefreshKey((key) => key + 1)
    } catch (error) {
      setStatus({
        kind: 'error',
        message: error.response?.data?.error?.message || 'Status pengajuan belum dapat diperbarui.',
      })
    }
  }

  async function deleteApplication(id) {
    if (!window.confirm('Hapus data pengajuan ini secara permanen?')) return
    try {
      await adminRequest(session, 'delete', `/admin/applications/${id}`)
      setRefreshKey((key) => key + 1)
    } catch (error) {
      setStatus({
        kind: 'error',
        message: error.response?.data?.error?.message || 'Pengajuan belum dapat dihapus.',
      })
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) setStatus({ kind: 'error', message: 'Sesi belum dapat diakhiri.' })
  }

  function startCreate() {
    setEditor({
      id: null,
      values: activeSection === 'pets'
        ? {
            shelter_id: shelters[0]?.id || '',
            name: '',
            species: 'cat',
            breed: '',
            age_months: 0,
            sex: 'female',
            description: '',
            status: 'available',
            image_url: '',
            is_published: false,
          }
        : {
            name: '',
            location: '',
            phone: '',
            email: '',
            description: '',
            image_url: '',
            is_published: false,
          },
    })
  }

  function startEdit(record) {
    const values = { ...record }
    if (activeSection === 'pets') delete values.shelter
    delete values.id
    delete values.created_at
    delete values.updated_at
    setEditor({ id: record.id, values })
  }

  function updateEditor(event) {
    const { name, value, checked, type } = event.target
    setEditor((current) => ({
      ...current,
      values: { ...current.values, [name]: type === 'checkbox' ? checked : value },
    }))
  }

  async function saveRecord(event) {
    event.preventDefault()
    const path = `/admin/${activeSection}${editor.id ? `/${editor.id}` : ''}`
    const values = { ...editor.values }
    if (activeSection === 'pets') values.age_months = Number(values.age_months)
    try {
      await adminRequest(session, editor.id ? 'patch' : 'post', path, values)
      setEditor(null)
      setRefreshKey((key) => key + 1)
    } catch (error) {
      setStatus({
        kind: 'error',
        message: error.response?.data?.error?.message || 'Data belum dapat disimpan.',
      })
    }
  }

  async function deleteRecord(record) {
    if (!window.confirm(`Hapus ${record.name}? Tindakan ini tidak dapat dibatalkan.`)) return
    try {
      await adminRequest(session, 'delete', `/admin/${activeSection}/${record.id}`)
      setRefreshKey((key) => key + 1)
    } catch (error) {
      setStatus({
        kind: 'error',
        message: error.response?.data?.error?.message || 'Data belum dapat dihapus.',
      })
    }
  }

  function renderEditorField(name, label, type = 'text', options = null) {
    const value = editor.values[name]
    if (type === 'checkbox') {
      return (
        <label className="consent-control admin-checkbox" key={name}>
          <input name={name} type="checkbox" checked={Boolean(value)} onChange={updateEditor} />
          <span>{label}</span>
        </label>
      )
    }
    return (
      <label key={name}>
        {label}
        {options ? (
          <select name={name} value={value} onChange={updateEditor} required>
            {options.map(([optionValue, optionLabel]) => (
              <option key={optionValue} value={optionValue}>{optionLabel}</option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea name={name} value={value} onChange={updateEditor} maxLength={2000} required />
        ) : (
          <input
            name={name}
            type={type}
            value={value}
            onChange={updateEditor}
            min={type === 'number' ? 0 : undefined}
            max={type === 'number' ? 600 : undefined}
            maxLength={type === 'url' ? undefined : 200}
            required={!['url', 'email'].includes(type)}
          />
        )}
      </label>
    )
  }

  return (
    <section className="page-main admin-page">
      <div className="admin-heading">
        <div>
          <span className="eyebrow"><ShieldCheck size={16} /> Area admin terlindungi</span>
          <h1>Dashboard PawLoka</h1>
          <p>Masuk sebagai {session.user.email}</p>
        </div>
        <button className="button-secondary" type="button" onClick={signOut}>
          <LogOut size={17} /> Keluar
        </button>
      </div>
      <div className="admin-tabs" role="tablist" aria-label="Data yang dikelola">
        {sections.map(([key, label]) => (
          <button
            key={key}
            className={activeSection === key ? 'active' : ''}
            type="button"
            role="tab"
            aria-selected={activeSection === key}
            onClick={() => {
              setStatus({ kind: 'loading', message: '' })
              setActiveSection(key)
            }}
          >
            {label}
          </button>
        ))}
        <button
          className="admin-refresh"
          type="button"
          onClick={() => {
            setStatus({ kind: 'loading', message: '' })
            setRefreshKey((key) => key + 1)
          }}
          aria-label="Muat ulang data"
        >
          <RefreshCw size={17} />
        </button>
      </div>
      {status.kind === 'error' && <div className="error-card" role="alert">{status.message}</div>}
      {activeSection !== 'applications' && (
        <button className="button-primary admin-create-button" type="button" onClick={startCreate}>
          Tambah {activeSection === 'pets' ? 'hewan' : 'shelter'}
        </button>
      )}
      {editor && (
        <form className="application-form admin-editor" onSubmit={saveRecord}>
          <h2>{editor.id ? 'Ubah data' : 'Tambah data baru'}</h2>
          {activeSection === 'pets' ? (
            <>
              {renderEditorField('shelter_id', 'Shelter', 'text', shelters.map((shelter) => [shelter.id, shelter.name]))}
              {renderEditorField('name', 'Nama')}
              {renderEditorField('species', 'Jenis hewan', 'text', speciesOptions)}
              {renderEditorField('breed', 'Ras')}
              {renderEditorField('age_months', 'Usia (bulan)', 'number')}
              {renderEditorField('sex', 'Jenis kelamin', 'text', [['female', 'Betina'], ['male', 'Jantan']])}
              {renderEditorField('description', 'Deskripsi', 'textarea')}
              {renderEditorField('status', 'Status', 'text', [
                ['available', 'Siap diadopsi'], ['reserved', 'Sedang diproses'], ['adopted', 'Sudah diadopsi'],
              ])}
              {renderEditorField('image_url', 'URL gambar (HTTPS)', 'url')}
              {renderEditorField('is_published', 'Publikasikan', 'checkbox')}
            </>
          ) : (
            <>
              {renderEditorField('name', 'Nama shelter')}
              {renderEditorField('location', 'Lokasi')}
              {renderEditorField('phone', 'Nomor telepon / WhatsApp')}
              {renderEditorField('email', 'Email', 'email')}
              {renderEditorField('description', 'Deskripsi', 'textarea')}
              {renderEditorField('image_url', 'URL gambar (HTTPS)', 'url')}
              {renderEditorField('is_published', 'Publikasikan', 'checkbox')}
            </>
          )}
          <div className="admin-editor-actions">
            <button className="button-primary" type="submit">Simpan</button>
            <button className="button-secondary" type="button" onClick={() => setEditor(null)}>Batal</button>
          </div>
        </form>
      )}
      {status.kind === 'loading' ? (
        <div className="loading-state" role="status">Memuat data...</div>
      ) : records.length === 0 ? (
        <div className="empty-card">
          {activeSection === 'applications'
            ? 'Belum ada pengajuan.'
            : 'Belum ada data. Pengelolaan katalog tersedia setelah backend Supabase disiapkan.'}
        </div>
      ) : activeSection === 'applications' ? (
        <div className="admin-record-list">
          {records.map((application) => (
            <article className="admin-record" key={application.id}>
              <div>
                <h2>{application.applicant_name}</h2>
                <p>
                  {application.email || application.phone
                    ? `${application.email || application.phone} · `
                    : ''}
                  {application.pet?.name || 'Hewan pilihan'}
                </p>
                {application.domicile && <p>Domisili: {application.domicile}</p>}
                {application.adoption_reason && <p>Alasan adopsi: {application.adoption_reason}</p>}
                {application.pet_experience && <p>Pengalaman: {application.pet_experience}</p>}
                {application.message && <p className="admin-message">{application.message}</p>}
                <small>{new Date(application.created_at).toLocaleString('id-ID')}</small>
              </div>
              <div className="admin-record-actions">
                <label>
                  <span className="visually-hidden">Status pengajuan</span>
                  <select
                    value={application.status}
                    onChange={(event) => updateApplication(application.id, event.target.value)}
                  >
                    <option value="pending">Menunggu Konfirmasi</option>
                    <option value="reviewing">Diproses</option>
                    <option value="approved">Disetujui</option>
                    <option value="declined">Ditolak</option>
                    <option value="closed">Ditutup</option>
                  </select>
                </label>
                <button className="danger-button" type="button" onClick={() => deleteApplication(application.id)}>
                  Hapus
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="admin-record-list">
          {records.map((record) => (
            <article className="admin-record" key={record.id}>
              <div>
                <h2>{record.name}</h2>
                <p>{record.species ? `${record.species} · ${record.breed}` : record.location}</p>
              </div>
              <div className="admin-record-actions">
                <span className={`admin-published ${record.is_published ? 'published' : ''}`}>
                  {record.is_published ? 'Dipublikasikan' : 'Draft'}
                </span>
                <button className="button-secondary" type="button" onClick={() => startEdit(record)}>Ubah</button>
                <button className="danger-button" type="button" onClick={() => deleteRecord(record)}>Hapus</button>
              </div>
            </article>
          ))}
        </div>
      )}
      <Link className="admin-public-link" to="/">Buka tampilan publik</Link>
    </section>
  )
}
