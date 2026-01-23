import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { HeroSlideWithContent, ContentType } from '../types/hero'

type HeroProps = {
  slides: HeroSlideWithContent[]
}

export function Hero({ slides }: HeroProps) {
  const { t } = useTranslation()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Auto-advance every 6.5 seconds (skip if paused)
  useEffect(() => {
    if (isPaused || slides.length <= 1) return

    const interval = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length)
    }, 6500)

    return () => window.clearInterval(interval)
  }, [isPaused, slides.length])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious()
      } else if (e.key === 'ArrowRight') {
        handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handlePrevious = () => {
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % slides.length)
  }

  const getContentTypeLabel = (type: ContentType) => {
    switch (type) {
      case 'book':
        return t('hero.contentType.book')
      case 'author':
        return t('hero.contentType.author')
      case 'post':
        return t('hero.contentType.post')
      case 'custom':
        return t('hero.contentType.custom')
      default:
        return t('hero.contentType.custom')
    }
  }

  if (slides.length === 0) {
    return null
  }

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: 'calc(100vh - var(--header-height, 72px))' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      {slides.map((slide, index) => {
        const isActive = index === activeIndex
        const isAuthorSlide = slide.content_type === 'author'
        const isBookSlide = slide.content_type === 'book'
        const isVisualSlide = isAuthorSlide || isBookSlide
        const accentColor = slide.accent_color || '#5b6168'
        const visualImageUrl = isAuthorSlide
          ? slide.linked_content?.photo_url || null
          : isBookSlide
            ? slide.linked_content?.cover_url || null
            : null
        const visualName = isAuthorSlide
          ? slide.linked_content?.name || slide.title
          : isBookSlide
            ? slide.linked_content?.title || slide.title
            : slide.title
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
            aria-hidden={!isActive}
          >
            {/* Background Image with Gradient Overlay */}
            <div className="absolute inset-0">
              {isVisualSlide ? (
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: accentColor }}
                />
              ) : (
                <>
                  {slide.background_image_url && (
                    <img
                      src={slide.background_image_url}
                      alt={slide.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/60" />
                </>
              )}
            </div>

            {/* Content */}
            <div className="relative z-10 flex h-full items-center">
              <div className="container mx-auto px-4 lg:px-[60px]">
                <div
                  className={`flex flex-col gap-10 lg:flex-row lg:items-center ${
                    isVisualSlide ? 'lg:justify-between' : ''
                  }`}
                >
                  <div
                    className={`space-y-6 text-white ${
                      isVisualSlide ? 'max-w-xl' : 'max-w-2xl'
                    }`}
                  >
                    {/* Eyebrow */}
                    <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 text-xs font-semibold uppercase tracking-wider">
                      {getContentTypeLabel(slide.content_type)}
                    </span>

                    {/* Title */}
                    <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                      {slide.title}
                    </h1>

                    {/* Subtitle */}
                    {slide.subtitle && (
                      <p className="text-xl font-medium text-white/90 md:text-2xl">
                        {slide.subtitle}
                      </p>
                    )}

                    {/* Description */}
                    {slide.description && (
                      <p className="text-base text-white/80 md:text-lg max-w-xl">
                        {slide.description}
                      </p>
                    )}

                    {/* CTA Button */}
                    {slide.cta_text && slide.cta_url && (
                      <div className="pt-2">
                        <a
                          href={slide.cta_url}
                          className="inline-flex items-center bg-white text-gray-900 px-6 py-3 text-sm font-semibold uppercase tracking-wider transition hover:bg-gray-100 hover:-translate-y-0.5"
                        >
                          {slide.cta_text}
                        </a>
                      </div>
                    )}
                  </div>

                  {isVisualSlide && (
                    <div className="flex-1 flex justify-center lg:justify-end">
                      <div className="relative w-full max-w-md">
                        <div className="absolute -inset-4 border border-white/20" />
                        <div className="relative aspect-[4/5] w-full overflow-hidden border border-white/20 bg-white/10">
                          {visualImageUrl ? (
                            <img
                              src={visualImageUrl}
                              alt={visualName}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-5xl font-semibold text-white/70">
                              {(visualName || 'A').charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {/* Navigation Controls (only show if more than 1 slide) */}
      {slides.length > 1 && (
        <>
          {/* Previous/Next Buttons */}
          <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-between z-20 pointer-events-none lg:left-[60px] lg:right-[60px]">
            <button
              type="button"
              onClick={handlePrevious}
              className="pointer-events-auto flex h-10 w-10 items-center justify-center border border-white/50 bg-white/10 backdrop-blur-sm text-white transition hover:bg-white/20 hover:-translate-x-1"
              aria-label={t('hero.previous')}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="pointer-events-auto flex h-10 w-10 items-center justify-center border border-white/50 bg-white/10 backdrop-blur-sm text-white transition hover:bg-white/20 hover:translate-x-1"
              aria-label={t('hero.next')}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Dot Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            {slides.map((_, index) => (
              <button
                key={`dot-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-2 transition-all ${
                  index === activeIndex
                    ? 'w-8 bg-white'
                    : 'w-2 bg-white/50 hover:bg-white/75'
                }`}
                aria-label={t('hero.goToSlide', { index: index + 1 })}
              />
            ))}
          </div>
        </>
      )}

      {/* Pause Indicator (optional - shows when user hovers) */}
      {isPaused && slides.length > 1 && (
        <div className="absolute top-4 right-4 z-20 border border-white/20 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5">
          {t('hero.paused')}
        </div>
      )}
    </section>
  )
}
