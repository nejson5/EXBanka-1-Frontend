import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { LoanDetails } from '@/components/loans/LoanDetails'
import { createMockLoan } from '@/__tests__/fixtures/loan-fixtures'

describe('LoanDetails', () => {
  it('renders loan number', () => {
    const loan = createMockLoan({ loan_number: 'LN-2026-00001' })
    renderWithProviders(<LoanDetails loan={loan} />)
    expect(screen.getByText('LN-2026-00001')).toBeInTheDocument()
  })

  it('renders loan type', () => {
    const loan = createMockLoan({ loan_type: 'CASH' })
    renderWithProviders(<LoanDetails loan={loan} />)
    expect(screen.getByText(/gotovinski/i)).toBeInTheDocument()
  })

  it('renders interest rate', () => {
    const loan = createMockLoan({ interest_rate: 8.5 })
    renderWithProviders(<LoanDetails loan={loan} />)
    expect(screen.getByText(/8\.5%/)).toBeInTheDocument()
  })
})
