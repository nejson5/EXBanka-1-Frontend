export type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit'
export type OrderDirection = 'buy' | 'sell'
export type OrderStatus = 'pending' | 'approved' | 'declined'

export interface Order {
  id: number
  user_email?: string
  listing_id?: number
  holding_id?: number
  asset_ticker?: string
  asset_name?: string
  order_type: OrderType
  direction: OrderDirection
  quantity: number
  contract_size: number
  price_per_unit?: string
  limit_value?: string
  stop_value?: string
  all_or_none: boolean
  margin: boolean
  status: OrderStatus
  approved_by?: string
  is_done: boolean
  remaining_portions: number
  after_hours: boolean
  last_modification: string
  account_id?: number
}

export interface OrderListResponse {
  orders: Order[]
  total_count: number
}

export interface CreateOrderRequest {
  listing_id?: number
  holding_id?: number
  direction: OrderDirection
  order_type: OrderType
  quantity: number
  limit_value?: string
  stop_value?: string
  all_or_none?: boolean
  margin?: boolean
  account_id?: number
}

export interface OrderFilters {
  page?: number
  page_size?: number
  status?: string
  direction?: string
  order_type?: string
  agent_email?: string
}
