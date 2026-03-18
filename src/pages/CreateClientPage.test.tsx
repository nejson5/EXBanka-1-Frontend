import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { CreateClientPage } from '@/pages/CreateClientPage'

jest.mock('@/lib/api/clients')

describe('CreateClientPage', () => {
  it('renders form title and required fields', () => {
    renderWithProviders(<CreateClientPage />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/novi klijent/i)
    expect(screen.getByLabelText('Ime')).toBeInTheDocument()
    expect(screen.getByLabelText('Prezime')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('renders back button', () => {
    renderWithProviders(<CreateClientPage />)
    expect(screen.getByRole('button', { name: /nazad/i })).toBeInTheDocument()
  })
})
