import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import { usePortfolio } from '@/hooks/usePortfolio'
import * as portfolioApi from '@/lib/api/portfolio'
import { createMockHolding } from '@/__tests__/fixtures/portfolio-fixtures'

jest.mock('@/lib/api/portfolio')

beforeEach(() => jest.clearAllMocks())

describe('usePortfolio', () => {
  it('fetches portfolio holdings', async () => {
    const holdings = [createMockHolding({ id: 1 }), createMockHolding({ id: 2, ticker: 'MSFT' })]
    jest.mocked(portfolioApi.getPortfolio).mockResolvedValue({ holdings, total_count: 2 })

    const { result } = renderHook(() => usePortfolio(), { wrapper: createQueryWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.holdings).toHaveLength(2)
    expect(portfolioApi.getPortfolio).toHaveBeenCalledWith(undefined, undefined)
  })
})
