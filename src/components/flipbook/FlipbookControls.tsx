import { useState } from 'react'
import type { DisplayMode } from '../../types/publication'

type FlipbookControlsProps = {
  currentPage: number
  totalPages: number
  zoom: number
  onZoomChange: (zoom: number) => void
  isFullscreen: boolean
  onToggleFullscreen: () => void
  displayMode: DisplayMode
  onDisplayModeChange: (mode: DisplayMode) => void
  onToggleThumbnails: () => void
  onToggleToc: () => void
  onGoToPage: (page: number) => void
  onNext: () => void
  onPrev: () => void
  showThumbnails: boolean
  showToc: boolean
  hasToc: boolean
}

export function FlipbookControls({
  currentPage,
  totalPages,
  zoom,
  onZoomChange,
  isFullscreen,
  onToggleFullscreen,
  displayMode,
  onDisplayModeChange,
  onToggleThumbnails,
  onToggleToc,
  onGoToPage,
  onNext,
  onPrev,
  showThumbnails,
  showToc,
  hasToc,
}: FlipbookControlsProps) {
  const [pageInput, setPageInput] = useState('')

  const handlePageSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const page = parseInt(pageInput, 10)
    if (page >= 1 && page <= totalPages) {
      onGoToPage(page - 1) // Convert to 0-indexed
      setPageInput('')
    }
  }

  const zoomPercentage = Math.round(zoom * 100)

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-gray-900/95 text-white border-b border-gray-700">
      {/* Left: Sidebar toggles */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleThumbnails}
          className={`p-2 rounded-lg transition-colors ${
            showThumbnails ? 'bg-white/20' : 'hover:bg-white/10'
          }`}
          title="Miniaturas"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
        </button>
        {hasToc && (
          <button
            onClick={onToggleToc}
            className={`p-2 rounded-lg transition-colors ${
              showToc ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
            title="Índice"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Center: Navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={onPrev}
          disabled={currentPage === 0}
          className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Página anterior"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <form onSubmit={handlePageSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={pageInput}
            onChange={e => setPageInput(e.target.value)}
            placeholder={String(currentPage + 1)}
            className="w-12 px-2 py-1 text-center text-sm bg-white/10 border border-white/20 rounded focus:outline-none focus:border-white/40"
          />
          <span className="text-sm text-gray-400">/ {totalPages}</span>
        </form>

        <button
          onClick={onNext}
          disabled={currentPage >= totalPages - 1}
          className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Próxima página"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Right: Zoom, display mode, fullscreen */}
      <div className="flex items-center gap-2">
        {/* Zoom controls */}
        <div className="hidden sm:flex items-center gap-1 mr-2">
          <button
            onClick={() => onZoomChange(Math.max(zoom - 0.25, 0.5))}
            className="p-1.5 rounded hover:bg-white/10 transition-colors"
            title="Diminuir zoom"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="text-xs text-gray-400 w-10 text-center">{zoomPercentage}%</span>
          <button
            onClick={() => onZoomChange(Math.min(zoom + 0.25, 2))}
            className="p-1.5 rounded hover:bg-white/10 transition-colors"
            title="Aumentar zoom"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Display mode toggle (hidden on mobile) */}
        <div className="hidden md:flex items-center border border-white/20 rounded-lg overflow-hidden">
          <button
            onClick={() => onDisplayModeChange('single')}
            className={`px-3 py-1.5 text-xs transition-colors ${
              displayMode === 'single' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
            title="Página única"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </button>
          <button
            onClick={() => onDisplayModeChange('double')}
            className={`px-3 py-1.5 text-xs transition-colors ${
              displayMode === 'double' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
            title="Página dupla"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </button>
        </div>

        {/* Fullscreen toggle */}
        <button
          onClick={onToggleFullscreen}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          title={isFullscreen ? 'Sair de ecrã inteiro' : 'Ecrã inteiro'}
        >
          {isFullscreen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
