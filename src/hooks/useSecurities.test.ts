import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import { useStocks } from '@/hooks/useSecurities'
import * as securitiesApi from '@/lib/api/securities'
import { createMockStock } from '@/__tests__/fixtures/security-fixtures'

jest.mock('@/lib/api/securities')

beforeEach(() => jest.clearAllMocks())

describe('useStocks', () => {
  it('fetches stocks and returns list', async () => {
    const stocks = [createMockStock({ id: 1 }), createMockStock({ id: 2, ticker: 'MSFT' })]
    jest.mocked(securitiesApi.getStocks).mockResolvedValue({ stocks, total_count: 2 })

    const { result } = renderHook(() => useStocks(), { wrapper: createQueryWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.stocks).toHaveLength(2)
    expect(securitiesApi.getStocks).toHaveBeenCalledWith(undefined)
  })

  it('passes filters to the API call', async () => {
    jest.mocked(securitiesApi.getStocks).mockResolvedValue({ stocks: [], total_count: 0 })
    const filters = { search: 'Apple', exchange_acronym: 'NASDAQ' }

    const { result } = renderHook(() => useStocks(filters), { wrapper: createQueryWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(securitiesApi.getStocks).toHaveBeenCalledWith(filters)
  })
})
