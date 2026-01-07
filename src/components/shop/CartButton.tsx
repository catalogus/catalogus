import { Link } from '@tanstack/react-router'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '../../lib/useCart'

const formatCount = (count: number) => (count > 99 ? '99+' : String(count))

type CartButtonProps = {
  showLabel?: boolean
  className?: string
  onClick?: () => void
}

export function CartButton({
  showLabel = false,
  className,
  onClick,
}: CartButtonProps) {
  const { count, isLoading } = useCart()
  const hasItems = count > 0

  return (
    <Link
      to="/carrinho"
      onClick={onClick}
      className={`relative inline-flex items-center gap-2 border border-transparent bg-white/0 px-3 py-2 text-sm font-semibold text-[color:var(--header-ink)] transition-all duration-200 hover:-translate-y-0.5 hover:text-[color:var(--header-accent)] ${className ?? ''}`}
      aria-label={
        isLoading
          ? 'Carrinho'
          : `Carrinho com ${count} ${count === 1 ? 'item' : 'itens'}`
      }
    >
      <ShoppingCart className="h-5 w-5" />
      {showLabel && <span>Carrinho</span>}
      {!isLoading && hasItems && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[color:var(--brand)] px-1 text-[11px] font-bold text-white">
          {formatCount(count)}
        </span>
      )}
    </Link>
  )
}
