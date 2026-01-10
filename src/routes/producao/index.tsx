import { useCallback, useEffect, useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import Header from '../../components/Header'

export const Route = createFileRoute('/producao/')({
  component: ProducaoPage,
})

type GalleryImage = {
  src: string
  alt: string
}

type Project = {
  id: string
  title: string
  description: string
  meta: string[]
  gallery?: GalleryImage[]
}

const cidadeGalleryFiles = [
  'PAP_6350.jpg',
  'PAP_6377.jpg',
  '_PAP5469.jpg',
  '_PAP5483.jpg',
  '_PAP5494.jpg',
  '_PAP5500.jpg',
  '_PAP5539.jpg',
  '_PAP5564.jpg',
  '_PAP5580.jpg',
  '_PAP5672.jpg',
  '_PAP5746.jpg',
]

const cidadeGallery: GalleryImage[] = cidadeGalleryFiles.map((file, index) => ({
  src: `/cidade_nas_maos/${file}`,
  alt: `Cidade nas Mãos — fotografia ${index + 1}`,
}))

const suhuraGalleryFiles = [
  'P1100250.png',
  'P1100274.png',
  'P1100295.png',
  'P1100295n.png',
]

const suhuraGallery: GalleryImage[] = suhuraGalleryFiles.map((file, index) => ({
  src: `/ninguem_matou_suhura/${file}`,
  alt: `Ninguém Matou Suhura — fotografia ${index + 1}`,
}))

const projects: Project[] = [
  {
    id: 'cidade-nas-maos',
    title: 'Cidade nas Mãos',
    description:
      'Festival cultural iniciado em 2025, baseado em Maputo, com o objectivo de usar a arte (performance, debates, música, dança, literatura) como ferramenta para repensar e humanizar o espaço urbano, promovendo o acesso à cultura e participação comunitária para uma cidade mais sustentável e inclusiva.',
    meta: ['Festival cultural', 'Maputo', '2025'],
    gallery: cidadeGallery,
  },
  {
    id: 'anonimus-manifesto-literario',
    title: 'Anonimus - Manifesto Literário',
    description: 'Descrição, ano, fotografias/vídeo.',
    meta: ['Em preparação'],
  },
  {
    id: 'o-casal-palavrakis',
    title: 'O Casal Palavrakis',
    description: 'Descrição, ano, fotografias/vídeo.',
    meta: ['Em preparação'],
  },
  {
    id: 'como-uma-gota-de-sol',
    title: 'Como uma gota de sol',
    description: 'Descrição, ano, fotografias/vídeo.',
    meta: ['Em preparação'],
  },
  {
    id: 'coloquio-ninguem-matou-suhura',
    title: 'Colóquio: Ninguém Matou Suhura',
    description: 'Descrição, ano, fotografias/vídeo.',
    meta: ['Em preparação'],
    gallery: suhuraGallery,
  },
  {
    id: 'encontro-com-livro',
    title: 'Encontro com livro',
    description: 'Descrição, ano, fotografias/vídeo.',
    meta: ['Em preparação'],
  },
]

const tileLayouts = [
  { className: 'lg:col-span-7 lg:row-span-2', size: 'large' },
  { className: 'lg:col-span-5 lg:row-span-2', size: 'medium' },
  { className: 'lg:col-span-5 lg:row-span-2', size: 'medium' },
  { className: 'lg:col-span-7 lg:row-span-2', size: 'large' },
  { className: 'lg:col-span-6 lg:row-span-2', size: 'small' },
  { className: 'lg:col-span-6 lg:row-span-2', size: 'small' },
]

const tileGradients = [
  'from-[#0d0b12] via-[#2c1f3b] to-[#5f4aa8]',
  'from-[#1a1613] via-[#4a2f1b] to-[#b36a39]',
  'from-[#121417] via-[#27424d] to-[#5d91a2]',
  'from-[#141212] via-[#3a262b] to-[#a64d5c]',
  'from-[#151312] via-[#3b3328] to-[#7c6a50]',
  'from-[#101417] via-[#24323f] to-[#4a6a8a]',
]

const tagPalette = [
  'bg-[#c6f36d] text-black',
  'bg-[#ffd166] text-black',
  'bg-[#5de2ff] text-black',
  'bg-[#ff8fab] text-black',
  'bg-[#bdb2ff] text-black',
  'bg-[#a6ff8f] text-black',
  'bg-[#ffc6ff] text-black',
]

type LightboxState = {
  images: GalleryImage[]
  index: number
  title: string
}

function ProducaoPage() {
  const [lightbox, setLightbox] = useState<LightboxState | null>(null)

  const activeImage = useMemo(() => {
    if (!lightbox) return null
    return lightbox.images[lightbox.index]
  }, [lightbox])

  const openLightbox = useCallback(
    (images: GalleryImage[], index: number, title: string) => {
      setLightbox({ images, index, title })
    },
    [],
  )

  const closeLightbox = useCallback(() => {
    setLightbox(null)
  }, [])

  const goNext = useCallback(() => {
    setLightbox((current) => {
      if (!current) return current
      const nextIndex = (current.index + 1) % current.images.length
      return { ...current, index: nextIndex }
    })
  }, [])

  const goPrevious = useCallback(() => {
    setLightbox((current) => {
      if (!current) return current
      const nextIndex =
        (current.index - 1 + current.images.length) % current.images.length
      return { ...current, index: nextIndex }
    })
  }, [])

  useEffect(() => {
    if (!lightbox) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeLightbox()
      } else if (event.key === 'ArrowRight') {
        goNext()
      } else if (event.key === 'ArrowLeft') {
        goPrevious()
      }
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
        <section className="relative overflow-hidden bg-[#151311]   text-white">
          <div className="absolute -top-24 right-0 h-64 w-64 rounded-full bg-[#c07238]/30 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[#f3e2cf]/10 blur-3xl" />
          <div className="container relative mx-auto px-4 py-24 lg:px-15">
            <p className="text-xs uppercase tracking-[0.4em] text-white/70">
              Festivais e feiras | espectáculos | cóloquios
            </p>
            <h1 className="mt-4 text-4xl font-semibold md:text-6xl">
              Produção
            </h1>
            <p className="mt-5 max-w-2xl text-base text-white/80 md:text-lg">
              Projectos culturais que ocupam a cidade, conectam pessoas e criam
              novas formas de viver a literatura e as artes.
            </p>
          </div>
        </section>

        <section className="bg-white">
          <div className="container mx-auto px-4 py-16 lg:px-15">
            <div className="max-w-3xl space-y-4">
              <p className="text-xs uppercase tracking-[0.35em] text-[#7f6f63]">
                Projectos em destaque
              </p>
              <h2 className="text-3xl font-semibold md:text-4xl">
                Cada produção é uma galeria viva
              </h2>
              <p className="text-sm text-[#5a514a] md:text-base">
                Aqui reunimos processos, performances e encontros que fazem a
                cultura respirar em Maputo e além. Cada projecto ganha um
                arquivo visual próprio com fotografias e vídeos.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="container mx-auto px-4 py-20 lg:px-15">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-12 lg:auto-rows-[220px] lg:gap-7">
              {projects.map((project, index) => {
                const layout = tileLayouts[index % tileLayouts.length]
                const size = layout.size
                const coverImage = project.gallery?.[0] ?? null
                const hasGallery = (project.gallery?.length ?? 0) > 0
                const gradient = tileGradients[index % tileGradients.length]
                const titleClass =
                  size === 'large'
                    ? 'text-3xl md:text-4xl'
                    : size === 'medium'
                      ? 'text-2xl md:text-3xl'
                      : 'text-2xl'
                const descriptionClass =
                  size === 'small' ? 'text-sm' : 'text-sm md:text-base'
                return (
                  <button
                    key={project.id}
                    id={project.id}
                    type="button"
                    onClick={() =>
                      hasGallery &&
                      openLightbox(project.gallery ?? [], 0, project.title)
                    }
                    disabled={!hasGallery}
                    className={`group relative flex min-h-[260px] w-full flex-col overflow-hidden rounded-none text-left transition-transform duration-300 md:min-h-[320px] lg:min-h-[240px] ${layout.className} ${
                      hasGallery
                        ? 'cursor-pointer hover:-translate-y-1'
                        : 'cursor-default'
                    }`}
                    aria-label={`Abrir galeria de ${project.title}`}
                  >
                    {coverImage ? (
                      <img
                        src={coverImage.src}
                        alt={coverImage.alt}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${gradient}`}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/20 to-black/70" />
                    <div className="relative z-10 flex h-full flex-col justify-between p-6 md:p-7 lg:p-8">
                      <div className="space-y-3">
                        <h3 className={`${titleClass} font-semibold text-white`}>
                          {project.title}
                        </h3>
                        <p
                          className={`${descriptionClass} line-clamp-3 text-white/80`}
                        >
                          {project.description}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-6 text-[10px] uppercase tracking-[0.35em]">
                        {project.meta.map((item, itemIndex) => {
                          const tagClass =
                            tagPalette[(index + itemIndex) % tagPalette.length]
                          return (
                          <span
                            key={item}
                            className={`border border-white/20 px-3 py-1 ${tagClass}`}
                          >
                            {item}
                          </span>
                          )
                        })}
                        {!hasGallery && (
                          <span className="border border-white/30 bg-white/70 px-3 py-1 text-black">
                            Em breve
                          </span>
                        )}
                      </div>
                    </div>
                    {hasGallery && (
                      <span className="absolute right-6 top-6 rounded-none bg-black/50 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white/80">
                        {project.gallery?.length} imagens
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </section>
      </main>

      {lightbox && activeImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6"
          role="dialog"
          aria-modal="true"
          onClick={closeLightbox}
        >
          <div
            className="relative w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute -top-10 right-0 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/80 hover:text-white"
            >
              Fechar
              <X className="h-4 w-4" />
            </button>

            <div className="relative overflow-hidden bg-black">
              <img
                src={activeImage.src}
                alt={activeImage.alt}
                className="h-[70vh] w-full object-contain"
              />

              {lightbox.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goPrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center border border-white/40 bg-black/40 text-white transition hover:bg-black/60"
                    aria-label="Imagem anterior"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center border border-white/40 bg-black/40 text-white transition hover:bg-black/60"
                    aria-label="Imagem seguinte"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.35em] text-white/70">
              <span>{lightbox.title}</span>
              <span>
                {lightbox.index + 1} / {lightbox.images.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
