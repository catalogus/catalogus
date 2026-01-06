import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import Header from '../components/Header'
import { Hero } from '../components/Hero'
import AboutSection from '../components/home/AboutSection'
import FeaturedBooksSection from '../components/home/FeaturedBooksSection'
import FeaturedAuthorsSection from '../components/home/FeaturedAuthorsSection'
import NewsSection from '../components/home/NewsSection'
import { supabase } from '../lib/supabaseClient'
import type { HeroSlide } from '../types/hero'

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
      return data as HeroSlide[]
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
      </main>
    </div>
  )
}
