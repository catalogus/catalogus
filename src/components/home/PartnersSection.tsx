import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

const partners = [
  { name: 'Camões', logo: '/partners/camoes.png', className: 'scale-125' },
  { name: 'Carlos Morgado', logo: '/partners/carlos_morgado.png' },
  {
    name: 'Embaixada de Espanha',
    logo: '/partners/embaixada-espanha.svg',
    className: 'scale-110',
  },
  { name: 'IGR Maputo', logo: '/partners/igr_maputo.jpg', className: 'scale-140' },
]

export default function PartnersSection() {
  const { t } = useTranslation()
  return (
    <section className="text-gray-900">
      <div className="container mx-auto px-4 py-24 lg:px-15">
        <div className="space-y-5">
          <p className="text-xs uppercase tracking-[0.35em] text-gray-500">
            {t('home.partners.label')}
          </p>
          <h2 className="max-w-4xl text-3xl font-semibold leading-tight text-gray-900 md:text-5xl">
            {t('home.partners.title')}
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="flex min-h-35 items-center justify-center bg-white/80 p-8"
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className={cn(
                  'h-12 w-45 object-contain opacity-70 grayscale md:h-14 md:w-50s',
                  partner.className
                )}
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
