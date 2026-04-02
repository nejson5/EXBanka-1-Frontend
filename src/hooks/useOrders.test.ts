import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import { useMyOrders } from '@/hooks/useOrders'
import * as ordersApi from '@/lib/api/orders'
import { createMockOrder } from '@/__tests__/fixtures/order-fixtures'

jest.mock('@/lib/api/orders')

beforeEach(() => jest.clearAllMocks())

describe('useMyOrders', () => {
  it('fetches current user orders', async () => {
    const orders = [createMockOrder({ id: 1 }), createMockOrder({ id: 2 })]
    jest.mocked(ordersApi.getMyOrders).mockResolvedValue({ orders, total_count: 2 })

    const { result } = renderHook(() => useMyOrders(), { wrapper: createQueryWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.orders).toHaveLength(2)
    expect(ordersApi.getMyOrders).toHaveBeenCalledWith(undefined)
  })
})
