import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import Header from '../../components/Header'
import { ProductCard } from '../../components/shop/ProductCard'
import { QuantitySelector } from '../../components/shop/QuantitySelector'
import { useCart } from '../../lib/useCart'
import { BookCover } from '../../components/OptimizedImage'
import {
  formatPrice,
  getMaxQuantity,
  getStockStatusColor,
  getStockStatusLabel,
  isInStock,
  truncateText,
} from '../../lib/shopHelpers'
import { supabase } from '../../lib/supabaseClient'
import { useBook, useRelatedBooks, bookKeys, type BookDetail } from '../../lib/queries/bookQueries'

export const Route = createFileRoute('/livro/$bookId')({
  component: BookDetailPage,
  beforeLoad: async ({ params, context }) => {
    const { bookId } = params
    const queryClient = context.queryClient

    // Prefetch book data using query factory
    const selectFields =
      'id, title, slug, price_mzn, stock, description, seo_description, cover_url, cover_path, isbn, publisher, category, language, authors:authors_books(author:authors(id, name, wp_slug))'

    queryClient.prefetchQuery({
      queryKey: bookKeys.detail(bookId),
      queryFn: async () => {
        const { data: bySlug, error: slugError } = await supabase
          .from('books')
          .select(selectFields)
          .eq('slug', bookId)
          .eq('is_active', true)
          .maybeSingle()

        if (slugError) throw slugError
        if (bySlug) return bySlug

        const { data: byId, error: idError } = await supabase
          .from('books')
          .select(selectFields)
          .eq('id', bookId)
          .eq('is_active', true)
          .maybeSingle()

        if (idError) throw idError
        return byId ?? null
      },
      staleTime: 60_000,
    })
  },
})

const resolveCoverUrl = (book: BookDetail | null) => {
  if (!book) return null
  if (book.cover_url) return book.cover_url
  if (book.cover_path) {
    return supabase.storage.from('covers').getPublicUrl(book.cover_path).data
      .publicUrl
  }
  return null
}

function BookDetailPage() {
  const { bookId } = Route.useParams()
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description')

  // Use query factory hooks
  const bookQuery = useBook(bookId)
  const book = bookQuery.data ?? null
  const relatedBooksQuery = useRelatedBooks(bookId, book?.category)

  const coverUrl = resolveCoverUrl(book)
  const stock = book?.stock ?? 0
  const maxQuantity = getMaxQuantity(stock)
  const inStock = isInStock(stock)
  const stockLabel = getStockStatusLabel(stock)
  const stockColor = getStockStatusColor(stock)

  useEffect(() => {
    if (!book) return
    if (!inStock) {
      setQuantity(1)
      return
    }
    setQuantity((prev) => Math.min(Math.max(prev, 1), maxQuantity || 1))
  }, [book, inStock, maxQuantity])

  const authorLinks =
    book?.authors
      ?.map((item) => {
        if (!item.author) return null
        const slug = item.author.wp_slug || item.author.id
        return {
          id: item.author.id,
          name: item.author.name,
          href: `/autor/${slug}`,
        }
      })
      .filter(Boolean) ?? []

  const handleAddToCart = () => {
    if (!book) return
    if (!inStock) {
      toast.error('Este livro esta esgotado')
      return
    }

    addToCart(
      {
        id: book.id,
        title: book.title,
        slug: book.slug ?? book.id,
        price_mzn: book.price_mzn ?? 0,
        stock: stock,
        cover_url: coverUrl,
      },
      quantity,
    )

    toast.success(`"${truncateText(book.title, 40)}" adicionado ao carrinho`)
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />

      {bookQuery.isLoading && (
        <div className="container mx-auto px-4 py-24 lg:px-15">
          <div className="h-72 rounded-none border border-gray-200 bg-gray-100 animate-pulse" />
        </div>
      )}

      {bookQuery.isError && (
        <div className="container mx-auto px-4 py-24 lg:px-15">
          <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600 rounded-none">
            Falha ao carregar o livro. Tente novamente.
          </div>
        </div>
      )}

      {!bookQuery.isLoading && !bookQuery.isError && !book && (
        <div className="container mx-auto px-4 py-24 lg:px-15">
          <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600 rounded-none">
            Livro nao encontrado.
          </div>
        </div>
      )}

      {!bookQuery.isLoading && !bookQuery.isError && book && (
        <>
          <section
            className="relative overflow-hidden bg-[#1c1b1a] text-white"
            style={
              coverUrl
                ? {
                    backgroundImage: `url(${coverUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }
                : undefined
            }
          >
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative z-10">
              <div className="container mx-auto px-4 py-20 lg:px-15">
                <div className="max-w-3xl space-y-4">
                  <h1 className="text-4xl font-semibold md:text-6xl">
                    {book.title}
                  </h1>
                  <div className="text-xs uppercase tracking-[0.3em] text-white/70">
                    <a href="/" className="hover:text-white">
                      Home
                    </a>{' '}
                    /{' '}
                    <a href="/loja" className="hover:text-white">
                      Loja
                    </a>{' '}
                    / {book.title}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <main className="container mx-auto px-4 py-16 lg:px-15">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,420px)_1fr]">
              <div className="bg-[#f2eee9] p-10 shadow-sm">
                <div className="aspect-[3/4] w-full overflow-hidden bg-white">
                  {book.cover_path || coverUrl ? (
                    <BookCover
                      src={book.cover_path || coverUrl}
                      title={book.title}
                      className="h-full w-full object-cover"
                      priority={true}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl font-semibold text-gray-300">
                      {book.title.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-semibold md:text-4xl">
                    {book.title}
                  </h2>
                  {authorLinks.length > 0 && (
                    <p className="mt-2 text-sm text-gray-600">
                      {authorLinks.map((author, index) => (
                        <span key={author.id}>
                          <a href={author.href} className="hover:text-gray-900">
                            {author.name}
                          </a>
                          {index < authorLinks.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-2xl font-bold text-[color:var(--brand)]">
                    {formatPrice(book.price_mzn ?? 0)}
                  </p>
                  <p className={`text-sm font-medium ${stockColor}`}>{stockLabel}</p>
                </div>

                <div className="space-y-4 text-sm text-gray-700">
                  <p>
                    {book.description ||
                      book.seo_description ||
                      'Descricao indisponivel.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <QuantitySelector
                    value={quantity}
                    onChange={setQuantity}
                    min={1}
                    max={maxQuantity || 1}
                    disabled={!inStock}
                  />
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!inStock}
                    className="flex items-center gap-2 bg-[color:var(--brand)] px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#a25a2c] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {inStock ? 'Adicionar ao carrinho' : 'Esgotado'}
                  </button>
                </div>

                <div className="space-y-2 text-xs uppercase tracking-wider text-gray-500">
                  <p>
                    Categoria:{' '}
                    <span className="text-gray-700 normal-case">
                      {book.category || 'Nao informado'}
                    </span>
                  </p>
                  <p>
                    Idioma:{' '}
                    <span className="text-gray-700 normal-case">
                      {book.language?.toUpperCase() || 'Nao informado'}
                    </span>
                  </p>
                  <p>
                    ISBN:{' '}
                    <span className="text-gray-700 normal-case">
                      {book.isbn || 'Nao informado'}
                    </span>
                  </p>
                  <p>
                    ID:{' '}
                    <span className="text-gray-700 normal-case">{book.id}</span>
                  </p>
                </div>
              </div>
            </div>

            <section className="mt-12">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('description')}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    activeTab === 'description'
                      ? 'bg-[color:var(--brand)] text-white'
                      : 'bg-white text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Descricao
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('reviews')}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    activeTab === 'reviews'
                      ? 'bg-[color:var(--brand)] text-white'
                      : 'bg-white text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Reviews (0)
                </button>
              </div>
              <div className="mt-4 border border-gray-200 bg-white p-6 text-sm text-gray-700">
                {activeTab === 'description' ? (
                  <p>
                    {book.description ||
                      book.seo_description ||
                      'Descricao indisponivel.'}
                  </p>
                ) : (
                  <p>Sem reviews ainda.</p>
                )}
              </div>
            </section>

            <section className="mt-16">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-semibold md:text-3xl">Livros relacionados</h2>
            </div>

            {relatedBooksQuery.isLoading && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={`related-skeleton-${index}`} className="space-y-3">
                    <div className="aspect-[3/4] w-full animate-pulse bg-gray-200" />
                    <div className="h-5 w-3/4 animate-pulse bg-gray-200" />
                  </div>
                ))}
              </div>
            )}

            {relatedBooksQuery.isError && (
              <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600">
                Falha ao carregar livros relacionados.
              </div>
            )}

            {!relatedBooksQuery.isLoading &&
              !relatedBooksQuery.isError &&
              (relatedBooksQuery.data?.length ?? 0) === 0 && (
                <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600">
                  Sem livros relacionados no momento.
                </div>
              )}

            {!relatedBooksQuery.isLoading &&
              !relatedBooksQuery.isError &&
              (relatedBooksQuery.data?.length ?? 0) > 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {(relatedBooksQuery.data ?? []).map((related) => (
                    <ProductCard key={related.id} book={related} compact />
                  ))}
                </div>
              )}
          </section>
        </main>
        </>
      )}
    </div>
  )
}
