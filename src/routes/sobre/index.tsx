import { createFileRoute } from '@tanstack/react-router'
import Header from '../../components/Header'

export const Route = createFileRoute('/sobre/')({
  component: AboutPage,
})

const introText =
  'A CATALOGUS é uma instituição cultural de actividade abrangente e diversificada, actuando no campo editorial, comunicação cultural, gestão de projectos literários, produção de eventos e criação de produtos culturais. Dedicada a explorar novos mecanismos para o alcance de novos públicos e mercados para o trabalho literário, a Catalogus associa paixão, irreverência e colaboração, posicionando-se como um dos principais actores no sistema literário e cultural de Moçambique.'

const focusAreas = [
  {
    title: 'Editorial',
    description:
      'A CATALOGUS está comprometida com a valorização da literatura, promovendo autores emergentes e consagrados através de uma linha editorial inovadora e diversificada. Nosso catálogo abrange desde ficção a não-ficção, explorando novas vozes e histórias que reflectem a riqueza da criatividade. Mais do que publicar livros, buscamos conectar os leitores a experiências profundas, contribuindo para o fortalecimento da literatura no cenário global.',
  },
  {
    title: 'Comunicação cultural',
    description:
      'Com uma abordagem ousada e criativa, a CATALOGUS actua na comunicação cultural, desenvolvendo estratégias que conectam artistas, instituições e o público. Trabalhamos para dar visibilidade às expressões culturais, utilizando diversos canais de comunicação para promover diálogos que fortaleçam o cenário artístico e literário do país. A nossa missão é garantir que a arte e a cultura tenham um lugar central na vida das pessoas.',
  },
  {
    title: 'Produção de eventos (lançamentos, teatro, performance)',
    description:
      'A CATALOGUS organiza eventos culturais que transcendem o convencional, criando experiências imersivas e inovadoras. Desde lançamentos de livros, espectáculos de teatro e performances. Cada evento é cuidadosamente planejado para destacar o melhor da cultura, promovendo encontros autênticos entre artistas e público. Actuamos como ponte entre a criação artística e os seus apreciadores, celebrando a diversidade e a irreverência.',
  },
  {
    title: 'Comércio de produtos culturais (livraria, loja)',
    description:
      'A CATALOGUS oferece uma seleção única de produtos culturais que vão além dos livros, com curadoria de itens que reflectem a identidade artística e literária. Nossa livraria e loja são espaços de encontro, onde os apaixonados pela cultura podem adquirir obras de autores locais, artefatos e produtos exclusivos, ampliando o acesso e o reconhecimento da produção cultural do país. Aqui, cultura e comércio se unem para promover a riqueza criativa do que temos de melhor.',
  },
]

const services = [
  'Consultoria editorial',
  'Desenvolvimento de projectos culturais',
  'Produção de eventos culturais',
  'Mentoria Literária & oficinas criativas',
  'Assessoria de Imprensa',
]

function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />

      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-[#f7f2ed] via-[#f4efe9] to-[#efe6db]">
          <div className="absolute -top-10 right-0 h-64 w-64 rounded-full bg-[#c07238]/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[#1f1b16]/10 blur-3xl" />
          <div className="container mx-auto px-4 py-24 lg:px-15">
            <div className="max-w-3xl space-y-6">
              <p className="text-xs uppercase tracking-[0.35em] text-gray-600">
                Sobre
              </p>
              <h1 className="text-3xl font-semibold leading-tight text-gray-900 md:text-5xl">
                CATALOGUS
              </h1>
              <p className="text-base leading-relaxed text-gray-700 md:text-lg">
                {introText}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="container mx-auto px-4 py-20 lg:px-15">
            <div className="max-w-2xl space-y-4">
              <p className="text-xs uppercase tracking-[0.35em] text-gray-500">
                Áreas de actuação
              </p>
              <h2 className="text-3xl font-semibold leading-tight text-gray-900 md:text-4xl">
                O que fazemos
              </h2>
            </div>

            <div className="mt-12 grid gap-8 lg:grid-cols-2">
              {focusAreas.map((area, index) => (
                <article
                  key={area.title}
                  className="relative border border-gray-200 bg-white p-8"
                >
                  <span className="absolute -top-5 right-6 text-4xl font-semibold text-[#d7c2b1]/70">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-2xl font-semibold text-gray-900">
                    {area.title}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-gray-700 md:text-base">
                    {area.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#1f1b16] text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(192,114,56,0.24),transparent_60%)]" />
          <div className="container relative mx-auto px-4 py-20 lg:px-15">
            <div className="max-w-2xl space-y-4">
              <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
                Serviços
              </h2>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <div
                  key={service}
                  className="border border-white/15 bg-white/5 px-5 py-4 text-sm font-semibold text-white/90"
                >
                  {service}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
