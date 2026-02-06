import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import Header from '../../components/Header'
import { useAuth } from '../../contexts/AuthProvider'
import { useCart } from '../../lib/useCart'
import {
  formatPrice,
  isValidEmail,
  isValidMozambiquePhone,
} from '../../lib/shopHelpers'
import { createOrderAndInitiateMpesa } from '../../server/mpesa'

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
  const { t, i18n } = useTranslation()
  const { session, profile, loading } = useAuth()
  const { items, total, clearCart } = useCart()
  const locale = i18n.language === 'en' ? 'en-US' : 'pt-PT'
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

  const testAmountRaw = Number(import.meta.env.VITE_MPESA_TEST_AMOUNT ?? '')
  const testAmount =
    Number.isFinite(testAmountRaw) && testAmountRaw > 0
      ? testAmountRaw
      : null
  const priceRatio =
    testAmount && total > 0 ? testAmount / total : 1
  const checkoutTotal =
    testAmount && total > 0 ? testAmount : total

  const checkoutItems = useMemo(() => {
    if (!testAmount || priceRatio === 1) {
      return orderItems
    }

    return orderItems.map((item) => ({
      ...item,
      price: Number((item.price * priceRatio).toFixed(2)),
    }))
  }, [orderItems, priceRatio, testAmount])

  const validateForm = () => {
    const nextErrors: Record<string, string> = {}
    if (!formState.name.trim()) {
      nextErrors.name = t('checkout.errors.nameRequired')
    }
    if (!formState.email.trim() || !isValidEmail(formState.email)) {
      nextErrors.email = t('checkout.errors.emailInvalid')
    }
    if (!formState.phone.trim() || !isValidMozambiquePhone(formState.phone)) {
      nextErrors.phone = t('checkout.errors.phoneInvalid')
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (isSubmitting) return
    if (isCartEmpty) {
      toast.error(t('checkout.toasts.cartEmpty'))
      return
    }

    if (!isAuthenticated) {
      toast.error(t('checkout.toasts.loginRequired'))
      navigate({ to: '/auth/sign-in' })
      return
    }

    if (!validateForm()) return

    try {
      setIsSubmitting(true)

      if (!session?.access_token) {
        throw new Error('Missing session access token')
      }

      const paymentResult = await createOrderAndInitiateMpesa({
        data: {
          accessToken: session.access_token,
          customer: {
            name: formState.name.trim(),
            email: formState.email.trim(),
            phone: formState.phone.trim(),
          },
          items: checkoutItems,
          total: checkoutTotal,
        },
      })

      if (paymentResult.orderId) {
        clearCart()
        if (paymentResult.success) {
          toast.success(t('checkout.toasts.paymentInitiated'))
        } else {
          toast.error(paymentResult.message)
        }
        navigate({ to: `/pedido/${paymentResult.orderId}` })
      } else {
        throw new Error('Failed to create order')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error(t('checkout.toasts.orderError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const orderSummary = (
    <aside className="h-fit border border-gray-200 bg-white p-6">
      <h2 className="text-xl font-semibold text-gray-900">
        {t('checkout.summary.title')}
      </h2>
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
                {item.quantity} x{' '}
                {formatPrice(
                  Number((item.price * priceRatio).toFixed(2)),
                  locale,
                )}
              </p>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {formatPrice(
                Number((item.price * item.quantity * priceRatio).toFixed(2)),
                locale,
              )}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{t('checkout.summary.total')}</span>
          <span className="text-lg font-semibold text-gray-900">
            {formatPrice(checkoutTotal, locale)}
          </span>
        </div>
      </div>
    </aside>
  )

  return (
    <div className="min-h-screen bg-[#f8f4ef] text-gray-900">
      <Header />

      <main className="container mx-auto px-4 py-16 lg:px-15">
        <h1 className="text-3xl font-semibold md:text-5xl">
          {t('checkout.title')}
        </h1>

        {isCartEmpty ? (
          <div className="mt-8 border border-gray-200 bg-white p-8 text-center">
            <p className="text-lg font-semibold text-gray-900">
              {t('checkout.cartEmpty.title')}
            </p>
            <p className="mt-2 text-sm text-gray-600">
              {t('checkout.cartEmpty.body')}
            </p>
            <Link
              to="/loja"
              className="mt-6 inline-flex items-center justify-center bg-[color:var(--brand)] px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-white hover:bg-[#a25a2c]"
            >
              {t('checkout.cartEmpty.cta')}
            </Link>
          </div>
        ) : loading ? (
          <div className="mt-8 border border-gray-200 bg-white p-8 text-center text-sm text-gray-600">
            {t('checkout.loading')}
          </div>
        ) : !isAuthenticated ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="border border-gray-200 bg-white p-8 text-center">
              <p className="text-lg font-semibold text-gray-900">
                {t('checkout.login.title')}
              </p>
              <p className="mt-2 text-sm text-gray-600">
                {t('checkout.login.body')}
              </p>
              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Link
                  to="/auth/sign-in"
                  className="inline-flex w-full items-center justify-center bg-[color:var(--brand)] px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-white hover:bg-[#a25a2c] sm:w-auto"
                >
                  {t('checkout.login.signIn')}
                </Link>
                <Link
                  to="/auth/sign-up"
                  className="inline-flex w-full items-center justify-center border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-gray-700 hover:border-gray-400 sm:w-auto"
                >
                  {t('checkout.login.signUp')}
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
                <h2 className="text-xl font-semibold text-gray-900">
                  {t('checkout.customer.title')}
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  {t('checkout.customer.subtitle')}
                </p>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  {t('checkout.customer.name')}
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
                  {t('checkout.customer.email')}
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
                  {t('checkout.customer.phone')}
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
                  {t('checkout.payment.title')}
                </h3>
                <div className="mt-3 space-y-2 text-sm text-gray-700">
                  <label className="flex items-center gap-2">
                    <input type="radio" checked readOnly />
                    <span>{t('checkout.payment.method')}</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[color:var(--brand)] px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#a25a2c] disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {isSubmitting
                  ? t('checkout.submit.processing')
                  : t('checkout.submit.label')}
              </button>
            </form>

            {orderSummary}
          </div>
        )}
      </main>
    </div>
  )
}
