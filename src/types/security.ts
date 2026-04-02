export type SecurityType = 'stock' | 'futures' | 'forex' | 'option'

export interface Stock {
  id: number
  ticker: string
  name: string
  exchange_acronym: string
  ask: string
  bid: string
  price: string
  volume: number
  contract_size: number
  maintenance_margin?: string
  change?: string
  change_percent?: string
}

export interface Futures {
  id: number
  ticker: string
  name: string
  exchange_acronym: string
  ask: string
  bid: string
  price: string
  volume: number
  contract_size: number
  maintenance_margin?: string
  settlement_date?: string
}

export interface Forex {
  id: number
  base_currency: string
  quote_currency: string
  exchange_rate: string
  ask: string
  bid: string
  liquidity?: string
}

export interface StockListResponse {
  stocks: Stock[]
  total_count: number
}

export interface FuturesListResponse {
  futures: Futures[]
  total_count: number
}

export interface ForexListResponse {
  forex_pairs: Forex[]
  total_count: number
}

export interface SecurityFilters {
  page?: number
  page_size?: number
  search?: string
  exchange_acronym?: string
  min_price?: string
  max_price?: string
}
