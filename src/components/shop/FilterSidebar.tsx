import { Search, X } from 'lucide-react'
import { formatPriceCompact } from '../../lib/shopHelpers'

type PriceRange = {
  min: number
  max: number
}

type FilterSidebarProps = {
  search: string
  onSearchChange: (value: string) => void
  categories: string[]
  selectedCategories: string[]
  onSelectedCategoriesChange: (next: string[]) => void
  language: string | null
  onLanguageChange: (value: string | null) => void
  priceRange: PriceRange
  selectedPrice: PriceRange
  onPriceChange: (next: PriceRange) => void
  onClearFilters: () => void
  isLoading?: boolean
  className?: string
  idPrefix?: string
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, max))

export function FilterSidebar({
  search,
  onSearchChange,
  categories,
  selectedCategories,
  onSelectedCategoriesChange,
  language,
  onLanguageChange,
  priceRange,
  selectedPrice,
  onPriceChange,
  onClearFilters,
  isLoading = false,
  className,
  idPrefix = 'shop',
}: FilterSidebarProps) {
  const handleCategoryToggle = (category: string) => {
    const isSelected = selectedCategories.includes(category)
    const next = isSelected
      ? selectedCategories.filter((item) => item !== category)
      : [...selectedCategories, category]
    onSelectedCategoriesChange(next)
  }

  const handleMinPriceChange = (value: number) => {
    const nextMin = clamp(value, priceRange.min, selectedPrice.max)
    onPriceChange({ min: nextMin, max: selectedPrice.max })
  }

  const handleMaxPriceChange = (value: number) => {
    const nextMax = clamp(value, selectedPrice.min, priceRange.max)
    onPriceChange({ min: selectedPrice.min, max: nextMax })
  }

  const minLabel = formatPriceCompact(priceRange.min)
  const maxLabel = formatPriceCompact(priceRange.max)

  const searchId = `${idPrefix}-search`

  return (
    <aside
      className={`space-y-6 border border-gray-200 bg-white p-6 ${className ?? ''}`}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-500 transition-colors hover:text-gray-900"
          disabled={isLoading}
        >
          <X className="h-3.5 w-3.5" />
          Limpar
        </button>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700" htmlFor={searchId}>
          Pesquisa
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            id={searchId}
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar por titulo"
            className="w-full border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 focus:border-[color:var(--brand)] focus:outline-none"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          Categorias
        </h3>
        {categories.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhuma categoria encontrada.</p>
        ) : (
          <div className="space-y-2">
            {categories.map((category) => (
              <label
                key={category}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                  className="h-4 w-4 border-gray-300 text-[color:var(--brand)] focus:ring-[color:var(--brand)]"
                  disabled={isLoading}
                />
                <span>{category}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          Idioma
        </h3>
        <div className="space-y-2 text-sm text-gray-700">
          {[
            { label: 'Todos', value: null },
            { label: 'Portugues', value: 'pt' },
            { label: 'Ingles', value: 'en' },
          ].map((option) => (
            <label key={option.label} className="flex items-center gap-2">
              <input
                type="radio"
                name="language"
                checked={language === option.value}
                onChange={() => onLanguageChange(option.value)}
                className="h-4 w-4 border-gray-300 text-[color:var(--brand)] focus:ring-[color:var(--brand)]"
                disabled={isLoading}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          Preco
        </h3>
        <p className="text-xs text-gray-500">
          {minLabel} MZN - {maxLabel} MZN
        </p>
        <div className="grid gap-3 text-sm text-gray-700 md:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wider text-gray-500">
              Minimo
            </span>
            <input
              type="number"
              min={priceRange.min}
              max={selectedPrice.max}
              value={selectedPrice.min}
              onChange={(event) => handleMinPriceChange(Number(event.target.value))}
              className="w-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[color:var(--brand)] focus:outline-none"
              disabled={isLoading}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wider text-gray-500">
              Maximo
            </span>
            <input
              type="number"
              min={selectedPrice.min}
              max={priceRange.max}
              value={selectedPrice.max}
              onChange={(event) => handleMaxPriceChange(Number(event.target.value))}
              className="w-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[color:var(--brand)] focus:outline-none"
              disabled={isLoading}
            />
          </label>
        </div>
      </div>
    </aside>
  )
}
