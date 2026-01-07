import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { Facebook, Link2, MessageCircle, ShoppingCart, Twitter } from 'lucide-react'
import { toast } from 'sonner'
import Header from '../../components/Header'
import { ProductCard, type ProductCardBook } from '../../components/shop/ProductCard'
import { QuantitySelector } from '../../components/shop/QuantitySelector'
import { useCart } from '../../lib/useCart'
import {
  formatPrice,
  getMaxQuantity,
  getStockStatusColor,
  getStockStatusLabel,
  isInStock,
  truncateText,
} from '../../lib/shopHelpers'
import { supabase } from '../../lib/supabaseClient'

export const Route = createFileRoute('/livro/$bookId')({
  component: BookDetailPage,
})

type BookDetail = {
  id: string
  title: string
  slug: string | null
  price_mzn: number | null
  stock: number | null
  description: string | null
  seo_description: string | null
  cover_url: string | null
  cover_path: string | null
  isbn: string | null
  publisher: string | null
  category: string | null
  language: string | null
  authors?: Array<{
    author: {
      id: string
      name: string
      wp_slug: string | null
    } | null
  }> | null
}

const resolveCoverUrl = (book: BookDetail) => {
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

  const bookQuery = useQuery({
    queryKey: ['book', bookId],
    queryFn: async () => {
      const selectFields =
        'id, title, slug, price_mzn, stock, description, seo_description, cover_url, cover_path, isbn, publisher, category, language, authors:authors_books(author:authors(id, name, wp_slug))'

      const { data: bySlug, error: slugError } = await supabase
        .from('books')
        .select(selectFields)
        .eq('slug', bookId)
        .eq('is_active', true)
        .maybeSingle()

      if (slugError) throw slugError
      if (bySlug) return bySlug as BookDetail

      const { data: byId, error: idError } = await supabase
        .from('books')
        .select(selectFields)
        .eq('id', bookId)
        .eq('is_active', true)
        .maybeSingle()

      if (idError) throw idError
      return (byId as BookDetail | null) ?? null
    },
    staleTime: 60_000,
  })

  const book = bookQuery.data ?? null
  const coverUrl = book ? resolveCoverUrl(book) : null
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

  const relatedBooksQuery = useQuery({
    queryKey: ['related-books', book?.id, book?.category],
    queryFn: async () => {
      if (!book?.category) return []
      const { data, error } = await supabase
        .from('books')
        .select(
          `
          id,
          title,
          slug,
          price_mzn,
          stock,
          description,
          seo_description,
          cover_url,
          cover_path,
          category,
          language,
          authors:authors_books(author:authors(id, name, wp_slug))
        `,
        )
        .eq('is_active', true)
        .eq('category', book.category)
        .neq('id', book.id)
        .limit(4)

      if (error) throw error

      return (
        data?.map((entry: any) => ({
          ...entry,
          authors:
            entry.authors?.map((a: any) => ({
              author: a.author,
            })) ?? [],
        })) ?? []
      ) as ProductCardBook[]
    },
    enabled: !!book,
    staleTime: 60_000,
  })

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

  const shareUrl = useMemo(() => {
    if (!book) return ''
    const path = `/livro/${book.slug || book.id}`
    if (typeof window === 'undefined') return path
    return new URL(path, window.location.origin).toString()
  }, [book])

  const shareText = book ? truncateText(book.title, 80) : ''

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
    <div className="min-h-screen bg-[#f8f4ef] text-gray-900">
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
        <main className="container mx-auto px-4 py-16 lg:px-15">
          <div className="mb-8 text-xs uppercase tracking-[0.3em] text-gray-500">
            <a href="/" className="hover:text-gray-900">
              Home
            </a>{' '}
            /{' '}
            <a href="/loja" className="hover:text-gray-900">
              Loja
            </a>{' '}
            / {book.title}
          </div>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,420px)_1fr]">
            <div className="bg-white p-6 shadow-sm">
              <div className="aspect-[3/4] w-full overflow-hidden bg-gray-100">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt={book.title}
                    className="h-full w-full object-cover"
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
                <h1 className="text-3xl font-semibold md:text-5xl">{book.title}</h1>
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
                <p className="text-3xl font-bold text-[color:var(--brand)]">
                  {formatPrice(book.price_mzn ?? 0)}
                </p>
                <p className={`text-sm font-medium ${stockColor}`}>{stockLabel}</p>
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

              <div className="space-y-3 text-sm text-gray-700">
                <p>{book.description || book.seo_description || 'Descricao indisponivel.'}</p>
              </div>

              <div className="grid gap-3 border-t border-gray-200 pt-4 text-sm text-gray-700 md:grid-cols-2">
                <div>
                  <span className="block text-xs uppercase tracking-wider text-gray-500">
                    ISBN
                  </span>
                  <span>{book.isbn || 'Nao informado'}</span>
                </div>
                <div>
                  <span className="block text-xs uppercase tracking-wider text-gray-500">
                    Editora
                  </span>
                  <span>{book.publisher || 'Nao informado'}</span>
                </div>
                <div>
                  <span className="block text-xs uppercase tracking-wider text-gray-500">
                    Categoria
                  </span>
                  <span>{book.category || 'Nao informado'}</span>
                </div>
                <div>
                  <span className="block text-xs uppercase tracking-wider text-gray-500">
                    Idioma
                  </span>
                  <span>{book.language?.toUpperCase() || 'Nao informado'}</span>
                </div>
              </div>

              <div className="space-y-3 border-t border-gray-200 pt-4">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                  Partilhar
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `${shareText} ${shareUrl}`,
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 border border-gray-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-700 hover:border-[color:var(--brand)]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      shareUrl,
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 border border-gray-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-700 hover:border-[color:var(--brand)]"
                  >
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      shareText,
                    )}&url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 border border-gray-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-700 hover:border-[color:var(--brand)]"
                  >
                    <Twitter className="h-4 w-4" />
                    Twitter
                  </a>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!shareUrl) return
                      try {
                        await navigator.clipboard.writeText(shareUrl)
                        toast.success('Link copiado')
                      } catch {
                        toast.error('Nao foi possivel copiar o link')
                      }
                    }}
                    className="inline-flex items-center gap-2 border border-gray-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-700 hover:border-[color:var(--brand)]"
                  >
                    <Link2 className="h-4 w-4" />
                    Copiar link
                  </button>
                </div>
              </div>
            </div>
          </div>

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
      )}
    </div>
  )
}
