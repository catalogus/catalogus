import type { ChangeEvent } from 'react'
import { Minus, Plus } from 'lucide-react'

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, max))

type QuantitySelectorProps = {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  disabled?: boolean
  className?: string
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 10,
  disabled = false,
  className,
}: QuantitySelectorProps) {
  const handleDecrease = () => {
    if (disabled) return
    onChange(clamp(value - 1, min, max))
  }

  const handleIncrease = () => {
    if (disabled) return
    onChange(clamp(value + 1, min, max))
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (disabled) return
    const rawValue = Number(event.target.value)
    if (Number.isNaN(rawValue)) return
    onChange(clamp(rawValue, min, max))
  }

  return (
    <div
      className={`inline-flex items-center border border-gray-200 bg-white ${className ?? ''}`}
    >
      <button
        type="button"
        onClick={handleDecrease}
        disabled={disabled || value <= min}
        className="flex h-10 w-10 items-center justify-center text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
        aria-label="Diminuir quantidade"
      >
        <Minus className="h-4 w-4" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        className="h-10 w-12 border-l border-r border-gray-200 text-center text-sm font-semibold text-gray-900 focus:outline-none"
        aria-label="Quantidade"
      />
      <button
        type="button"
        onClick={handleIncrease}
        disabled={disabled || value >= max}
        className="flex h-10 w-10 items-center justify-center text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
        aria-label="Aumentar quantidade"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}
