// @vitest-environment jsdom
import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Dashboard } from './Dashboard'

describe('Dashboard', () => {
  test('renders sidebar with project list heading', () => {
    render(<Dashboard />)

    expect(screen.getAllByRole('heading', { name: /projects/i }).length).toBeGreaterThan(0)
  })

  test('renders empty state message in main area', () => {
    render(<Dashboard />)

    expect(screen.getAllByText(/no projects yet/i).length).toBeGreaterThan(0)
  })

  test('renders prompt to create first project', () => {
    render(<Dashboard />)

    expect(screen.getAllByText(/create your first project/i).length).toBeGreaterThan(0)
  })
})
