import type { TaxRecord } from '@/types/tax'

export function createMockTaxRecord(overrides: Partial<TaxRecord> = {}): TaxRecord {
  return {
    id: 1,
    user_id: 101,
    first_name: 'Marko',
    last_name: 'Marković',
    email: 'marko.markovic@example.com',
    user_type: 'client',
    unpaid_tax: '1500.00',
    paid_tax_ytd: '4500.00',
    ...overrides,
  }
}
