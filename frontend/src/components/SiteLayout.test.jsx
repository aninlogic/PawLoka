import { cleanup, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { SiteLayout } from './SiteLayout'

const destinations = [
  ['/', 'Beranda'],
  ['/pets', 'Hewan'],
  ['/shelters', 'Shelter'],
  ['/favorites', 'Favorite'],
  ['/applications', 'Riwayat'],
  ['/about', 'Profil'],
]

describe('SiteLayout navigation', () => {
  beforeEach(() => cleanup())

  it.each(destinations)('keeps one six-item bottom navigation with %s active', (path, label) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <SiteLayout />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'PawLoka, ke beranda' })).not.toHaveClass('active')
    expect(screen.queryByRole('link', { name: 'Temukan teman' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('navigation')).toHaveLength(1)
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument()

    const navigation = within(screen.getByRole('navigation', { name: 'Navigasi utama' }))
    const links = navigation.getAllByRole('link')
    const activeLinks = links.filter((link) => link.classList.contains('active'))

    expect(links).toHaveLength(6)
    expect(activeLinks).toHaveLength(1)
    expect(activeLinks[0]).toHaveTextContent(label)
    expect(navigation.getByRole('link', { name: 'Shelter' }).querySelector('svg')).toHaveClass(
      'lucide-building-2',
    )
    expect(navigation.getByRole('link', { name: 'Favorite' }).querySelector('svg')).toHaveClass(
      'lucide-heart',
    )
    expect(navigation.getByRole('link', { name: 'Riwayat' }).querySelector('svg')).toHaveClass(
      'lucide-clipboard-check',
    )
  })
})
