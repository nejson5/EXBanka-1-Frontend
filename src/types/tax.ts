export interface TaxRecord {
  id: number
  user_id: number
  first_name: string
  last_name: string
  email: string
  user_type: 'client' | 'actuary'
  unpaid_tax: string
  paid_tax_ytd: string
}

export interface TaxListResponse {
  tax_records: TaxRecord[]
  total_count: number
}

export interface TaxFilters {
  page?: number
  page_size?: number
  user_type?: 'client' | 'actuary'
  search?: string
}

export interface TaxCollectResponse {
  collected_count: number
  total_collected_rsd: string
  failed_count: number
}
