import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { LoanApplicationForm } from '@/components/loans/LoanApplicationForm'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'

const mockAccounts = [
  createMockAccount({ account_number: '111000100000000011', name: 'Tekući RSD', currency: 'RSD' }),
  createMockAccount({ account_number: '111000100000000022', name: 'EUR štednja', currency: 'EUR' }),
]

const defaultProps = {
  accounts: mockAccounts,
  onSubmit: jest.fn(),
  submitting: false,
  error: null,
}

describe('LoanApplicationForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loan type selector', () => {
    renderWithProviders(<LoanApplicationForm {...defaultProps} />)
    expect(screen.getByText(/tip kredita/i)).toBeInTheDocument()
  })

  it('renders amount input', () => {
    renderWithProviders(<LoanApplicationForm {...defaultProps} />)
    expect(screen.getByLabelText(/iznos/i)).toBeInTheDocument()
  })

  it('renders submit button', () => {
    renderWithProviders(<LoanApplicationForm {...defaultProps} />)
    expect(screen.getByRole('button', { name: /podnesi zahtev/i })).toBeInTheDocument()
  })

  it('shows loading state when submitting is true', () => {
    renderWithProviders(<LoanApplicationForm {...defaultProps} submitting={true} />)
    expect(screen.getByRole('button', { name: /podnošenje/i })).toBeDisabled()
  })

  it('shows error message when error is provided', () => {
    const errorMessage = 'Greška pri podnošenju zahteva'
    renderWithProviders(<LoanApplicationForm {...defaultProps} error={errorMessage} />)
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })
})
