import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import Header from '../components/Header'
import { Hero } from '../components/Hero'
import AboutSection from '../components/home/AboutSection'
import FeaturedBooksSection from '../components/home/FeaturedBooksSection'
import FeaturedAuthorsSection from '../components/home/FeaturedAuthorsSection'
import NewsSection from '../components/home/NewsSection'
import PartnersSection from '../components/home/PartnersSection'
import { supabase } from '../lib/supabaseClient'
import type { HeroSlide, HeroSlideWithContent } from '../types/hero'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const heroSlidesQuery = useQuery({
    queryKey: ['hero-slides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .eq('is_active', true)
        .order('order_weight', { ascending: true })
      if (error) throw error
      const slides = (data as HeroSlide[]) ?? []
      const authorIds = Array.from(
        new Set(
          slides
            .filter((slide) => slide.content_type === 'author' && slide.content_id)
            .map((slide) => slide.content_id as string),
        ),
      )
      const bookIds = Array.from(
        new Set(
          slides
            .filter((slide) => slide.content_type === 'book' && slide.content_id)
            .map((slide) => slide.content_id as string),
        ),
      )

      if (authorIds.length === 0 && bookIds.length === 0) {
        return slides as HeroSlideWithContent[]
      }

      const [authorsResult, booksResult] = await Promise.all([
        authorIds.length
          ? supabase
              .from('authors')
              .select('id, name, photo_url, photo_path')
              .in('id', authorIds)
          : Promise.resolve({ data: [], error: null }),
        bookIds.length
          ? supabase
              .from('books')
              .select('id, title, cover_url, cover_path')
              .in('id', bookIds)
          : Promise.resolve({ data: [], error: null }),
      ])

      if (authorsResult.error) throw authorsResult.error
      if (booksResult.error) throw booksResult.error

      const authorMap = new Map(
        (authorsResult.data ?? []).map((author) => {
          const resolvedPhotoUrl =
            author.photo_url ||
            (author.photo_path
              ? supabase.storage.from('author-photos').getPublicUrl(author.photo_path)
                .data.publicUrl
              : null)
          return [author.id, { ...author, photo_url: resolvedPhotoUrl }]
        }),
      )

      const bookMap = new Map(
        (booksResult.data ?? []).map((book) => {
          const resolvedCoverUrl =
            book.cover_url ||
            (book.cover_path
              ? supabase.storage.from('covers').getPublicUrl(book.cover_path).data
                .publicUrl
              : null)
          return [book.id, { ...book, cover_url: resolvedCoverUrl }]
        }),
      )

      return slides.map((slide) => {
        if (slide.content_type === 'author' && slide.content_id) {
          return {
            ...slide,
            linked_content: authorMap.get(slide.content_id) ?? null,
          }
        }
        if (slide.content_type === 'book' && slide.content_id) {
          return {
            ...slide,
            linked_content: bookMap.get(slide.content_id) ?? null,
          }
        }
        return slide
      }) as HeroSlideWithContent[]
    },
    staleTime: 60_000,
  })
  const heroSlides = heroSlidesQuery.data ?? []
  const heroHeight = 'calc(100vh - var(--header-height, 72px))'

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      {heroSlidesQuery.isLoading && (
        <section
          className="relative w-full overflow-hidden bg-[#1c1b1a]"
          style={{ height: heroHeight }}
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.15),transparent_60%)]" />
          <div className="relative z-10 flex h-full items-center">
            <div className="container mx-auto px-4 lg:px-[60px]">
              <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-4">
                  <div className="h-6 w-44 animate-pulse bg-white/25" />
                  <div className="h-12 w-[70%] animate-pulse bg-white/20" />
                  <div className="h-6 w-[55%] animate-pulse bg-white/15" />
                  <div className="h-4 w-[45%] animate-pulse bg-white/10" />
                  <div className="h-10 w-40 animate-pulse bg-white/20" />
                </div>
                <div className="flex flex-1 justify-center lg:justify-end">
                  <div className="relative w-full max-w-md">
                    <div className="absolute -inset-4 border border-white/10" />
                    <div className="relative aspect-[4/5] w-full border border-white/10 bg-white/10 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
      {heroSlides.length > 0 && <Hero slides={heroSlides} />}
      <main className="pb-16">
        <AboutSection />
        <NewsSection />
        <FeaturedBooksSection />
        <FeaturedAuthorsSection />
        <PartnersSection />
      </main>
    </div>
  )
}
