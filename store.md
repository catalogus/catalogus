# Loja (Shop) E-Commerce Implementation Plan

## Overview
Build a complete e-commerce system for the Catalogus bookstore with shop listing page, book detail pages, shopping cart, checkout flow, and payment integration. The system will leverage existing books database schema and orders infrastructure while adding customer-facing features.

## Current State Analysis

### What EXISTS (70% complete):
✅ Books database schema with all fields (price, stock, cover, description, ISBN, publisher, category, language)
✅ Admin book management (full CRUD at /admin/books)
✅ Basic localStorage cart in FeaturedBooksSection (key: 'catalogus-cart')
✅ Orders and order_items database tables
✅ Admin orders management (/admin/orders)
✅ Book-author many-to-many relationship
✅ Supabase storage buckets for book covers
✅ FeaturedBooksSection component on homepage
✅ Header navigation with "Loja" link (route doesn't exist yet)
✅ M-Pesa transaction ID field in orders table (infrastructure ready)
✅ User authentication system

### What NEEDS TO BE BUILT (30%):
❌ /loja route - Shop listing page with filters, search, sorting
❌ /livro/$bookId route - Book detail page
❌ /carrinho route - Shopping cart page
❌ /checkout route - Checkout flow
❌ Persistent cart state (database or context)
❌ Payment integration (M-Pesa gateway)
❌ Customer order history (/meus-pedidos)
❌ Product filters component (category, language, price)
❌ Search functionality
❌ Stock decrement logic on order placement

## Implementation Phases

### Phase 1: Shop Listing Page (/loja) - PRIORITY 1

**File to Create:** `/Users/rnrnshn/dev/catalogus/src/routes/loja/index.tsx`

**Features:**
- Product grid layout (responsive: 4 cols XL, 3 cols LG, 2 cols MD, 1 col mobile)
- Pagination with Load More button (12 books per page)
- Sidebar with filters:
  - Category filter (checkboxes)
  - Language filter (PT/EN radio buttons)
  - Price range slider (min-max in MZN)
  - Tags cloud (if implemented)
- Search bar at top
- Sort dropdown (Newest, Oldest, Price: Low-High, Price: High-Low, Title A-Z)
- Grid/List view toggle (optional)
- Add to cart buttons on product cards
- Empty state when no books match filters

**Data Fetching Strategy:**
```typescript
useInfiniteQuery({
  queryKey: ['books', 'shop', { search, category, language, minPrice, maxPrice, sortBy }],
  queryFn: async ({ pageParam = 1 }) => {
    let query = supabase
      .from('books')
      .select('id, title, slug, price_mzn, stock, cover_url, cover_path, description, category, language, authors:authors_books(author_id, authors(name))')
      .eq('is_active', true)

    // Apply filters
    if (search) query = query.ilike('title', `%${search}%`)
    if (category) query = query.eq('category', category)
    if (language) query = query.eq('language', language)
    if (minPrice) query = query.gte('price_mzn', minPrice)
    if (maxPrice) query = query.lte('price_mzn', maxPrice)

    // Apply sorting
    switch (sortBy) {
      case 'newest': query = query.order('created_at', { ascending: false }); break
      case 'oldest': query = query.order('created_at', { ascending: true }); break
      case 'price-asc': query = query.order('price_mzn', { ascending: true }); break
      case 'price-desc': query = query.order('price_mzn', { ascending: false }); break
      case 'title': query = query.order('title', { ascending: true }); break
    }

    // Pagination
    const from = (pageParam - 1) * 12
    const to = from + 11
    const { data, error } = await query.range(from, to)

    return { books: data ?? [], hasMore: data?.length === 12 }
  }
})
```

**Product Card Component:**
- Book cover image
- Title (truncated with ellipsis)
- Author names
- Price in MZN (formatted: "1.500,00 MZN")
- Stock availability indicator
- Add to cart button (disabled if out of stock)
- Link to book detail page

**Reference Styling:** Match FeaturedBooksSection card design

---

### Phase 2: Book Detail Page (/livro/$bookId) - PRIORITY 1

**File to Create:** `/Users/rnrnshn/dev/catalogus/src/routes/livro/$bookId.tsx`

**Layout:**
```
┌─────────────────────────────────────────┐
│  Cover Image   │  Book Details          │
│  (large)       │  - Title               │
│                │  - Authors (linked)    │
│                │  - Price               │
│                │  - Stock status        │
│                │  - Quantity selector   │
│                │  - Add to Cart button  │
│                │  - Description         │
│                │  - ISBN, Publisher     │
│                │  - Category, Language  │
└─────────────────────────────────────────┘
│  Related Books Section                  │
│  (same category or same authors)        │
└─────────────────────────────────────────┘
```

**Key Features:**
- Large cover image with zoom on hover
- Breadcrumb navigation: Home / Loja / Book Title
- Author links to /autor/$authorId pages
- Quantity selector (spinner: 1-10, max = stock)
- Add to cart with quantity
- Out of stock badge if stock = 0
- Social share buttons (WhatsApp, Facebook, Twitter, Copy Link)
- Related books carousel (4 books from same category/author)
- SEO meta tags (title, description from book.seo_title, book.seo_description)

**Data Fetching:**
```typescript
const bookQuery = useQuery({
  queryKey: ['book', bookId],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('books')
      .select('*, authors:authors_books(author:authors(id, name, wp_slug))')
      .eq('id', bookId)
      .eq('is_active', true)
      .maybeSingle()

    if (error) throw error
    if (!data) throw new Error('Book not found')
    return data
  }
})

const relatedBooksQuery = useQuery({
  queryKey: ['related-books', bookId, book?.category],
  queryFn: async () => {
    const { data } = await supabase
      .from('books')
      .select('id, title, cover_url, price_mzn')
      .eq('is_active', true)
      .eq('category', book.category)
      .neq('id', bookId)
      .limit(4)

    return data ?? []
  },
  enabled: !!book
})
```

---

### Phase 3: Shopping Cart State & Page - PRIORITY 2

**A. Cart Context/Hook**

**File to Create:** `/Users/rnrnshn/dev/catalogus/src/lib/useCart.ts`

Upgrade from localStorage-only to persistent cart state:

**Strategy:** Use React Context + localStorage + optional database sync for authenticated users

```typescript
type CartItem = {
  id: string        // book ID
  quantity: number
  title: string     // cached for display
  price: number     // cached to avoid re-fetch
  cover_url: string | null
  stock: number     // cached to validate availability
}

type CartContextValue = {
  items: CartItem[]
  addToCart: (book: BookData, quantity?: number) => void
  removeFromCart: (bookId: string) => void
  updateQuantity: (bookId: string, quantity: number) => void
  clearCart: () => void
  total: number
  count: number
}

export function CartProvider({ children }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('catalogus-cart')
    if (saved) {
      const parsed = JSON.parse(saved)
      // Hydrate with book data from Supabase
      hydrateCart(parsed).then(setItems)
    }
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('catalogus-cart', JSON.stringify(
      items.map(i => ({ id: i.id, quantity: i.quantity }))
    ))
  }, [items])

  // Cart operations...
}
```

**B. Cart Page**

**File to Create:** `/Users/rnrnshn/dev/catalogus/src/routes/carrinho/index.tsx`

**Layout:**
```
┌─────────────────────────────────────────┐
│  Shopping Cart (3 items)                │
├─────────────────────────────────────────┤
│  [Image] Book Title                     │
│           Author                        │
│           1.500,00 MZN                  │
│           Qty: [▼2] [Remove]            │
├─────────────────────────────────────────┤
│  ...more items...                       │
├─────────────────────────────────────────┤
│  Subtotal: 4.500,00 MZN                 │
│  [Continue Shopping] [Proceed Checkout] │
└─────────────────────────────────────────┘
```

**Features:**
- List all cart items with book details
- Quantity adjustment (dropdown 1-10 or stock limit)
- Remove item button
- Update quantity with stock validation
- Subtotal calculation
- Empty cart state: "Your cart is empty" with link to /loja
- Proceed to checkout button (disabled if cart empty)

---

### Phase 4: Checkout Flow - PRIORITY 2

**File to Create:** `/Users/rnrnshn/dev/catalogus/src/routes/checkout/index.tsx`

**Checkout Steps:**

1. **Customer Information**
   - Full Name (required)
   - Email (required, validated)
   - Phone Number (required, validated for Mozambique format)
   - Notes/Special Instructions (optional)

2. **Order Summary**
   - List of items (read-only)
   - Quantities
   - Individual prices
   - Total amount

3. **Payment Method**
   - M-Pesa option (default)
   - Cash on Delivery (future)
   - Card Payment (future)

4. **Place Order**
   - Creates order in database
   - Decrements stock
   - Clears cart
   - Redirects to order confirmation page

**Order Creation Logic:**
```typescript
const createOrder = async (customerData: CustomerData, cartItems: CartItem[]) => {
  // 1. Create order record
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_name: customerData.name,
      customer_email: customerData.email,
      customer_phone: customerData.phone,
      total: calculateTotal(cartItems),
      status: 'pending'
    })
    .select()
    .single()

  if (orderError) throw orderError

  // 2. Create order items
  const orderItems = cartItems.map(item => ({
    order_id: order.id,
    book_id: item.id,
    quantity: item.quantity,
    price: item.price
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) throw itemsError

  // 3. Decrement stock (via database function or update query)
  for (const item of cartItems) {
    await supabase.rpc('decrement_book_stock', {
      book_id: item.id,
      quantity: item.quantity
    })
  }

  return order
}
```

**Database Function to Create:**
```sql
CREATE OR REPLACE FUNCTION public.decrement_book_stock(book_id uuid, quantity integer)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE books
  SET stock = stock - quantity
  WHERE id = book_id AND stock >= quantity;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for book %', book_id;
  END IF;
END;
$$;
```

---

### Phase 5: Order Confirmation & History - PRIORITY 3

**A. Order Confirmation Page**

**File to Create:** `/Users/rnrnshn/dev/catalogus/src/routes/pedido/$orderId.tsx`

**Features:**
- Order number display
- Order status badge
- Customer details
- Items ordered with quantities and prices
- Total amount
- Payment instructions (for M-Pesa: phone number to send payment to)
- Print order button
- Return to shop link

**B. Customer Order History**

**File to Create:** `/Users/rnrnshn/dev/catalogus/src/routes/meus-pedidos/index.tsx`

**Features (requires authentication):**
- List all orders for logged-in customer (filtered by customer_email)
- Order number, date, total, status
- Click to view order details
- Filter by status (All, Pending, Paid, Cancelled)
- Empty state if no orders

**Query:**
```typescript
const ordersQuery = useQuery({
  queryKey: ['my-orders', user?.email],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*, book:books(title, cover_url))')
      .eq('customer_email', user.email)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data ?? []
  },
  enabled: !!user
})
```

---

### Phase 6: Payment Integration (M-Pesa) - PRIORITY 4

**Note:** M-Pesa integration requires API credentials from Vodacom Mozambique.

**File to Create:** `/Users/rnrnshn/dev/catalogus/src/lib/mpesa.ts`

**M-Pesa Flow:**
1. Customer places order → status: 'pending'
2. Display M-Pesa instructions: "Send {total} MZN to {mpesa_number}"
3. Customer sends payment via M-Pesa
4. Webhook receives payment notification from M-Pesa
5. Update order status: 'pending' → 'paid'
6. Update mpesa_transaction_id in orders table

**Stub Implementation (for testing):**
```typescript
export async function initiateMpesaPayment(order: Order) {
  // TODO: Integrate with M-Pesa C2B API
  // For now, return manual payment instructions
  return {
    success: true,
    instructions: `Please send ${order.total} MZN to M-Pesa number: +258 84 XXX XXXX`,
    reference: order.order_number
  }
}

export async function verifyMpesaPayment(transactionId: string) {
  // TODO: Verify payment with M-Pesa API
  return { status: 'pending' }
}
```

**Webhook Endpoint (future):**
```typescript
// /api/webhooks/mpesa
export async function POST(request: Request) {
  const payload = await request.json()

  // Verify webhook signature
  // Extract transaction details
  // Update order status in database
  // Send confirmation email

  return new Response('OK', { status: 200 })
}
```

---

### Phase 7: Reusable Components - PRIORITY 2

**A. ProductCard Component**

**File to Create:** `/Users/rnrnshn/dev/catalogus/src/components/shop/ProductCard.tsx`

Reusable card for shop grid and related books:
- Book cover image
- Title, author, price
- Add to cart button
- Link to detail page
- Stock badge

**B. FilterSidebar Component**

**File to Create:** `/Users/rnrnshn/dev/catalogus/src/components/shop/FilterSidebar.tsx`

**Filters:**
- Search input
- Category checkboxes (dynamically populated from books.category)
- Language radio buttons (PT/EN)
- Price range slider (min: 0, max: from query)
- Clear all filters button

**C. CartButton Component**

**File to Create:** `/Users/rnrnshn/dev/catalogus/src/components/shop/CartButton.tsx`

Header cart icon with badge:
- Shopping cart icon (Lucide React)
- Badge showing cart item count
- Dropdown preview of cart items (optional)
- Link to /carrinho

**Update Header.tsx:**
Add CartButton to header navigation (right side near Admin button)

---

## File Structure Summary

### New Routes to Create:
1. `/Users/rnrnshn/dev/catalogus/src/routes/loja/index.tsx` - Shop listing
2. `/Users/rnrnshn/dev/catalogus/src/routes/livro/$bookId.tsx` - Book detail
3. `/Users/rnrnshn/dev/catalogus/src/routes/carrinho/index.tsx` - Shopping cart
4. `/Users/rnrnshn/dev/catalogus/src/routes/checkout/index.tsx` - Checkout
5. `/Users/rnrnshn/dev/catalogus/src/routes/pedido/$orderId.tsx` - Order confirmation
6. `/Users/rnrnshn/dev/catalogus/src/routes/meus-pedidos/index.tsx` - Order history

### New Components to Create:
1. `/Users/rnrnshn/dev/catalogus/src/components/shop/ProductCard.tsx`
2. `/Users/rnrnshn/dev/catalogus/src/components/shop/FilterSidebar.tsx`
3. `/Users/rnrnshn/dev/catalogus/src/components/shop/CartButton.tsx`
4. `/Users/rnrnshn/dev/catalogus/src/components/shop/QuantitySelector.tsx`

### New Utilities to Create:
1. `/Users/rnrnshn/dev/catalogus/src/lib/useCart.ts` - Cart context/hook
2. `/Users/rnrnshn/dev/catalogus/src/lib/mpesa.ts` - Payment integration (stub)
3. `/Users/rnrnshn/dev/catalogus/src/lib/shopHelpers.ts` - Formatting, validation

### Database Changes:
1. Create `decrement_book_stock()` function in Supabase
2. (Optional) Create `carts` table for persistent cart storage

### Files to Modify:
1. `/Users/rnrnshn/dev/catalogus/src/components/Header.tsx` - Add CartButton
2. `/Users/rnrnshn/dev/catalogus/src/routes/__root.tsx` - Wrap with CartProvider

---

## Implementation Priority Order

**Sprint 1 (Week 1):**
- [ ] Shop listing page (/loja) with basic grid
- [ ] ProductCard component
- [ ] Book detail page (/livro/$bookId)
- [ ] Cart context/hook (useCart)

**Sprint 2 (Week 2):**
- [ ] FilterSidebar component with all filters
- [ ] Shopping cart page (/carrinho)
- [ ] CartButton in header
- [ ] Quantity selector component

**Sprint 3 (Week 3):**
- [ ] Checkout page with customer form
- [ ] Order creation logic
- [ ] Stock decrement function
- [ ] Order confirmation page

**Sprint 4 (Week 4):**
- [ ] Order history page (/meus-pedidos)
- [ ] M-Pesa integration (stub)
- [ ] Email notifications (future)
- [ ] Testing and bug fixes

---

## Styling Consistency

**Colors:**
- Primary brand: `var(--brand)` (#c07238)
- Button hover: `#a25a2c`
- Background: `bg-[#f8f4ef]` (beige, matching author pages)
- Card backgrounds: `bg-white`
- Text: `text-gray-900`

**Typography:**
- Section headings: `text-3xl font-semibold md:text-5xl`
- Product titles: `text-xl font-semibold`
- Prices: `text-2xl font-bold text-[color:var(--brand)]`
- Body text: `text-base text-gray-700`

**Spacing:**
- Container: `container mx-auto px-4 lg:px-15`
- Section padding: `py-20`
- Grid gap: `gap-6`

**Responsive Grid:**
- Desktop (XL): 4 columns
- Large (LG): 3 columns
- Medium (MD): 2 columns
- Mobile: 1 column

---

## Testing Checklist

**Shop Listing (/loja):**
- [ ] Products load correctly
- [ ] Filters work (category, language, price)
- [ ] Search functionality works
- [ ] Sorting works
- [ ] Pagination loads more books
- [ ] Add to cart works
- [ ] Links to book detail work

**Book Detail (/livro/$bookId):**
- [ ] Book data loads correctly
- [ ] Authors link to author pages
- [ ] Quantity selector works
- [ ] Add to cart with quantity works
- [ ] Out of stock handled correctly
- [ ] Related books load
- [ ] Breadcrumbs work

**Shopping Cart:**
- [ ] Cart items display
- [ ] Quantity updates work
- [ ] Remove item works
- [ ] Total calculates correctly
- [ ] Empty cart state shows
- [ ] Cart persists in localStorage

**Checkout:**
- [ ] Form validation works
- [ ] Order creates successfully
- [ ] Stock decrements
- [ ] Cart clears after order
- [ ] Redirects to confirmation

**Order Confirmation:**
- [ ] Order details display
- [ ] Payment instructions show
- [ ] Order status badge shows

**Order History:**
- [ ] Orders list for logged-in user
- [ ] Order details link works
- [ ] Status filtering works

---

## Security Considerations

1. **RLS Policies:** Orders should only be viewable by customer or admin
2. **Stock Validation:** Prevent negative stock, validate stock before order creation
3. **Price Integrity:** Store price snapshot in order_items (book price may change later)
4. **Payment Verification:** Don't mark order as paid without verifying transaction
5. **Input Sanitization:** Validate customer email, phone, name
6. **Cart Tampering:** Validate cart contents on server before order creation

---

## Future Enhancements (Post-Launch)

- [ ] Book reviews and ratings
- [ ] Wishlist/favorites
- [ ] Book preview (first chapter)
- [ ] Gift cards/vouchers
- [ ] Bulk discounts
- [ ] Email order confirmations
- [ ] SMS notifications
- [ ] Advanced search (by author, ISBN, publisher)
- [ ] Book recommendations (AI-powered)
- [ ] Multi-currency support
- [ ] PDF/eBook downloads
- [ ] Subscription service

---

## Critical Files Reference

**Existing Files (Read-Only):**
1. [src/routes/admin/books.tsx](src/routes/admin/books.tsx) - Admin book management
2. [src/components/home/FeaturedBooksSection.tsx](src/components/home/FeaturedBooksSection.tsx) - Cart reference, book card design
3. [src/routes/admin/orders.tsx](src/routes/admin/orders.tsx) - Orders admin
4. [supabase/schema.sql](supabase/schema.sql) - Books, orders, order_items tables
5. [src/components/Header.tsx](src/components/Header.tsx) - Navigation

**Database Schema Reference:**
- `books` table: Lines 35-58 in schema.sql
- `orders` table: Lines 94-107 in schema.sql
- `order_items` table: Lines 109-118 in schema.sql
- `authors_books` table: Lines 86-90 in schema.sql
