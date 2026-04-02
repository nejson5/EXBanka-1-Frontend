export type HoldingType = 'stock' | 'futures' | 'option'

export interface Holding {
  id: number
  listing_id: number
  ticker: string
  name: string
  security_type: HoldingType
  quantity: number
  purchase_price: string
  current_price: string
  bid: string
  contract_size: number
  maintenance_margin?: string
}

export interface PortfolioListResponse {
  holdings: Holding[]
  total_count: number
}

export interface PortfolioSummary {
  total_value: string
  total_profit_loss: string
}
