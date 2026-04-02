import { apiClient } from '@/lib/api/axios'
import type { Order, OrderListResponse, CreateOrderRequest, OrderFilters } from '@/types/order'

export async function createOrder(payload: CreateOrderRequest): Promise<Order> {
  const response = await apiClient.post<Order>('/api/me/orders', payload)
  return response.data
}

export async function getMyOrders(filters?: OrderFilters): Promise<OrderListResponse> {
  const params = new URLSearchParams()
  if (filters?.page) params.append('page', String(filters.page))
  if (filters?.page_size) params.append('page_size', String(filters.page_size))
  if (filters?.status) params.append('status', filters.status)
  if (filters?.direction) params.append('direction', filters.direction)
  if (filters?.order_type) params.append('order_type', filters.order_type)
  const response = await apiClient.get<OrderListResponse>('/api/me/orders', { params })
  return response.data
}

export async function cancelOrder(id: number): Promise<Order> {
  const response = await apiClient.post<Order>(`/api/me/orders/${id}/cancel`)
  return response.data
}

export async function getAllOrders(filters?: OrderFilters): Promise<OrderListResponse> {
  const params = new URLSearchParams()
  if (filters?.page) params.append('page', String(filters.page))
  if (filters?.page_size) params.append('page_size', String(filters.page_size))
  if (filters?.status) params.append('status', filters.status)
  if (filters?.agent_email) params.append('agent_email', filters.agent_email)
  if (filters?.direction) params.append('direction', filters.direction)
  if (filters?.order_type) params.append('order_type', filters.order_type)
  const response = await apiClient.get<OrderListResponse>('/api/orders', { params })
  return response.data
}

export async function approveOrder(id: number): Promise<Order> {
  const response = await apiClient.post<Order>(`/api/orders/${id}/approve`)
  return response.data
}

export async function declineOrder(id: number): Promise<Order> {
  const response = await apiClient.post<Order>(`/api/orders/${id}/decline`)
  return response.data
}
