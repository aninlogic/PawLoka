import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { AboutPage } from './AboutPage'

const animationPreferenceKey = 'pawloka.about.backgroundAnimation'

function renderAboutPage(element = <AboutPage />) {
  return render(<MemoryRouter>{element}</MemoryRouter>)
}

function setReducedMotionPreference(matches) {
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    matches,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })))
}

describe('AboutPage', () => {
  beforeEach(() => {
    cleanup()
    localStorage.clear()
    vi.unstubAllGlobals()
  })

  afterEach(() => {
    cleanup()
    localStorage.clear()
    vi.unstubAllGlobals()
  })

  it('presents PawLoka, developer, features, technology, and transparent product notes', () => {
    renderAboutPage()

    expect(screen.getByRole('heading', { name: 'Setiap teman layak punya rumah.' })).toBeInTheDocument()
    expect(screen.getByText('Anindya Fairuz Az Zahra')).toBeInTheDocument()
    expect(screen.getByText('NIM 21120124120018')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Fitur PawLoka' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Pet Catalog' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Shelter Directory' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Adoption Application' })).toBeInTheDocument()
    expect(screen.getByText(/React, Vite, React Router, dan Axios/)).toBeInTheDocument()
    expect(screen.getByText(/Favorit disimpan di perangkat ini saja melalui localStorage/)).toBeInTheDocument()
    expect(screen.getByText(/Belum tersedia penyimpanan di database maupun sinkronisasi akun/)).toBeInTheDocument()
    expect(screen.getByText(/Data katalog, detail, dan permintaan API tetap memerlukan koneksi internet/)).toBeInTheDocument()
    expect(screen.getByText(/belum menyimpan nama fotografer atau metadata lisensi/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Jelajahi hewan/ })).toHaveAttribute('href', '/pets')
    expect(screen.getByRole('link', { name: 'Kenali proses adopsi' })).toHaveAttribute('href', '/adoption')
  })

  it('saves the background animation preference on this device', async () => {
    const user = userEvent.setup()
    setReducedMotionPreference(false)
    const { container } = renderAboutPage()
    const toggle = screen.getByRole('switch', { name: 'Animasi latar' })

    await waitFor(() => expect(toggle).toBeChecked())
    expect(container.querySelector('.about-page')).toHaveClass('about-page--animated')

    await user.click(toggle)

    expect(toggle).not.toBeChecked()
    expect(localStorage.getItem(animationPreferenceKey)).toBe('false')
    expect(container.querySelector('.about-page')).not.toHaveClass('about-page--animated')
  })

  it('keeps animation off when reduced motion is enabled', async () => {
    localStorage.setItem(animationPreferenceKey, 'true')
    setReducedMotionPreference(true)
    const { container } = renderAboutPage()
    const toggle = screen.getByRole('switch', { name: 'Animasi latar' })

    await waitFor(() => expect(toggle).toBeChecked())
    expect(container.querySelector('.about-page')).not.toHaveClass('about-page--animated')
    expect(screen.getByText(/pengaturan reduced motion/)).toBeInTheDocument()
  })

  it('preserves the existing not-found page', () => {
    renderAboutPage(<AboutPage notFound />)

    expect(screen.getByRole('heading', { name: 'Halaman tidak ditemukan' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Kembali ke beranda' })).toHaveAttribute('href', '/')
  })
})
