import { useRef, useEffect } from 'react'
import type { PublicationPage } from '../../types/publication'

type FlipbookThumbnailsProps = {
  pages: PublicationPage[]
  currentPage: number
  onPageSelect: (page: number) => void
  onClose: () => void
}

export function FlipbookThumbnails({
  pages,
  currentPage,
  onPageSelect,
  onClose,
}: FlipbookThumbnailsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const activeThumbRef = useRef<HTMLButtonElement>(null)

  // Scroll to active thumbnail when current page changes
  useEffect(() => {
    if (activeThumbRef.current && containerRef.current) {
      activeThumbRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  }, [currentPage])

  return (
    <div className="w-48 bg-gray-800 border-r border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <span className="text-sm font-medium text-white">Miniaturas</span>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Thumbnails list */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-2 space-y-2"
      >
        {pages.map((page, index) => {
          const isActive = index === currentPage

          return (
            <button
              key={page.id}
              ref={isActive ? activeThumbRef : null}
              onClick={() => onPageSelect(index)}
              className={`w-full aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${
                isActive
                  ? 'border-blue-500 ring-2 ring-blue-500/30'
                  : 'border-transparent hover:border-gray-500'
              }`}
            >
              <div className="relative w-full h-full bg-gray-700">
                {page.thumbnail_url ? (
                  <img
                    src={page.thumbnail_url}
                    alt={`Página ${page.page_number}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <span className="text-xs">{page.page_number}</span>
                  </div>
                )}
                {/* Page number badge */}
                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 rounded text-xs text-white">
                  {page.page_number}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
