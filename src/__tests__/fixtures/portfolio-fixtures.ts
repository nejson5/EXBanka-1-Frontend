import type { Holding } from '@/types/portfolio'

export function createMockHolding(overrides: Partial<Holding> = {}): Holding {
  return {
    id: 1,
    security_type: 'stock',
    ticker: 'AAPL',
    name: 'Apple Inc.',
    quantity: 10,
    average_price: '150.00',
    current_price: '175.00',
    profit: '250.00',
    public_quantity: 0,
    account_id: 42,
    last_modified: '2026-04-01T12:00:00Z',
    ...overrides,
  }
}
