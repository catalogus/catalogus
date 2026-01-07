import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { supabase } from './supabaseClient'
import { calculateCartTotal } from './shopHelpers'

export type CartItem = {
  id: string // book ID
  quantity: number
  title: string // cached for display
  price: number // cached to avoid re-fetch
  cover_url: string | null
  stock: number // cached to validate availability
  slug: string // for linking to book detail page
}

type CartContextValue = {
  items: CartItem[]
  addToCart: (book: BookData, quantity?: number) => void
  removeFromCart: (bookId: string) => void
  updateQuantity: (bookId: string, quantity: number) => void
  clearCart: () => void
  total: number
  count: number
  isLoading: boolean
}

type BookData = {
  id: string
  title: string
  slug: string
  price_mzn: number
  stock: number
  cover_url: string | null
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

const CART_STORAGE_KEY = 'catalogus-cart'

/**
 * Hydrate cart from localStorage with fresh book data from Supabase
 */
async function hydrateCart(
  storedItems: Array<{ id: string; quantity: number }>,
): Promise<CartItem[]> {
  if (storedItems.length === 0) return []

  const bookIds = storedItems.map((item) => item.id)

  const { data, error } = await supabase
    .from('books')
    .select('id, title, slug, price_mzn, stock, cover_url, cover_path')
    .in('id', bookIds)
    .eq('is_active', true)

  if (error) {
    console.error('Error hydrating cart:', error)
    return []
  }

  // Resolve cover URLs from storage if needed
  const books = data?.map((book) => {
    let coverUrl = book.cover_url
    if (!coverUrl && book.cover_path) {
      const { data: urlData } = supabase.storage
        .from('covers')
        .getPublicUrl(book.cover_path)
      coverUrl = urlData.publicUrl
    }

    return {
      id: book.id,
      title: book.title,
      slug: book.slug,
      price: book.price_mzn ?? 0,
      stock: book.stock ?? 0,
      cover_url: coverUrl,
    }
  })

  // Map stored quantities to book data
  const cartItems: CartItem[] = []
  for (const stored of storedItems) {
    const book = books?.find((b) => b.id === stored.id)
    if (book) {
      // Ensure quantity doesn't exceed current stock
      const quantity = Math.min(stored.quantity, book.stock)
      if (quantity > 0) {
        cartItems.push({
          id: book.id,
          title: book.title,
          slug: book.slug,
          price: book.price,
          stock: book.stock,
          cover_url: book.cover_url,
          quantity,
        })
      }
    }
  }

  return cartItems
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load from localStorage on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const saved = localStorage.getItem(CART_STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved) as Array<{ id: string; quantity: number }>
          const hydrated = await hydrateCart(parsed)
          setItems(hydrated)
        }
      } catch (error) {
        console.error('Error loading cart:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCart()
  }, [])

  // Save to localStorage whenever items change
  useEffect(() => {
    if (!isLoading) {
      const toStore = items.map((item) => ({ id: item.id, quantity: item.quantity }))
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(toStore))
    }
  }, [items, isLoading])

  const addToCart = useCallback((book: BookData, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === book.id)

      if (existing) {
        // Update quantity, but don't exceed stock
        const newQuantity = Math.min(existing.quantity + quantity, book.stock)
        return prev.map((item) =>
          item.id === book.id ? { ...item, quantity: newQuantity } : item,
        )
      }

      // Add new item
      const validQuantity = Math.min(quantity, book.stock)
      if (validQuantity <= 0) return prev

      return [
        ...prev,
        {
          id: book.id,
          title: book.title,
          slug: book.slug,
          price: book.price_mzn ?? 0,
          stock: book.stock,
          cover_url: book.cover_url,
          quantity: validQuantity,
        },
      ]
    })
  }, [])

  const removeFromCart = useCallback((bookId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== bookId))
  }, [])

  const updateQuantity = useCallback((bookId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        return prev.filter((item) => item.id !== bookId)
      }

      return prev.map((item) => {
        if (item.id === bookId) {
          // Don't exceed stock
          const validQuantity = Math.min(quantity, item.stock)
          return { ...item, quantity: validQuantity }
        }
        return item
      })
    })
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    localStorage.removeItem(CART_STORAGE_KEY)
  }, [])

  const total = calculateCartTotal(items)
  const count = items.reduce((sum, item) => sum + item.quantity, 0)

  const value: CartContextValue = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    total,
    count,
    isLoading,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
