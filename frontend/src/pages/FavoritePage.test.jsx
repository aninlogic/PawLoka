import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { fetchPet } from '../api/client'
import { FavoritePage } from './FavoritePage'

vi.mock('../api/client', () => ({
  fetchPet: vi.fn(),
}))

const milo = {
  id: '10000000-0000-4000-8000-000000000001',
  name: 'Milo',
  species: 'dog',
  breed: 'Golden Retriever Mix',
  age_months: 18,
  sex: 'male',
  description: 'Ramah dan aktif.',
  status: 'available',
  image_url: '',
}

function renderFavoritePage() {
  return render(
    <MemoryRouter>
      <FavoritePage />
    </MemoryRouter>,
  )
}

describe('FavoritePage', () => {
  beforeEach(() => {
    cleanup()
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('loads favorite pets by ID from the API and removes them from storage', async () => {
    const user = userEvent.setup()
    localStorage.setItem('pawloka:favorites', JSON.stringify([milo.id]))
    fetchPet.mockResolvedValue(milo)
    renderFavoritePage()

    expect(await screen.findByRole('link', { name: /Milo/ })).toBeInTheDocument()
    expect(fetchPet).toHaveBeenCalledWith(milo.id, expect.any(Object))

    await user.click(screen.getByRole('button', { name: 'Hapus Milo dari Favorite' }))

    expect(screen.getByRole('heading', { name: 'Belum ada hewan Favorite' })).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('pawloka:favorites'))).toEqual([])
  })

  it('offers removal when a previously saved pet is no longer public', async () => {
    const user = userEvent.setup()
    localStorage.setItem('pawloka:favorites', JSON.stringify([milo.id]))
    fetchPet.mockRejectedValue({ response: { status: 404 } })
    renderFavoritePage()

    expect(await screen.findByText('Hewan Favorite ini sudah tidak tersedia di katalog.'))
      .toBeInTheDocument()
    await user.click(screen.getByRole('button', {
      name: 'Hapus hewan yang tidak tersedia dari Favorite',
    }))

    expect(screen.getByRole('heading', { name: 'Belum ada hewan Favorite' })).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('pawloka:favorites'))).toEqual([])
  })

  it('shows a retry action when a saved pet cannot be loaded', async () => {
    const user = userEvent.setup()
    localStorage.setItem('pawloka:favorites', JSON.stringify([milo.id]))
    fetchPet.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(milo)
    renderFavoritePage()

    await user.click(await screen.findByRole('button', { name: 'Coba lagi' }))

    expect(await screen.findByRole('link', { name: /Milo/ })).toBeInTheDocument()
    expect(fetchPet).toHaveBeenCalledTimes(2)
  })

  it('shows an empty-state button that opens the catalog', () => {
    renderFavoritePage()

    expect(screen.getByRole('heading', { name: 'Belum ada hewan Favorite' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Jelajahi Hewan' })).toHaveAttribute('href', '/pets')
  })
})
