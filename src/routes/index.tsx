import {
  BookOpen,
  Calendar,
  PenSquare,
  Search,
  Shield,
  ShoppingBag,
} from 'lucide-react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import Header from '../components/Header'
import { Hero } from '../components/Hero'
import AboutSection from '../components/home/AboutSection'
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

  const highlights = [
    {
      title: 'Livros em destaque',
      description: 'Catálogo curado em português e inglês, com stock em tempo real.',
      icon: <BookOpen className="h-10 w-10 text-black" />,
    },
    {
      title: 'Pagamentos M‑Pesa',
      description: 'Checkout seguro no servidor e callbacks para atualizar pedidos.',
      icon: <ShoppingBag className="h-10 w-10 text-black" />,
    },
    {
      title: 'Autoria & comunidade',
      description: 'Autores gerem perfis após aprovação; páginas públicas prontas.',
      icon: <PenSquare className="h-10 w-10 text-black" />,
    },
    {
      title: 'Painel personalizado',
      description: 'Admin completo para livros, autores, pedidos e conteúdo.',
      icon: <Shield className="h-10 w-10 text-black" />,
    },
  ]

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      {heroSlidesQuery.data && heroSlidesQuery.data.length > 0 && (
        <Hero slides={heroSlidesQuery.data} />
      )}
      <main className="space-y-16 pb-16">
        <AboutSection />
      </main>
    </div>
  )
}
