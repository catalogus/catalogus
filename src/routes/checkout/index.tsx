import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import Header from '../../components/Header'
import { useAuth } from '../../contexts/AuthProvider'
import { useCart } from '../../lib/useCart'
import {
  formatPrice,
  isValidEmail,
  isValidMozambiquePhone,
} from '../../lib/shopHelpers'
import { supabase } from '../../lib/supabaseClient'

export const Route = createFileRoute('/checkout/')({
  component: CheckoutPage,
})

type CustomerFormState = {
  name: string
  email: string
  phone: string
}

function CheckoutPage() {
  const navigate = useNavigate()
  const { session, profile } = useAuth()
  const { items, total, clearCart } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formState, setFormState] = useState<CustomerFormState>({
    name: '',
    email: '',
    phone: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setFormState((prev) => ({
      name: prev.name || profile?.name || '',
      email: prev.email || profile?.email || session?.user?.email || '',
      phone: prev.phone || profile?.phone || '',
    }))
  }, [profile, session])

  const isCartEmpty = items.length === 0

  const orderItems = useMemo(
    () =>
      items.map((item) => ({
        book_id: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
    [items],
  )

  const validateForm = () => {
    const nextErrors: Record<string, string> = {}
    if (!formState.name.trim()) {
      nextErrors.name = 'Nome obrigatorio'
    }
    if (!formState.email.trim() || !isValidEmail(formState.email)) {
      nextErrors.email = 'Email invalido'
    }
    if (!formState.phone.trim() || !isValidMozambiquePhone(formState.phone)) {
      nextErrors.phone = 'Telefone invalido'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (isSubmitting) return
    if (isCartEmpty) {
      toast.error('O carrinho esta vazio')
      return
    }

    if (!validateForm()) return

    try {
      setIsSubmitting(true)

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: session?.user?.id ?? null,
          customer_name: formState.name.trim(),
          customer_email: formState.email.trim().toLowerCase(),
          customer_phone: formState.phone.trim(),
          total,
          status: 'pending',
        })
        .select()
        .single()

      if (orderError) throw orderError

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems.map((item) => ({ ...item, order_id: order.id })))

      if (itemsError) throw itemsError

      for (const item of orderItems) {
        const { error: stockError } = await supabase.rpc('decrement_book_stock', {
          book_id: item.book_id,
          quantity: item.quantity,
        })
        if (stockError) throw stockError
      }

      clearCart()
      toast.success('Pedido criado com sucesso')
      navigate({ to: `/pedido/${order.id}` })
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Falha ao criar o pedido. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f4ef] text-gray-900">
      <Header />

      <main className="container mx-auto px-4 py-16 lg:px-15">
        <h1 className="text-3xl font-semibold md:text-5xl">Checkout</h1>

        {isCartEmpty ? (
          <div className="mt-8 border border-gray-200 bg-white p-8 text-center">
            <p className="text-lg font-semibold text-gray-900">
              O seu carrinho esta vazio
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Adicione livros antes de finalizar a compra.
            </p>
            <Link
              to="/loja"
              className="mt-6 inline-flex items-center justify-center bg-[color:var(--brand)] px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-white hover:bg-[#a25a2c]"
            >
              Ir para a loja
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <form
              onSubmit={handleSubmit}
              className="space-y-6 border border-gray-200 bg-white p-6"
            >
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Dados do cliente</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Preencha os dados para concluir o pedido.
                </p>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Nome completo
                  <input
                    type="text"
                    value={formState.name}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                    className="mt-2 w-full border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[color:var(--brand)] focus:outline-none"
                  />
                  {errors.name && (
                    <span className="mt-1 block text-xs text-red-600">
                      {errors.name}
                    </span>
                  )}
                </label>

                <label className="block text-sm font-medium text-gray-700">
                  Email
                  <input
                    type="email"
                    value={formState.email}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        email: event.target.value,
                      }))
                    }
                    className="mt-2 w-full border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[color:var(--brand)] focus:outline-none"
                  />
                  {errors.email && (
                    <span className="mt-1 block text-xs text-red-600">
                      {errors.email}
                    </span>
                  )}
                </label>

                <label className="block text-sm font-medium text-gray-700">
                  Telefone
                  <input
                    type="tel"
                    value={formState.phone}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        phone: event.target.value,
                      }))
                    }
                    className="mt-2 w-full border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[color:var(--brand)] focus:outline-none"
                  />
                  {errors.phone && (
                    <span className="mt-1 block text-xs text-red-600">
                      {errors.phone}
                    </span>
                  )}
                </label>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                  Metodo de pagamento
                </h3>
                <div className="mt-3 space-y-2 text-sm text-gray-700">
                  <label className="flex items-center gap-2">
                    <input type="radio" checked readOnly />
                    <span>M-Pesa</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[color:var(--brand)] px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#a25a2c] disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {isSubmitting ? 'Processando...' : 'Confirmar pedido'}
              </button>
            </form>

            <aside className="h-fit border border-gray-200 bg-white p-6">
              <h2 className="text-xl font-semibold text-gray-900">Resumo do pedido</h2>
              <div className="mt-4 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className="h-16 w-12 flex-shrink-0 bg-gray-100">
                      {item.cover_url ? (
                        <img
                          src={item.cover_url}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-gray-300">
                          {item.title.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        {item.quantity} x {formatPrice(item.price)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Total</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}
