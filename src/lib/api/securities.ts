import { apiClient } from '@/lib/api/axios'
import type {
  Stock,
  Futures,
  Forex,
  StockListResponse,
  FuturesListResponse,
  ForexListResponse,
  SecurityFilters,
} from '@/types/security'

export async function getStocks(filters?: SecurityFilters): Promise<StockListResponse> {
  const params = new URLSearchParams()
  if (filters?.page) params.append('page', String(filters.page))
  if (filters?.page_size) params.append('page_size', String(filters.page_size))
  if (filters?.search) params.append('search', filters.search)
  if (filters?.exchange_acronym) params.append('exchange_acronym', filters.exchange_acronym)
  if (filters?.min_price) params.append('min_price', filters.min_price)
  if (filters?.max_price) params.append('max_price', filters.max_price)
  const response = await apiClient.get<StockListResponse>('/api/securities/stocks', { params })
  return response.data
}

export async function getStock(id: number): Promise<Stock> {
  const response = await apiClient.get<Stock>(`/api/securities/stocks/${id}`)
  return response.data
}

export async function getFutures(filters?: SecurityFilters): Promise<FuturesListResponse> {
  const params = new URLSearchParams()
  if (filters?.page) params.append('page', String(filters.page))
  if (filters?.page_size) params.append('page_size', String(filters.page_size))
  if (filters?.search) params.append('search', filters.search)
  if (filters?.exchange_acronym) params.append('exchange_acronym', filters.exchange_acronym)
  const response = await apiClient.get<FuturesListResponse>('/api/securities/futures', { params })
  return response.data
}

export async function getFuture(id: number): Promise<Futures> {
  const response = await apiClient.get<Futures>(`/api/securities/futures/${id}`)
  return response.data
}

export async function getForex(
  filters?: Pick<SecurityFilters, 'page' | 'page_size' | 'search'>
): Promise<ForexListResponse> {
  const params = new URLSearchParams()
  if (filters?.page) params.append('page', String(filters.page))
  if (filters?.page_size) params.append('page_size', String(filters.page_size))
  if (filters?.search) params.append('search', filters.search)
  const response = await apiClient.get<ForexListResponse>('/api/securities/forex', { params })
  return response.data
}

export async function getForexPair(id: number): Promise<Forex> {
  const response = await apiClient.get<Forex>(`/api/securities/forex/${id}`)
  return response.data
}
