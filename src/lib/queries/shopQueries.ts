import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'

// Query key factory for shop
export const shopKeys = {
  all: () => ['shop'] as const,
  metadata: () => [...shopKeys.all(), 'metadata'] as const,
}

export type PriceRange = {
  min: number
  max: number
}

export type ShopMetadata = {
  categories: string[]
  priceRange: PriceRange
}

const DEFAULT_PRICE_RANGE: PriceRange = { min: 0, max: 10000 }

// Reusable shop metadata query hook
export const useShopMetadata = () => {
  return useQuery({
    queryKey: shopKeys.metadata(),
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_shop_metadata')
      if (error) throw error
      return {
        categories: (data?.categories || []) as string[],
        priceRange: (data?.priceRange || DEFAULT_PRICE_RANGE) as PriceRange,
      } as ShopMetadata
    },
    staleTime: 300_000, // 5 minutes
  })
}
