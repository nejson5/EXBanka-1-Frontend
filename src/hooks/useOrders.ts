import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createOrder,
  getMyOrders,
  cancelOrder,
  getAllOrders,
  approveOrder,
  declineOrder,
} from '@/lib/api/orders'
import type { CreateOrderRequest, OrderFilters } from '@/types/order'

export function useMyOrders(filters?: OrderFilters) {
  return useQuery({
    queryKey: ['my-orders', filters],
    queryFn: () => getMyOrders(filters),
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateOrderRequest) => createOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] })
      queryClient.invalidateQueries({ queryKey: ['portfolio'] })
    },
  })
}

export function useCancelOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => cancelOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] })
    },
  })
}

export function useAllOrders(filters?: OrderFilters) {
  return useQuery({
    queryKey: ['all-orders', filters],
    queryFn: () => getAllOrders(filters),
  })
}

export function useApproveOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => approveOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-orders'] })
    },
  })
}

export function useDeclineOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => declineOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-orders'] })
    },
  })
}
