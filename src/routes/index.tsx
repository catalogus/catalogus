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

      if (authorIds.length === 0) {
        return slides as HeroSlideWithContent[]
      }

      const { data: authors, error: authorsError } = await supabase
        .from('authors')
        .select('id, name, photo_url, photo_path')
        .in('id', authorIds)
      if (authorsError) throw authorsError

      const authorMap = new Map(
        (authors ?? []).map((author) => {
          const resolvedPhotoUrl =
            author.photo_url ||
            (author.photo_path
              ? supabase.storage.from('author-photos').getPublicUrl(author.photo_path)
                .data.publicUrl
              : null)
          return [author.id, { ...author, photo_url: resolvedPhotoUrl }]
        }),
      )

      return slides.map((slide) => {
        if (slide.content_type !== 'author' || !slide.content_id) {
          return slide
        }
        return {
          ...slide,
          linked_content: authorMap.get(slide.content_id) ?? null,
        }
      }) as HeroSlideWithContent[]
    },
    staleTime: 60_000,
  })

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      {heroSlidesQuery.data && heroSlidesQuery.data.length > 0 && (
        <Hero slides={heroSlidesQuery.data} />
      )}
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
