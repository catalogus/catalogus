import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import {
  ContactFormSection,
  ContactHero,
  ContactMap,
  ContactQuickCards,
} from '../../features/contact/ContactPageSections'
import { buildSeo } from '../../lib/seo'

export const Route = createFileRoute('/contactos/')({
  head: () =>
    buildSeo({
      title: 'Contactos',
      description: 'Entre em contacto com a equipa Catalogus.',
      path: '/contactos',
      type: 'website',
    }),
  component: ContactosPage,
})

function ContactosPage() {
  const { t } = useTranslation()
  const addressLines = t('contact.address.lines', { returnObjects: true }) as string[]
  const contactInfo = {
    general: { email: 'info@catalogus.co.mz', phones: [] as string[] },
    editorial: { phones: ['+258 87 000 9194', '+258 84 748 3011'] },
    address: { lines: addressLines },
  }
  const phoneNumbers =
    contactInfo.general.phones.length > 0 ? contactInfo.general.phones : contactInfo.editorial.phones
  const subjectOptions = [
    { value: '', label: t('contact.form.subjectPlaceholder') },
    { value: 'general', label: t('contact.form.subjectOptions.general') },
    { value: 'editorial', label: t('contact.form.subjectOptions.editorial') },
    { value: 'events', label: t('contact.form.subjectOptions.events') },
    { value: 'partnership', label: t('contact.form.subjectOptions.partnership') },
    { value: 'other', label: t('contact.form.subjectOptions.other') },
  ]
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsSuccess(true)
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      <main>
        <ContactHero title={t('contact.hero.title')} subtitle={t('contact.hero.subtitle')} socialTitle={t('footer.columns.social')} />

        <ContactQuickCards
          email={contactInfo.general.email}
          phoneNumbers={phoneNumbers}
          addressLine={contactInfo.address.lines.join(', ')}
          labels={{
            email: t('contact.quick.email'),
            phone: t('contact.quick.phone'),
            address: t('contact.quick.address'),
          }}
        />

        <section className="bg-[#f7f4ef]">
          <div className="container mx-auto px-4 py-16 lg:px-15 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              <ContactFormSection
                title={t('contact.form.title')}
                subtitle={t('contact.form.subtitle')}
                subjectOptions={subjectOptions}
                formData={formData}
                onChange={handleChange}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                isSuccess={isSuccess}
                onResetSuccess={() => setIsSuccess(false)}
                labels={{
                  successTitle: t('contact.form.successTitle'),
                  successBody: t('contact.form.successBody'),
                  successCta: t('contact.form.successCta'),
                  nameLabel: t('contact.form.fields.nameLabel'),
                  namePlaceholder: t('contact.form.fields.namePlaceholder'),
                  emailLabel: t('contact.form.fields.emailLabel'),
                  emailPlaceholder: t('contact.form.fields.emailPlaceholder'),
                  subjectLabel: t('contact.form.fields.subjectLabel'),
                  messageLabel: t('contact.form.fields.messageLabel'),
                  messagePlaceholder: t('contact.form.fields.messagePlaceholder'),
                  submit: t('contact.form.submit'),
                  submitting: t('contact.form.submitting'),
                }}
              />
              <ContactMap title={t('contact.mapTitle')} />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
