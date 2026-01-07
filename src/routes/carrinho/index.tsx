import { createFileRoute, Link } from '@tanstack/react-router'
import { Trash2 } from 'lucide-react'
import Header from '../../components/Header'
import { QuantitySelector } from '../../components/shop/QuantitySelector'
import { useCart } from '../../lib/useCart'
import { formatPrice, getMaxQuantity } from '../../lib/shopHelpers'

export const Route = createFileRoute('/carrinho/')({
  component: CartPage,
})

function CartPage() {
  const { items, updateQuantity, removeFromCart, total, isLoading } = useCart()

  return (
    <div className="min-h-screen bg-[#f8f4ef] text-gray-900">
      <Header />

      <main className="container mx-auto px-4 py-16 lg:px-15">
        <h1 className="text-3xl font-semibold md:text-5xl">Carrinho</h1>

        {isLoading && (
          <div className="mt-8 space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`cart-skeleton-${index}`}
                className="h-24 animate-pulse rounded-none border border-gray-200 bg-gray-100"
              />
            ))}
          </div>
        )}

        {!isLoading && items.length === 0 && (
          <div className="mt-8 border border-gray-200 bg-white p-8 text-center">
            <p className="text-lg font-semibold text-gray-900">
              O seu carrinho esta vazio
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Explore a loja para adicionar livros.
            </p>
            <Link
              to="/loja"
              className="mt-6 inline-flex items-center justify-center bg-[color:var(--brand)] px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-white hover:bg-[#a25a2c]"
            >
              Continuar a comprar
            </Link>
          </div>
        )}

        {!isLoading && items.length > 0 && (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              {items.map((item) => {
                const maxQuantity = getMaxQuantity(item.stock)
                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 border border-gray-200 bg-white p-4 sm:flex-row sm:items-center"
                  >
                    <div className="h-28 w-20 flex-shrink-0 bg-gray-100">
                      {item.cover_url ? (
                        <img
                          src={item.cover_url}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-gray-300">
                          {item.title.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <a
                          href={`/livro/${item.slug}`}
                          className="text-lg font-semibold text-gray-900 hover:text-gray-700"
                        >
                          {item.title}
                        </a>
                        <p className="mt-1 text-sm text-gray-600">
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <QuantitySelector
                          value={item.quantity}
                          onChange={(value) => updateQuantity(item.id, value)}
                          min={1}
                          max={maxQuantity || 1}
                        />
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remover
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="h-fit border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900">Resumo</h2>
              <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">
                  {formatPrice(total)}
                </span>
              </div>
              <div className="mt-6 space-y-3">
                <Link
                  to="/checkout"
                  className="flex w-full items-center justify-center bg-[color:var(--brand)] px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-white hover:bg-[#a25a2c]"
                >
                  Finalizar compra
                </Link>
                <Link
                  to="/loja"
                  className="flex w-full items-center justify-center border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-gray-700 hover:border-gray-400"
                >
                  Continuar comprando
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
