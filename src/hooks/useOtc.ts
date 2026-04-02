import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getOtcOffers, buyOtcOffer } from '@/lib/api/otc'
import type { OtcFilters } from '@/types/otc'

export function useOtcOffers(filters?: OtcFilters) {
  return useQuery({
    queryKey: ['otc-offers', filters],
    queryFn: () => getOtcOffers(filters),
  })
}

export function useBuyOtcOffer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      quantity,
      account_id,
    }: {
      id: number
      quantity: number
      account_id: number
    }) => buyOtcOffer(id, { quantity, account_id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['otc-offers'] })
      queryClient.invalidateQueries({ queryKey: ['portfolio'] })
    },
  })
}
