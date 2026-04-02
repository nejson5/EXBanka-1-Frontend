export type HoldingType = 'stock' | 'futures' | 'option'

export interface Holding {
  id: number
  security_type: HoldingType
  ticker: string
  name: string
  quantity: number
  average_price: string
  current_price: string
  profit: string
  public_quantity: number
  account_id: number
  last_modified: string
  settlement_date?: string // options only
  is_in_the_money?: boolean // options only
}

export interface PortfolioListResponse {
  holdings: Holding[]
  total_count: number
}

export interface PortfolioSummary {
  total_value: string
  total_profit_loss: string
}

export interface MakePublicRequest {
  quantity: number
}
