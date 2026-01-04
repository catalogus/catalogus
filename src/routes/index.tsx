import { Link } from '@tanstack/react-router'
import { BookOpen, ShoppingBag, PenSquare, Shield } from 'lucide-react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
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
      <main className="max-w-6xl mx-auto px-4 py-16 space-y-16">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
              Livraria & cultura
            </p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Catalogus — livros, autores e pagamentos M‑Pesa em um só lugar.
            </h1>
            <p className="text-lg text-gray-600">
              Loja pública, contas de clientes, aprovação de autores e um painel
              de gestão feito sob medida.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/auth/sign-in"
                className="px-5 py-3 rounded-full bg-black text-white text-sm font-semibold hover:bg-gray-900"
              >
                Entrar no painel
              </Link>
              <Link
                to="/admin/dashboard"
                className="px-5 py-3 rounded-full border border-gray-300 text-sm font-semibold hover:border-gray-400"
              >
                Ver admin shell
              </Link>
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Pronto para deploy</span>
                <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700">
                  V1
                </span>
              </div>
              <div className="space-y-3">
                <div className="rounded-2xl bg-white border border-gray-200 p-4">
                  <p className="text-xs text-gray-500">Pagamentos</p>
                  <p className="text-base font-semibold">M‑Pesa C2B</p>
                  <p className="text-sm text-gray-600">Servidor recebe callbacks.</p>
                </div>
                <div className="rounded-2xl bg-white border border-gray-200 p-4">
                  <p className="text-xs text-gray-500">Conteúdo</p>
                  <p className="text-base font-semibold">Livros, posts, parceiros</p>
                  <p className="text-sm text-gray-600">Geridos no painel custom.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm"
            >
              <div className="mb-3">{item.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}
