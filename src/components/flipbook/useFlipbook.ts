import { useState, useCallback, useEffect } from 'react'
import type { Publication, DisplayMode } from '../../types/publication'

type UseFlipbookOptions = {
  initialPage?: number
  publication: Publication
}

export function useFlipbook({ initialPage = 0, publication }: UseFlipbookOptions) {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [zoom, setZoom] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [displayMode, setDisplayMode] = useState<DisplayMode>(publication.display_mode)
  const [showThumbnails, setShowThumbnails] = useState(false)
  const [showToc, setShowToc] = useState(false)

  // Fullscreen handling
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Zoom controls
  const zoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.25, 2))
  }, [])

  const zoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.25, 0.5))
  }, [])

  const resetZoom = useCallback(() => {
    setZoom(1)
  }, [])

  // Auto-hide sidebars on mobile and use single page mode
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768
      if (isMobile) {
        setShowThumbnails(false)
        setShowToc(false)
        setDisplayMode('single')
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return {
    currentPage,
    setCurrentPage,
    zoom,
    setZoom,
    zoomIn,
    zoomOut,
    resetZoom,
    isFullscreen,
    toggleFullscreen,
    displayMode,
    setDisplayMode,
    showThumbnails,
    setShowThumbnails,
    showToc,
    setShowToc,
  }
}
