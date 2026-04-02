import { useQuery } from '@tanstack/react-query'
import { getStocks, getFutures, getForex } from '@/lib/api/securities'
import type { SecurityFilters } from '@/types/security'

export function useStocks(filters?: SecurityFilters) {
  return useQuery({
    queryKey: ['securities', 'stocks', filters],
    queryFn: () => getStocks(filters),
  })
}

export function useFutures(filters?: SecurityFilters) {
  return useQuery({
    queryKey: ['securities', 'futures', filters],
    queryFn: () => getFutures(filters),
  })
}

export function useForex(filters?: Pick<SecurityFilters, 'page' | 'page_size' | 'search'>) {
  return useQuery({
    queryKey: ['securities', 'forex', filters],
    queryFn: () => getForex(filters),
  })
}
