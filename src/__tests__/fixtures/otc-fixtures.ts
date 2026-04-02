import type { OtcOffer } from '@/types/otc'

export function createMockOtcOffer(overrides: Partial<OtcOffer> = {}): OtcOffer {
  return {
    id: 1,
    ticker: 'AAPL',
    name: 'Apple Inc.',
    security_type: 'stock',
    quantity: 5,
    price: '175.00',
    seller_id: 42,
    ...overrides,
  }
}
