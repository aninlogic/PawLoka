import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { AppRoutes } from './App'
import { whatsappNumber } from './config/whatsapp'
import {
  fetchApplication,
  fetchPet,
  fetchPets,
  fetchShelters,
  submitApplication,
} from './api/client'

vi.mock('./api/client', () => ({
  fetchApplication: vi.fn(),
  fetchPet: vi.fn(),
  fetchPets: vi.fn(),
  fetchShelters: vi.fn(),
  submitApplication: vi.fn(),
}))

const milo = {
  id: '10000000-0000-4000-8000-000000000001',
  shelter_id: '20000000-0000-4000-8000-000000000001',
  name: 'Milo',
  species: 'dog',
  breed: 'Golden Retriever Mix',
  age_months: 18,
  sex: 'male',
  description: 'Ramah dan aktif.',
  status: 'available',
  image_url: 'https://example.test/milo.jpg',
  shelter: {
    id: '20000000-0000-4000-8000-000000000001',
    name: 'Paw Haven',
    location: 'Bandung',
    phone: '+62 812-3456-7890',
  },
}

const luna = {
  ...milo,
  id: '10000000-0000-4000-8000-000000000002',
  name: 'Luna',
  species: 'cat',
  sex: 'female',
}

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  )
}

describe('public browsing journeys', () => {
  beforeEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.clearAllMocks()
    localStorage.clear()
    fetchPets.mockResolvedValue([milo, luna])
    fetchPet.mockResolvedValue(milo)
    fetchShelters.mockResolvedValue([])
    fetchApplication.mockResolvedValue({
      id: '30000000-0000-4000-8000-000000000001',
      status: 'pending',
      created_at: '2026-11-17T12:00:00.000Z',
      pet: { id: milo.id, name: milo.name, species: milo.species, image_url: milo.image_url },
      shelter: { name: 'Paw Haven' },
    })
    submitApplication.mockResolvedValue({
      id: '30000000-0000-4000-8000-000000000001',
      status: 'pending',
      created_at: '2026-11-17T12:00:00.000Z',
      access_token: 'a'.repeat(64),
    })
  })

  it('opens the selected pet detail from the catalog', async () => {
    const user = userEvent.setup()
    renderAt('/pets')

    const petLink = await screen.findByRole('link', { name: /Milo/ })
    await user.click(petLink)

    expect(await screen.findByRole('heading', { name: 'Milo' })).toBeInTheDocument()
    expect(screen.getByText('Golden Retriever Mix')).toBeInTheDocument()
    expect(screen.getByText('Paw Haven')).toBeInTheDocument()
    const adoptionLink = screen.getByRole('link', { name: 'Ajukan Adopsi' })
    expect(adoptionLink).toHaveAttribute('href', `/apply/${milo.id}`)
    expect(screen.queryByRole('link', { name: 'Isi formulir pengajuan di PawLoka' }))
      .not.toBeInTheDocument()
    await user.click(adoptionLink)
    expect(await screen.findByRole('heading', { name: 'Ajukan adopsi Milo' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Baca selengkapnya' })).not.toBeInTheDocument()
    expect(fetchPet).toHaveBeenCalledWith(milo.id, expect.any(Object))
  })

  it('loads the detail for the pet selected from the catalog', async () => {
    const user = userEvent.setup()
    fetchPet.mockImplementation(async (id) => (id === luna.id ? luna : milo))
    renderAt('/pets')

    await user.click(await screen.findByRole('link', { name: /Luna/ }))

    expect(await screen.findByRole('heading', { name: 'Luna' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Luna, Kucing' })).toBeInTheDocument()
    expect(fetchPet).toHaveBeenLastCalledWith(luna.id, expect.any(Object))
  })

  it('omits pet details that are absent from the API response', async () => {
    fetchPet.mockResolvedValue({
      ...milo,
      breed: '',
      age_months: null,
      sex: null,
      shelter: null,
    })
    renderAt(`/pets/${milo.id}`)

    await screen.findByRole('heading', { name: 'Milo' })

    expect(screen.queryByText('Ras')).not.toBeInTheDocument()
    expect(screen.queryByText('Usia')).not.toBeInTheDocument()
    expect(screen.queryByText('Jenis kelamin')).not.toBeInTheDocument()
    expect(screen.queryByText('Lokasi')).not.toBeInTheDocument()
    expect(screen.queryByText('Tinggi badan')).not.toBeInTheDocument()
    expect(screen.queryByText('Berat badan')).not.toBeInTheDocument()
  })

  it('shows loading while the pet detail request is pending', async () => {
    let resolveRequest
    fetchPet.mockReturnValue(new Promise((resolve) => {
      resolveRequest = resolve
    }))
    renderAt(`/pets/${milo.id}`)

    expect(screen.getByRole('status')).toHaveTextContent('Memuat detail hewan')
    resolveRequest(milo)
    expect(await screen.findByRole('heading', { name: 'Milo' })).toBeInTheDocument()
  })

  it('shows an error and a catalog route when the detail request fails', async () => {
    fetchPet.mockRejectedValue({ response: { status: 404 } })
    renderAt(`/pets/${milo.id}`)

    expect(await screen.findByRole('alert')).toHaveTextContent('Hewan tidak ditemukan.')
    expect(screen.getByRole('link', { name: 'Kembali ke katalog' })).toHaveAttribute(
      'href',
      '/pets',
    )
  })

  it('expands a long description on request', async () => {
    const user = userEvent.setup()
    const description = 'Milo suka berjalan sore bersama keluarga barunya. '.repeat(8).trim()
    fetchPet.mockResolvedValue({ ...milo, description })
    renderAt(`/pets/${milo.id}`)

    const readMore = await screen.findByRole('button', { name: 'Baca selengkapnya' })
    expect(readMore).toHaveAttribute('aria-expanded', 'false')
    await user.click(readMore)

    expect(screen.getByText(description)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tampilkan lebih sedikit' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  it('stores the favorite on this device and restores it on the next visit', async () => {
    const user = userEvent.setup()
    const { unmount } = renderAt(`/pets/${milo.id}`)
    const favoriteButton = await screen.findByRole('button', { name: 'Tambahkan ke favorit' })

    await user.click(favoriteButton)

    expect(favoriteButton).toHaveAttribute('aria-pressed', 'true')
    expect(JSON.parse(localStorage.getItem('pawloka:favorites'))).toEqual([milo.id])

    unmount()
    renderAt(`/pets/${milo.id}`)

    expect(await screen.findByRole('button', { name: 'Hapus dari favorit' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it.each([
    ['reserved', 'Sedang diproses'],
    ['adopted', 'Sudah menemukan rumah'],
  ])('disables the adoption action for %s pets', async (status, label) => {
    fetchPet.mockResolvedValue({ ...milo, status })
    renderAt(`/pets/${milo.id}`)

    expect(await screen.findByRole('button', { name: label })).toBeDisabled()
    expect(document.querySelector(`a[href="/apply/${milo.id}"]`)).not.toBeInTheDocument()
  })

  it('passes species and age filters from the catalog controls to the API client', async () => {
    renderAt('/pets')
    await screen.findByRole('link', { name: /Milo/ })

    fireEvent.change(screen.getByRole('combobox', { name: 'Jenis hewan' }), {
      target: { value: 'cat' },
    })
    fireEvent.change(screen.getByRole('combobox', { name: 'Usia hewan' }), {
      target: { value: 'young' },
    })

    await waitFor(() => {
      expect(fetchPets).toHaveBeenLastCalledWith(
        expect.objectContaining({ species: 'cat', age: 'young' }),
        expect.any(Object),
      )
    })
  })

  it.each([
    ['turtle', 'Kura-kura'],
    ['fish', 'Ikan Hias'],
    ['hedgehog', 'Landak Mini'],
  ])('passes %s as the API species filter and displays its Indonesian name', async (species, label) => {
    const { unmount } = renderAt('/pets')
    await screen.findByRole('link', { name: /Milo/ })

    const speciesFilter = screen.getByRole('combobox', { name: 'Jenis hewan' })
    expect(screen.getByRole('option', { name: label })).toHaveValue(species)
    fireEvent.change(speciesFilter, { target: { value: species } })
    await waitFor(() => {
      expect(fetchPets).toHaveBeenLastCalledWith(
        expect.objectContaining({ species }),
        expect.any(Object),
      )
    })

    unmount()
    fetchPet.mockResolvedValue({ ...milo, species, image_url: '' })
    renderAt(`/pets/${milo.id}`)
    expect(await screen.findByText(label)).toBeInTheDocument()
    expect(screen.getByRole('img', { name: `Milo, ${label}` })).toHaveAttribute(
      'src',
      '/shelter-fallback.svg',
    )
  })

  it('shows an error state when the catalog API fails', async () => {
    fetchPets.mockRejectedValue(new Error('offline'))
    renderAt('/pets')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Katalog belum dapat dimuat.',
    )
  })

  it('submits without an applicant phone, stores its claim token, and opens a prefilled WhatsApp draft', async () => {
    const user = userEvent.setup()
    const whatsappWindow = { opener: window, location: { href: '' }, close: vi.fn() }
    const openWindow = vi.spyOn(window, 'open').mockReturnValue(whatsappWindow)
    renderAt(`/apply/${milo.id}`)

    await user.type(await screen.findByLabelText('Nama lengkap'), 'Nadia Adopsi')
    await user.type(screen.getByLabelText('Domisili'), 'Bandung')
    await user.type(screen.getByLabelText('Alasan ingin mengadopsi'), 'Saya siap memberi rumah yang aman.')
    await user.type(screen.getByLabelText('Pengalaman memelihara hewan'), 'Pernah merawat kucing.')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Kirim Pengajuan' }))

    expect(await screen.findByRole('heading', { name: 'Pengajuan Berhasil Disimpan!' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Nomor WhatsApp')).not.toBeInTheDocument()
    expect(submitApplication).toHaveBeenCalledWith(expect.objectContaining({
      pet_id: milo.id,
      applicant_name: 'Nadia Adopsi',
      domicile: 'Bandung',
      adoption_reason: 'Saya siap memberi rumah yang aman.',
      pet_experience: 'Pernah merawat kucing.',
      consent: true,
    }))
    expect(submitApplication.mock.calls[0][0]).not.toHaveProperty('phone')
    expect(openWindow).toHaveBeenCalledWith('about:blank', '_blank')
    expect(whatsappWindow.opener).toBeNull()
    const whatsappLink = screen.getByRole('link', { name: 'Buka WhatsApp' })
    const message = new URL(whatsappLink.href).searchParams.get('text')
    expect(whatsappWindow.location.href).toBe(whatsappLink.href)
    expect(whatsappLink.href).toContain(`https://wa.me/${whatsappNumber}`)
    expect(message).toContain('Nama calon adopter: Nadia Adopsi')
    expect(message).toContain('hewan bernama Milo')
    expect(message).toContain('Jenis hewan: Anjing')
    expect(message).toContain('Shelter asal: Paw Haven')
    expect(message).toContain('Domisili: Bandung')
    expect(message).toContain('Alasan adopsi: Saya siap memberi rumah yang aman.')
    expect(localStorage.getItem('pawloka:application-history')).toContain('a'.repeat(64))
    expect(screen.getByRole('status').textContent).toMatch(/belum terkirim sampai kamu menekan tombol Kirim/)
  })

  it('uses the global WhatsApp number regardless of the pet shelter phone', async () => {
    const user = userEvent.setup()
    const whatsappWindow = { opener: window, location: { href: '' }, close: vi.fn() }
    vi.spyOn(window, 'open').mockReturnValue(whatsappWindow)
    fetchPet.mockResolvedValue({ ...milo, shelter: { ...milo.shelter, phone: '+62 877-0000-0000' } })
    renderAt(`/apply/${milo.id}`)

    await user.type(await screen.findByLabelText('Nama lengkap'), 'Nadia Adopsi')
    await user.type(screen.getByLabelText('Domisili'), 'Bandung')
    await user.type(screen.getByLabelText('Alasan ingin mengadopsi'), 'Saya siap memberi rumah yang aman.')
    await user.type(screen.getByLabelText('Pengalaman memelihara hewan'), 'Pernah merawat kucing.')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Kirim Pengajuan' }))

    expect(await screen.findByRole('heading', { name: 'Pengajuan Berhasil Disimpan!' })).toBeInTheDocument()
    expect(whatsappWindow.location.href).toContain(`https://wa.me/${whatsappNumber}`)
    expect(whatsappWindow.location.href).not.toContain('87700000000')
    expect(screen.getByRole('link', { name: 'Buka WhatsApp' })).toBeInTheDocument()
  })

  it('keeps a WhatsApp fallback link when the browser blocks the automatic tab', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'open').mockReturnValue(null)
    renderAt(`/apply/${milo.id}`)

    await user.type(await screen.findByLabelText('Nama lengkap'), 'Nadia Adopsi')
    await user.type(screen.getByLabelText('Domisili'), 'Bandung')
    await user.type(screen.getByLabelText('Alasan ingin mengadopsi'), 'Saya siap memberi rumah yang aman.')
    await user.type(screen.getByLabelText('Pengalaman memelihara hewan'), 'Pernah merawat kucing.')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Kirim Pengajuan' }))

    expect(await screen.findByRole('heading', { name: 'Pengajuan Berhasil Disimpan!' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('tidak terbuka otomatis')
    expect(screen.getByRole('link', { name: 'Buka WhatsApp' })).toHaveAttribute(
      'href',
      expect.stringContaining(`https://wa.me/${whatsappNumber}`),
    )
  })

  it('prevents a direct application route for a pet that is no longer available', async () => {
    fetchPet.mockResolvedValue({ ...milo, status: 'adopted' })
    renderAt(`/apply/${milo.id}`)

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Milo sudah menemukan rumah untuk pengajuan adopsi.',
    )
    expect(screen.queryByRole('button', { name: 'Kirim Pengajuan' })).not.toBeInTheDocument()
  })

  it('does not show a saved confirmation when the application API rejects the submission', async () => {
    const user = userEvent.setup()
    const whatsappWindow = { opener: window, location: { href: '' }, close: vi.fn() }
    vi.spyOn(window, 'open').mockReturnValue(whatsappWindow)
    submitApplication.mockRejectedValue({
      response: { data: { error: { message: 'Pengajuan belum aktif pada mode demo lokal.' } } },
    })
    renderAt(`/apply/${milo.id}`)

    await user.type(await screen.findByLabelText('Nama lengkap'), 'Nadia Adopsi')
    await user.type(screen.getByLabelText('Domisili'), 'Bandung')
    await user.type(screen.getByLabelText('Alasan ingin mengadopsi'), 'Saya siap memberi rumah yang aman.')
    await user.type(screen.getByLabelText('Pengalaman memelihara hewan'), 'Pernah merawat kucing.')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Kirim Pengajuan' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Pengajuan belum aktif pada mode demo lokal.',
    )
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Data pengajuan belum tersimpan ke database.',
    )
    expect(screen.getByLabelText('Nama lengkap')).toHaveValue('Nadia Adopsi')
    expect(screen.getByLabelText('Domisili')).toHaveValue('Bandung')
    expect(whatsappWindow.close).not.toHaveBeenCalled()
    expect(whatsappWindow.opener).toBeNull()
    const whatsappLink = screen.getByRole('link', { name: 'Lanjut ke WhatsApp' })
    expect(whatsappWindow.location.href).toBe(whatsappLink.href)
    expect(whatsappLink.href).toContain(`https://wa.me/${whatsappNumber}`)
    const message = new URL(whatsappLink.href).searchParams.get('text')
    expect(message).toContain('Nama calon adopter: Nadia Adopsi')
    expect(message).toContain('hewan bernama Milo')
    expect(screen.queryByRole('heading', { name: 'Pengajuan Berhasil Disimpan!' })).not.toBeInTheDocument()
  })

  it('offers the WhatsApp fallback after a failed save when the popup is blocked', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'open').mockReturnValue(null)
    submitApplication.mockRejectedValue(new Error('offline'))
    renderAt(`/apply/${milo.id}`)

    await user.type(await screen.findByLabelText('Nama lengkap'), 'Nadia Adopsi')
    await user.type(screen.getByLabelText('Domisili'), 'Bandung')
    await user.type(screen.getByLabelText('Alasan ingin mengadopsi'), 'Saya siap memberi rumah yang aman.')
    await user.type(screen.getByLabelText('Pengalaman memelihara hewan'), 'Pernah merawat kucing.')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Kirim Pengajuan' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Data pengajuan belum tersimpan ke database.',
    )
    expect(screen.queryByRole('heading', { name: 'Pengajuan Berhasil Disimpan!' }))
      .not.toBeInTheDocument()
    const whatsappLink = screen.getByRole('link', { name: 'Lanjut ke WhatsApp' })
    expect(whatsappLink).toHaveAttribute('target', '_blank')
    expect(whatsappLink.href).toContain(`https://wa.me/${whatsappNumber}`)
    expect(new URL(whatsappLink.href).searchParams.get('text'))
      .toContain('Nama calon adopter: Nadia Adopsi')
  })

  it('prevents duplicate submissions while the application save is pending', async () => {
    const user = userEvent.setup()
    let resolveSubmission
    const whatsappWindow = { opener: window, location: { href: '' }, close: vi.fn() }
    vi.spyOn(window, 'open').mockReturnValue(whatsappWindow)
    submitApplication.mockReturnValue(new Promise((resolve) => {
      resolveSubmission = resolve
    }))
    const { container } = renderAt(`/apply/${milo.id}`)

    await user.type(await screen.findByLabelText('Nama lengkap'), 'Nadia Adopsi')
    await user.type(screen.getByLabelText('Domisili'), 'Bandung')
    await user.type(screen.getByLabelText('Alasan ingin mengadopsi'), 'Saya siap memberi rumah yang aman.')
    await user.type(screen.getByLabelText('Pengalaman memelihara hewan'), 'Pernah merawat kucing.')
    await user.click(screen.getByRole('checkbox'))
    const submitButton = screen.getByRole('button', { name: 'Kirim Pengajuan' })
    await user.click(submitButton)

    expect(submitButton).toBeDisabled()
    fireEvent.submit(container.querySelector('form'))
    expect(submitApplication).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('heading', { name: 'Pengajuan Berhasil Disimpan!' }))
      .not.toBeInTheDocument()

    await act(async () => {
      resolveSubmission({
        id: '30000000-0000-4000-8000-000000000001',
        status: 'pending',
        created_at: '2026-11-17T12:00:00.000Z',
        access_token: 'a'.repeat(64),
      })
    })
    expect(await screen.findByRole('heading', { name: 'Pengajuan Berhasil Disimpan!' }))
      .toBeInTheDocument()
  })

  it('shows the saved application history using its device token and supports removing it', async () => {
    const user = userEvent.setup()
    localStorage.setItem('pawloka:application-history', JSON.stringify([{
      id: '30000000-0000-4000-8000-000000000001',
      accessToken: 'b'.repeat(64),
    }]))
    renderAt('/applications')

    expect(await screen.findByRole('heading', { name: 'Milo' })).toBeInTheDocument()
    expect(screen.getByText('Menunggu Konfirmasi')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Milo' })).toHaveAttribute('src', milo.image_url)
    expect(screen.getByText(/Paw Haven/)).toBeInTheDocument()
    expect(fetchApplication).toHaveBeenCalledWith(
      '30000000-0000-4000-8000-000000000001',
      'b'.repeat(64),
    )
    await user.click(screen.getByRole('button', { name: 'Hapus dari perangkat' }))

    expect(await screen.findByRole('heading', { name: 'Belum ada riwayat di perangkat ini' })).toBeInTheDocument()
    expect(localStorage.getItem('pawloka:application-history')).toBe('[]')
  })

  it.each([
    ['pending', 'Menunggu Konfirmasi'],
    ['reviewing', 'Sedang Diproses'],
    ['approved', 'Disetujui'],
    ['declined', 'Ditolak'],
    ['closed', 'Ditutup'],
  ])('renders the current server status %s in application history', async (status, label) => {
    localStorage.setItem('pawloka:application-history', JSON.stringify([{
      id: '30000000-0000-4000-8000-000000000001',
      accessToken: 'c'.repeat(64),
    }]))
    fetchApplication.mockResolvedValue({
      id: '30000000-0000-4000-8000-000000000001',
      status,
      created_at: '2026-11-17T12:00:00.000Z',
      pet: { id: milo.id, name: milo.name, species: milo.species, image_url: milo.image_url },
      shelter: { name: 'Paw Haven' },
    })
    renderAt('/applications')

    const statusBadge = await screen.findByText(label)
    expect(statusBadge).toHaveClass('application-status', `application-status--${status}`)
  })

  it('keeps the existing adoption guide route available', async () => {
    renderAt('/adoption')
    expect(await screen.findByRole('heading', { name: 'Adopsi dengan hati dan persiapan' })).toBeInTheDocument()
  })
})
