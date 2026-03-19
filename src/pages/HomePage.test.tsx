import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { HomePage } from '@/pages/HomePage'
import * as useAccountsHook from '@/hooks/useAccounts'
import * as usePaymentsHook from '@/hooks/usePayments'
import * as useExchangeHook from '@/hooks/useExchange'
import { createMockAuthState } from '@/__tests__/fixtures/auth-fixtures'

jest.mock('@/hooks/useAccounts')
jest.mock('@/hooks/usePayments')
jest.mock('@/hooks/useExchange')

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useAccountsHook.useClientAccounts).mockReturnValue({
      data: { accounts: [], total_count: 0 },
      isLoading: false,
    } as any)
    jest.mocked(usePaymentsHook.usePaymentRecipients).mockReturnValue({
      data: [],
      isLoading: false,
    } as any)
    jest.mocked(useExchangeHook.useConvertCurrency).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      data: undefined,
    } as any)
  })

  it('renders welcome message and quick action widgets', () => {
    renderWithProviders(<HomePage />, {
      preloadedState: { auth: createMockAuthState() },
    })
    expect(screen.getByText(/dobrodošli/i)).toBeInTheDocument()
    expect(screen.getByText(/sačuvani primaoci/i)).toBeInTheDocument()
    expect(screen.getByText(/brza konverzija/i)).toBeInTheDocument()
  })
})
