import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AccountTable } from '@/components/admin/AccountTable'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'

describe('AccountTable', () => {
  it('renders account rows', () => {
    const accounts = [createMockAccount()]
    renderWithProviders(<AccountTable accounts={accounts} onViewCards={jest.fn()} />)
    expect(screen.getByText(accounts[0].owner_name!)).toBeInTheDocument()
  })

  it('calls onViewCards when button clicked', async () => {
    const onViewCards = jest.fn()
    renderWithProviders(<AccountTable accounts={[createMockAccount()]} onViewCards={onViewCards} />)
    await userEvent.click(screen.getByRole('button', { name: /kartice/i }))
    expect(onViewCards).toHaveBeenCalledWith(1)
  })
})
