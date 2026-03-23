import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { CreateTransferForm } from '@/components/transfers/CreateTransferForm'

const mockAccounts = [
  {
    id: 1,
    account_number: '111000100000000011',
    name: 'Tekući RSD',
    currency: 'RSD',
    available_balance: 50000,
  },
  {
    id: 2,
    account_number: '111000100000000022',
    name: 'Devizni EUR',
    currency: 'EUR',
    available_balance: 500,
  },
]

describe('CreateTransferForm', () => {
  const onSubmit = jest.fn()

  it('renders from/to account selectors and amount field', () => {
    renderWithProviders(<CreateTransferForm accounts={mockAccounts as any} onSubmit={onSubmit} />)
    expect(screen.getByLabelText(/source account/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/destination account/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument()
  })

  it('renders submit button', () => {
    renderWithProviders(<CreateTransferForm accounts={mockAccounts as any} onSubmit={onSubmit} />)
    expect(screen.getByText(/make transfer/i)).toBeInTheDocument()
  })
})
