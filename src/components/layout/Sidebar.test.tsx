import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { Sidebar } from '@/components/layout/Sidebar'
import { createMockAuthState } from '@/__tests__/fixtures/auth-fixtures'

describe('Sidebar', () => {
  it('shows employee management link', () => {
    renderWithProviders(<Sidebar />, {
      preloadedState: { auth: createMockAuthState() },
    })
    expect(screen.getByRole('link', { name: /employees/i })).toHaveAttribute('href', '/employees')
  })

  it('shows logout button', () => {
    renderWithProviders(<Sidebar />, {
      preloadedState: { auth: createMockAuthState() },
    })
    expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument()
  })

  it('displays user email', () => {
    renderWithProviders(<Sidebar />, {
      preloadedState: { auth: createMockAuthState() },
    })
    expect(screen.getByText('admin@test.com')).toBeInTheDocument()
  })
})
