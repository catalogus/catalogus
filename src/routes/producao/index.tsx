import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Footer from '../../components/Footer'
import Header from '../../components/Header'
import {
  ProductionHero,
  ProductionIntro,
  ProductionLightbox,
  ProductionProjectsGrid,
} from '../../features/production/ProductionSections'
import { buildProductionMedia, type GalleryItem, type LightboxState } from '../../features/production/productionData'
import { buildSeo } from '../../lib/seo'

export const Route = createFileRoute('/producao/')({
  head: () =>
    buildSeo({
      title: 'Producao',
      description: 'Galeria de producoes e momentos do trabalho da Catalogus.',
      path: '/producao',
      type: 'website',
    }),
  component: ProducaoPage,
})

function ProducaoPage() {
  const { t, i18n } = useTranslation()
  const [lightbox, setLightbox] = useState<LightboxState | null>(null)
  const media = useMemo(() => buildProductionMedia(t, i18n.language), [t, i18n.language])
  const activeItem = useMemo(() => (lightbox ? lightbox.items[lightbox.index] : null), [lightbox])

  const openLightbox = useCallback((items: GalleryItem[], index: number, title: string) => {
    setLightbox({ items, index, title })
  }, [])
  const closeLightbox = useCallback(() => setLightbox(null), [])
  const goNext = useCallback(() => {
    setLightbox((current) => (current ? { ...current, index: (current.index + 1) % current.items.length } : current))
  }, [])
  const goPrevious = useCallback(() => {
    setLightbox((current) =>
      current ? { ...current, index: (current.index - 1 + current.items.length) % current.items.length } : current,
    )
  }, [])

  useEffect(() => {
    if (!lightbox) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeLightbox()
      else if (event.key === 'ArrowRight') goNext()
      else if (event.key === 'ArrowLeft') goPrevious()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKey)
    }
  }, [closeLightbox, goNext, goPrevious, lightbox])

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      <main>
        <ProductionHero
          videoSrc={media.cidadeVideoBackgroundSrc}
          labels={{
            videoAlt: t('production.galleryAlt.cidadeVideo'),
            eyebrow: t('production.hero.eyebrow'),
            title: t('production.hero.title'),
            subtitle: t('production.hero.subtitle'),
          }}
        />
        <ProductionIntro
          label={t('production.intro.label')}
          title={t('production.intro.title')}
          body={t('production.intro.body')}
        />
        <ProductionProjectsGrid
          projects={media.projects}
          videoSrc={media.cidadeVideoBackgroundSrc}
          onOpen={openLightbox}
          labels={{
            open: t('production.gallery.open', { title: '{title}' }),
            videoAlt: t('production.galleryAlt.cidadeVideo'),
            comingSoon: t('production.gallery.comingSoon'),
            images: t('production.gallery.images', { count: '{count}' }),
          }}
        />
      </main>
      <Footer />
      <ProductionLightbox
        lightbox={lightbox}
        activeItem={activeItem}
        onClose={closeLightbox}
        onPrevious={goPrevious}
        onNext={goNext}
        labels={{
          close: t('production.lightbox.close'),
          previous: t('production.lightbox.previous'),
          next: t('production.lightbox.next'),
        }}
      />
    </div>
  )
}
