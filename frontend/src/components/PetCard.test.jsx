import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { PetCard } from './PetCard'

const pet = {
  id: 'pet-milo',
  name: 'Milo',
  species: 'dog',
  breed: 'Golden Retriever Mix',
  age_months: 18,
  sex: 'male',
  status: 'available',
  image_url: 'https://example.com/milo.jpg',
}

function CurrentPath() {
  const { pathname } = useLocation()
  return <output data-testid="current-path">{pathname}</output>
}

describe('PetCard', () => {
  beforeEach(() => {
    cleanup()
    localStorage.clear()
  })

  it('shows the pet summary and links to its detail page', () => {
    render(
      <MemoryRouter>
        <PetCard pet={pet} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /Milo/ })).toHaveAttribute('href', '/pets/pet-milo')
    expect(screen.getByText('Anjing · 1 tahun 6 bulan · Jantan')).toBeInTheDocument()
    expect(screen.getByText('Siap diadopsi')).toBeInTheDocument()
  })

  it('toggles and persists a favorite without navigating to the pet detail', async () => {
    const user = userEvent.setup()
    const { unmount } = render(
      <MemoryRouter initialEntries={['/pets']}>
        <PetCard pet={pet} />
        <CurrentPath />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Tambahkan Milo ke favorit' }))

    expect(screen.getByRole('button', { name: 'Hapus Milo dari favorit' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(JSON.parse(localStorage.getItem('pawloka:favorites'))).toEqual([pet.id])
    expect(screen.getByRole('link', { name: /Milo/ })).toHaveAttribute(
      'href',
      '/pets/pet-milo',
    )
    expect(screen.getByTestId('current-path')).toHaveTextContent('/pets')

    unmount()
    render(
      <MemoryRouter>
        <PetCard pet={pet} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: 'Hapus Milo dari favorit' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
})
