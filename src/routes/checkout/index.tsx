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
  const { session, profile, loading } = useAuth()
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
  const isAuthenticated = !!session?.user?.id

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

    if (!isAuthenticated) {
      toast.error('Faça login para finalizar a compra')
      navigate({ to: '/auth/sign-in' })
      return
    }

    if (!validateForm()) return

    try {
      setIsSubmitting(true)

      // Create order atomically (order + items + stock decrement in single transaction)
      const { data: result, error: orderError } = await supabase.rpc(
        'create_order_atomic',
        {
          p_customer_id: session?.user?.id ?? null,
          p_customer_name: formState.name.trim(),
          p_customer_email: formState.email.trim().toLowerCase(),
          p_customer_phone: formState.phone.trim(),
          p_total: total,
          p_items: orderItems,
        },
      )

      if (orderError) throw orderError

      if (!result?.success) {
        throw new Error(result?.error || 'Failed to create order')
      }

      const orderId = result.order_id
      const orderNumber = result.order_number

      console.log('Order created atomically:', {
        orderId,
        orderNumber,
      })

      // Initiate M-Pesa payment
      try {
        const { initiateMpesaPayment } = await import('../../lib/mpesa')

        console.log('About to initiate payment with:', {
          orderId,
          orderIdType: typeof orderId,
          customerPhone: formState.phone.trim(),
        })

        const paymentResult = await initiateMpesaPayment(
          orderId,
          formState.phone.trim()
        )

        clearCart()
        toast.success(paymentResult.message)
        navigate({ to: `/pedido/${orderId}` })
      } catch (paymentError) {
        console.error('Payment initiation error:', paymentError)
        // Order is created but payment failed to initiate
        toast.error(
          'Pedido criado mas falha ao iniciar pagamento. Visite a página do pedido para tentar novamente.'
        )
        navigate({ to: `/pedido/${orderId}` })
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Falha ao criar o pedido. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const orderSummary = (
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
  )

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
        ) : loading ? (
          <div className="mt-8 border border-gray-200 bg-white p-8 text-center text-sm text-gray-600">
            A carregar sessao...
          </div>
        ) : !isAuthenticated ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="border border-gray-200 bg-white p-8 text-center">
              <p className="text-lg font-semibold text-gray-900">
                Faça login para finalizar a compra
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Precisa de uma conta? Crie uma para continuar.
              </p>
              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Link
                  to="/auth/sign-in"
                  className="inline-flex w-full items-center justify-center bg-[color:var(--brand)] px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-white hover:bg-[#a25a2c] sm:w-auto"
                >
                  Entrar
                </Link>
                <Link
                  to="/auth/sign-up"
                  className="inline-flex w-full items-center justify-center border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-gray-700 hover:border-gray-400 sm:w-auto"
                >
                  Criar conta
                </Link>
              </div>
            </div>
            {orderSummary}
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

            {orderSummary}
          </div>
        )}
      </main>
    </div>
  )
}
