import { Link } from '@tanstack/react-router'
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
      <main className="space-y-16 pb-16 pt-8">
        <section className="px-4 lg:px-15">
          <div className="border border-gray-200 bg-gray-50 p-6 md:p-10">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-6">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                  Livraria & cultura
                </p>
                <div className="space-y-4">
                  <h2 className="text-3xl font-semibold leading-tight text-gray-900 md:text-4xl">
                    Bem-vindo à Catalogus
                  </h2>
                  <p className="max-w-xl text-base text-gray-600 md:text-lg">
                    Descubra uma seleção curada de livros, autores locais e eventos literários.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="border border-gray-200 bg-white p-6">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Agenda da semana</span>
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs uppercase text-gray-500">
                        Clube do livro
                      </p>
                      <p className="text-base font-semibold text-gray-900">
                        Quinta-feira • 18h30
                      </p>
                      <p className="text-sm text-gray-600">
                        Conversa aberta com autores locais.
                      </p>
                    </div>
                    <div className="border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs uppercase text-gray-500">
                        Oficina criativa
                      </p>
                      <p className="text-base font-semibold text-gray-900">
                        Sabado • 10h00
                      </p>
                      <p className="text-sm text-gray-600">
                        Escrita rapida para jovens.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border border-gray-200 bg-white p-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                    Autor do mes
                  </p>
                  <p className="mt-2 text-lg font-semibold text-gray-900">
                    Destaques selecionados pela curadoria.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3 border border-gray-200 bg-white px-4 py-3 shadow-sm md:flex-row md:items-center">
            <div className="flex flex-1 items-center gap-3">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="search"
                placeholder="Pesquisar livros, autores, eventos..."
                className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
              />
            </div>
            <a
              href="/livros"
              className="flex items-center justify-center bg-gray-900 px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-gray-800"
            >
              Pesquisar
            </a>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="border border-gray-200 p-5 bg-white shadow-sm"
              >
                <div className="mb-3">{item.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
