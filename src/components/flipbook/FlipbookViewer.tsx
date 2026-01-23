import { useRef, useCallback, useEffect, useState } from 'react'
import HTMLFlipBook from 'react-pageflip'
import { FlipbookControls } from './FlipbookControls'
import { FlipbookThumbnails } from './FlipbookThumbnails'
import { FlipbookTableOfContents } from './FlipbookTableOfContents'
import { FlipbookPage } from './FlipbookPage'
import { useFlipbook } from './useFlipbook'
import type { Publication, PublicationPage } from '../../types/publication'

type FlipbookViewerProps = {
  publication: Publication
  pages: PublicationPage[]
  initialPage?: number
}

export function FlipbookViewer({
  publication,
  pages,
  initialPage = 0,
}: FlipbookViewerProps) {
  const bookRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 400, height: 600 })

  const {
    currentPage,
    setCurrentPage,
    zoom,
    setZoom,
    isFullscreen,
    toggleFullscreen,
    displayMode,
    setDisplayMode,
    showThumbnails,
    setShowThumbnails,
    showToc,
    setShowToc,
  } = useFlipbook({ initialPage, publication })

  // Handle page flip events
  const onFlip = useCallback(
    (e: { data: number }) => {
      setCurrentPage(e.data)
    },
    [setCurrentPage]
  )

  // Navigation methods
  const goToPage = useCallback((pageNum: number) => {
    bookRef.current?.pageFlip().flip(pageNum)
  }, [])

  const nextPage = useCallback(() => {
    bookRef.current?.pageFlip().flipNext()
  }, [])

  const prevPage = useCallback(() => {
    bookRef.current?.pageFlip().flipPrev()
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextPage()
      if (e.key === 'ArrowLeft') prevPage()
      if (e.key === 'Escape' && isFullscreen) toggleFullscreen()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nextPage, prevPage, isFullscreen, toggleFullscreen])

  // Calculate dimensions based on container size and zoom
  useEffect(() => {
    const calculateDimensions = () => {
      if (!containerRef.current) return

      const container = containerRef.current
      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight

      // Account for sidebars
      const sidebarWidth = (showThumbnails ? 192 : 0) + (showToc ? 256 : 0)
      const availableWidth = containerWidth - sidebarWidth - 48 // padding
      const availableHeight = containerHeight - 80 // controls height + padding

      // Calculate page dimensions maintaining aspect ratio
      const aspectRatio = publication.page_height / publication.page_width
      const pagesShown = displayMode === 'double' ? 2 : 1

      let pageWidth = Math.min(
        (availableWidth / pagesShown) * 0.9,
        publication.page_width * zoom
      )
      let pageHeight = pageWidth * aspectRatio

      // If height exceeds available, recalculate
      if (pageHeight > availableHeight * 0.9) {
        pageHeight = availableHeight * 0.9
        pageWidth = pageHeight / aspectRatio
      }

      setDimensions({
        width: Math.round(pageWidth),
        height: Math.round(pageHeight),
      })
    }

    calculateDimensions()
    window.addEventListener('resize', calculateDimensions)
    return () => window.removeEventListener('resize', calculateDimensions)
  }, [
    zoom,
    displayMode,
    showThumbnails,
    showToc,
    publication.page_width,
    publication.page_height,
  ])

  const hasToc = Boolean(publication.table_of_contents && publication.table_of_contents.length > 0)

  return (
    <div
      ref={containerRef}
      className={`flipbook-container flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 bg-gray-900' : 'relative h-full bg-gray-900'
      }`}
    >
      <FlipbookControls
        currentPage={currentPage}
        totalPages={pages.length}
        zoom={zoom}
        onZoomChange={setZoom}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        displayMode={displayMode}
        onDisplayModeChange={setDisplayMode}
        onToggleThumbnails={() => setShowThumbnails(!showThumbnails)}
        onToggleToc={() => setShowToc(!showToc)}
        onGoToPage={goToPage}
        onNext={nextPage}
        onPrev={prevPage}
        showThumbnails={showThumbnails}
        showToc={showToc}
        hasToc={hasToc}
      />

      <div className="flex flex-1 overflow-hidden">
        {showThumbnails && (
          <FlipbookThumbnails
            pages={pages}
            currentPage={currentPage}
            onPageSelect={goToPage}
            onClose={() => setShowThumbnails(false)}
          />
        )}

        <div className="flex-1 flex items-center justify-center overflow-hidden p-4">
          {pages.length > 0 ? (
            <HTMLFlipBook
              ref={bookRef}
              width={dimensions.width}
              height={dimensions.height}
              size="stretch"
              minWidth={200}
              maxWidth={1200}
              minHeight={300}
              maxHeight={1600}
              showCover={true}
              mobileScrollSupport={true}
              onFlip={onFlip}
              className="flipbook shadow-2xl"
              style={{}}
              startPage={initialPage}
              drawShadow={true}
              flippingTime={600}
              usePortrait={displayMode === 'single'}
              startZIndex={0}
              autoSize={true}
              maxShadowOpacity={0.5}
              showPageCorners={true}
              disableFlipByClick={false}
              swipeDistance={30}
              clickEventForward={true}
              useMouseEvents={true}
            >
              {pages.map(page => (
                <FlipbookPage key={page.id} page={page} />
              ))}
            </HTMLFlipBook>
          ) : (
            <div className="text-center text-gray-400">
              <svg
                className="w-16 h-16 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <p>Nenhuma página disponível</p>
            </div>
          )}
        </div>

        {showToc && hasToc && (
          <FlipbookTableOfContents
            items={publication.table_of_contents!}
            currentPage={currentPage}
            onItemSelect={goToPage}
            onClose={() => setShowToc(false)}
          />
        )}
      </div>

      {/* Mobile page indicator */}
      <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
        {currentPage + 1} / {pages.length}
      </div>
    </div>
  )
}
