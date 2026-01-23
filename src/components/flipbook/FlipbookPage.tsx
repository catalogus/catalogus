import React, { useState } from 'react'
import type { PublicationPage } from '../../types/publication'

type FlipbookPageProps = {
  page: PublicationPage
}

// Must use forwardRef for react-pageflip to work
export const FlipbookPage = React.forwardRef<HTMLDivElement, FlipbookPageProps>(
  ({ page }, ref) => {
    const [loaded, setLoaded] = useState(false)
    const [error, setError] = useState(false)

    return (
      <div
        ref={ref}
        className="flipbook-page bg-white shadow-lg"
        data-page-number={page.page_number}
      >
        {!loaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-500">
            <svg
              className="w-12 h-12 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="text-sm">Falha ao carregar página</span>
          </div>
        )}

        <img
          src={page.image_url || ''}
          alt={`Página ${page.page_number}`}
          className={`w-full h-full object-contain transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          loading="lazy"
          draggable={false}
        />
      </div>
    )
  }
)

FlipbookPage.displayName = 'FlipbookPage'
