import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AdminCardItem } from '@/components/admin/AdminCardItem'
import { createMockCard } from '@/__tests__/fixtures/card-fixtures'
import { maskCardNumber } from '@/lib/utils/format'

describe('AdminCardItem', () => {
  const onBlock = jest.fn()
  const onUnblock = jest.fn()
  const onDeactivate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders masked card number', () => {
    const card = createMockCard({ card_number: '4111111111111111' })
    renderWithProviders(
      <AdminCardItem
        card={card}
        onBlock={onBlock}
        onUnblock={onUnblock}
        onDeactivate={onDeactivate}
      />
    )
    expect(screen.getByText(maskCardNumber('4111111111111111'))).toBeInTheDocument()
  })

  it('ACTIVE status: shows Blokiraj button, no Odblokiraj or Deaktiviraj', () => {
    const card = createMockCard({ status: 'ACTIVE' })
    renderWithProviders(
      <AdminCardItem
        card={card}
        onBlock={onBlock}
        onUnblock={onUnblock}
        onDeactivate={onDeactivate}
      />
    )
    expect(screen.getByRole('button', { name: /blokiraj/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /odblokiraj/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /deaktiviraj/i })).not.toBeInTheDocument()
  })

  it('BLOCKED status: shows Odblokiraj and Deaktiviraj buttons, no Blokiraj', () => {
    const card = createMockCard({ status: 'BLOCKED' })
    renderWithProviders(
      <AdminCardItem
        card={card}
        onBlock={onBlock}
        onUnblock={onUnblock}
        onDeactivate={onDeactivate}
      />
    )
    expect(screen.getByRole('button', { name: /odblokiraj/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /deaktiviraj/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^blokiraj$/i })).not.toBeInTheDocument()
  })

  it('DEACTIVATED status: no action buttons', () => {
    const card = createMockCard({ status: 'DEACTIVATED' })
    renderWithProviders(
      <AdminCardItem
        card={card}
        onBlock={onBlock}
        onUnblock={onUnblock}
        onDeactivate={onDeactivate}
      />
    )
    expect(screen.queryByRole('button', { name: /blokiraj/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /odblokiraj/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /deaktiviraj/i })).not.toBeInTheDocument()
  })

  it('calls onBlock when Blokiraj is clicked', () => {
    const card = createMockCard({ status: 'ACTIVE', id: 42 })
    renderWithProviders(
      <AdminCardItem
        card={card}
        onBlock={onBlock}
        onUnblock={onUnblock}
        onDeactivate={onDeactivate}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /blokiraj/i }))
    expect(onBlock).toHaveBeenCalledWith(42)
  })
})
