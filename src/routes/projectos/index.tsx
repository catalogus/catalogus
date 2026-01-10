import { createFileRoute } from '@tanstack/react-router'
import Header from '../../components/Header'

export const Route = createFileRoute('/projectos/')({
  component: ProjectsPage,
})

const projects = [
  {
    title: 'Prémio Literário Carlos Morgado',
    slug: 'premio-literario-carlos-morgado',
    eyebrow: 'Literatura & reconhecimento',
    description:
      'Instituído pela Fundação Carlos Morgado (FCM), uma organização moçambicana sem fins lucrativos que visa potencializar e promover o desenvolvimento sustentável de Moçambique e organizado pela Catalogus, plataforma de promoção de autores moçambicanos, têm como com a finalidade de contribuir para a construção e projecção de novas vozes literárias em Moçambique e celebrar a contribuição de Carlos Morgado enquanto cidadão moçambicano e defensor de causas nobres.',
  },
  {
    title: 'Anonimus Podcast',
    slug: 'anonimus-podcast',
    eyebrow: 'Conversas culturais',
    description:
      'Anonimus Podcast é uma série de conversas criativas e educativas sobre cultura e pessoas, com personalidades de diferentes áreas de saber, de olhar atento sobre o que acontece em nosso torno. Da literatura à tecnologia, da arquitectura à saúde, dos movimentos urbanos às transformações estéticas, meio ambiente, pessoas e humanidade.',
  },
  {
    title: 'Oficinas Criativas',
    slug: 'oficinas-criativas',
    eyebrow: 'Formação & prática',
    description: '',
  },
]

const projectNames = projects.map((project) => project.title).join(' · ')

const projectVisuals = [
  {
    gradient:
      'linear-gradient(120deg, rgba(16,11,8,0.92) 0%, rgba(86,56,34,0.95) 45%, rgba(192,114,56,0.95) 100%)',
    highlight:
      'radial-gradient(circle at top, rgba(255,255,255,0.35), transparent 55%)',
  },
  {
    gradient:
      'linear-gradient(120deg, rgba(30,29,32,0.95) 0%, rgba(71,84,91,0.92) 45%, rgba(118,159,167,0.95) 100%)',
    highlight:
      'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.3), transparent 55%)',
  },
  {
    gradient:
      'linear-gradient(120deg, rgba(24,21,18,0.95) 0%, rgba(96,74,53,0.9) 45%, rgba(210,174,132,0.95) 100%)',
    highlight:
      'radial-gradient(circle at 70% 15%, rgba(255,255,255,0.3), transparent 55%)',
  },
]

function ProjectsPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />

      <main>
        <section className="bg-[#1c1b1a] text-white">
          <div className="container mx-auto px-4 py-16 lg:px-15">
            <h1 className="text-4xl font-semibold md:text-6xl">Projectos</h1>
            <p className="mt-4 text-lg text-white/80">
              Conheca os nossos projectos culturais
            </p>
          </div>
        </section>

        <section className="bg-[#f7f2ed]">
          <div className="container mx-auto px-4 pb-24 pt-10 lg:px-15">
            <div className="space-y-12">
              {projects.map((project, index) => {
                const isReversed = index % 2 === 1
                const visual = projectVisuals[index % projectVisuals.length]
                return (
                  <article
                    key={project.title}
                    id={project.slug}
                    className="scroll-mt-24 overflow-hidden border border-[#e2d6ca] bg-white lg:grid lg:grid-cols-[1.1fr_1fr]"
                  >
                    <div
                      className={`relative min-h-[240px] ${
                        isReversed ? 'lg:order-2' : ''
                      }`}
                      style={{
                        backgroundImage: `${visual.highlight}, ${visual.gradient}`,
                      }}
                    >
                      <div className="absolute inset-0 bg-black/20" />
                      <div className="relative flex h-full flex-col justify-end gap-3 px-8 py-10 text-white">
                        <h3 className="text-2xl font-semibold leading-tight md:text-3xl">
                          {project.title}
                        </h3>
                      </div>
                    </div>

                    <div
                      className={`flex flex-col justify-center gap-4 px-8 py-10 ${
                        isReversed ? 'lg:order-1' : ''
                      }`}
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#9a8776]">
                        {project.eyebrow}
                      </p>
                      <p className="text-sm leading-relaxed text-[#4e463e] md:text-base">
                        {project.description || 'Detalhes em breve.'}
                      </p>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
