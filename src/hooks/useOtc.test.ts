import { renderHook, act } from '@testing-library/react'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import { useOtcOffers, useBuyOtcOffer } from '@/hooks/useOtc'
import * as otcApi from '@/lib/api/otc'

jest.mock('@/lib/api/otc')

const mockGetOtcOffers = jest.mocked(otcApi.getOtcOffers)
const mockBuyOtcOffer = jest.mocked(otcApi.buyOtcOffer)

beforeEach(() => jest.clearAllMocks())

describe('useOtcOffers', () => {
  it('calls getOtcOffers with provided filters', async () => {
    mockGetOtcOffers.mockResolvedValue({ offers: [], total_count: 0 })
    const filters = { ticker: 'AAPL' }
    renderHook(() => useOtcOffers(filters), { wrapper: createQueryWrapper() })
    await act(async () => {})
    expect(mockGetOtcOffers).toHaveBeenCalledWith(filters)
  })
})

describe('useBuyOtcOffer', () => {
  it('calls buyOtcOffer with id and payload on mutate', async () => {
    mockBuyOtcOffer.mockResolvedValue(undefined)
    const { result } = renderHook(() => useBuyOtcOffer(), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      result.current.mutate({ id: 3, quantity: 2, account_id: 42 })
    })
    expect(mockBuyOtcOffer).toHaveBeenCalledWith(3, { quantity: 2, account_id: 42 })
  })
})
