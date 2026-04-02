import { useQuery } from '@tanstack/react-query'
import { getPortfolio, getPortfolioSummary } from '@/lib/api/portfolio'
import type { HoldingType } from '@/types/portfolio'

export function usePortfolio(securityType?: HoldingType, page?: number) {
  return useQuery({
    queryKey: ['portfolio', securityType, page],
    queryFn: () => getPortfolio(securityType, page),
  })
}

export function usePortfolioSummary() {
  return useQuery({
    queryKey: ['portfolio', 'summary'],
    queryFn: getPortfolioSummary,
  })
}
