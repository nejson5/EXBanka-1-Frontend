import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AccountFilters } from '@/components/admin/AccountFilters'

describe('AccountFilters', () => {
  it('renders filter inputs', () => {
    renderWithProviders(
      <AccountFilters
        ownerName=""
        onOwnerNameChange={jest.fn()}
        accountNumber=""
        onAccountNumberChange={jest.fn()}
      />
    )
    expect(screen.getByPlaceholderText(/ime vlasnika/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/broj računa/i)).toBeInTheDocument()
  })

  it('calls onChange when typing', async () => {
    const onOwnerNameChange = jest.fn()
    renderWithProviders(
      <AccountFilters
        ownerName=""
        onOwnerNameChange={onOwnerNameChange}
        accountNumber=""
        onAccountNumberChange={jest.fn()}
      />
    )
    await userEvent.type(screen.getByPlaceholderText(/ime vlasnika/i), 'M')
    expect(onOwnerNameChange).toHaveBeenCalledWith('M')
  })
})
