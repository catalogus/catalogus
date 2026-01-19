import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/contactos/')({
  component: ContactosPage,
})

const contactInfo = {
  general: {
    label: 'Informações gerais',
    email: 'geral@catalogus.co.mz',
    phone: '+258 84 123 4567',
  },
  editorial: {
    label: 'Editorial',
    email: 'editorial@catalogus.co.mz',
    phone: '+258 84 765 4321',
  },
  address: {
    label: 'Morada',
    lines: ['Maputo, Moçambique', 'Av. 24 de Julho, 1234'],
  },
}

const socialLinks = [
  { name: 'Facebook', href: 'https://facebook.com/catalogus' },
  { name: 'Instagram', href: 'https://instagram.com/catalogus' },
  { name: 'LinkedIn', href: 'https://linkedin.com/company/catalogus' },
]

// Maputo coordinates
const MAPS_EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3587.123456789!2d32.5732!3d-25.9692!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjXCsDU4JzA5LjEiUyAzMsKwMzQnMjMuNSJF!5e0!3m2!1sen!2smz!4v1234567890'

function ContactosPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    setIsSuccess(true)
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="bg-white">
          <div className="container mx-auto px-4 py-16 lg:px-15 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              {/* Left Column - Title and Description */}
              <div>
                <h1 className="text-4xl font-semibold leading-tight text-gray-900 md:text-6xl">
                  Contacte-nos
                </h1>
                <p className="mt-6 max-w-md text-base leading-relaxed text-gray-600 md:text-lg">
                  Entre em contacto connosco para qualquer questão, colaboração
                  ou informação sobre os nossos serviços.
                </p>

                {/* Social Links */}
                <div className="mt-12 flex gap-6">
                  {socialLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-gray-900 transition-colors hover:text-[#c07238]"
                    >
                      {link.name}
                    </a>
                  ))}
                </div>
              </div>

              {/* Right Column - Contact Info Grid */}
              <div className="grid gap-8 sm:grid-cols-2">
                {/* General Inquiries */}
                <div>
                  <p className="text-sm text-gray-500">{contactInfo.general.label}</p>
                  <div className="mt-3 space-y-1">
                    <a
                      href={`mailto:${contactInfo.general.email}`}
                      className="block text-base font-semibold text-gray-900 transition-colors hover:text-[#c07238]"
                    >
                      {contactInfo.general.email}
                    </a>
                    <a
                      href={`tel:${contactInfo.general.phone.replace(/\s/g, '')}`}
                      className="block text-base font-semibold text-gray-900 transition-colors hover:text-[#c07238]"
                    >
                      {contactInfo.general.phone}
                    </a>
                  </div>
                </div>

                {/* Editorial */}
                <div>
                  <p className="text-sm text-gray-500">{contactInfo.editorial.label}</p>
                  <div className="mt-3 space-y-1">
                    <a
                      href={`mailto:${contactInfo.editorial.email}`}
                      className="block text-base font-semibold text-gray-900 transition-colors hover:text-[#c07238]"
                    >
                      {contactInfo.editorial.email}
                    </a>
                    <a
                      href={`tel:${contactInfo.editorial.phone.replace(/\s/g, '')}`}
                      className="block text-base font-semibold text-gray-900 transition-colors hover:text-[#c07238]"
                    >
                      {contactInfo.editorial.phone}
                    </a>
                  </div>
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <p className="text-sm text-gray-500">{contactInfo.address.label}</p>
                  <div className="mt-3">
                    {contactInfo.address.lines.map((line) => (
                      <p key={line} className="text-base font-semibold text-gray-900">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Contact Cards */}
        <section className="">
          <div className="container mx-auto px-4 py-12 lg:px-15">
            <div className="grid gap-6 md:grid-cols-3">
              <a
                href={`mailto:${contactInfo.general.email}`}
                className="group flex items-start gap-4 border border-gray-200 bg-white p-6 transition-colors hover:border-[#c07238]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#f7f4ef] transition-colors group-hover:bg-[#c07238]/10">
                  <Mail className="h-5 w-5 text-[#c07238]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Email</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {contactInfo.general.email}
                  </p>
                </div>
              </a>

              <a
                href={`tel:${contactInfo.general.phone.replace(/\s/g, '')}`}
                className="group flex items-start gap-4 border border-gray-200 bg-white p-6 transition-colors hover:border-[#c07238]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#f7f4ef] transition-colors group-hover:bg-[#c07238]/10">
                  <Phone className="h-5 w-5 text-[#c07238]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Telefone</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {contactInfo.general.phone}
                  </p>
                </div>
              </a>

              <div className="group flex items-start gap-4 border border-gray-200 bg-white p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#f7f4ef]">
                  <MapPin className="h-5 w-5 text-[#c07238]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Morada</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {contactInfo.address.lines.join(', ')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map and Form Section */}
        <section className="bg-[#f7f4ef]">
          <div className="container mx-auto px-4 py-16 lg:px-15 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              {/* Contact Form */}
              <div className="order-2 lg:order-1">
                <h2 className="text-2xl font-semibold text-gray-900 md:text-3xl">
                  Envie-nos uma mensagem
                </h2>
                <p className="mt-3 text-sm text-gray-600 md:text-base">
                  Preencha o formulário abaixo e entraremos em contacto consigo
                  o mais brevemente possível.
                </p>

                {isSuccess ? (
                  <div className="mt-8 border border-green-200 bg-green-50 p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center bg-green-100">
                        <svg
                          className="h-5 w-5 text-green-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-green-800">
                          Mensagem enviada!
                        </h3>
                        <p className="text-sm text-green-700">
                          Obrigado pelo seu contacto. Responderemos em breve.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSuccess(false)}
                      className="mt-4 text-sm font-medium text-green-700 underline hover:text-green-900"
                    >
                      Enviar outra mensagem
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="name"
                          className="mb-2 block text-sm font-medium text-gray-700"
                        >
                          Nome
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                          placeholder="O seu nome"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="mb-2 block text-sm font-medium text-gray-700"
                        >
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                          placeholder="O seu email"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="subject"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Assunto
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                      >
                        <option value="">Seleccione um assunto</option>
                        <option value="general">Informações gerais</option>
                        <option value="editorial">Publicação / Editorial</option>
                        <option value="events">Eventos e produções</option>
                        <option value="partnership">Parcerias</option>
                        <option value="other">Outro</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Mensagem
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="w-full resize-none border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                        placeholder="A sua mensagem..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={cn(
                        'inline-flex items-center gap-2 bg-[#1c1b1a] px-8 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white transition-colors',
                        'hover:bg-[#c07238] disabled:cursor-not-allowed disabled:opacity-50'
                      )}
                    >
                      {isSubmitting ? (
                        'A enviar...'
                      ) : (
                        <>
                          Enviar mensagem
                          <Send className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>

              {/* Google Maps */}
              <div className="order-1 lg:order-2">
                <div className="aspect-square w-full overflow-hidden bg-gray-200 lg:aspect-auto lg:h-full lg:min-h-[500px]">
                  <iframe
                    src={MAPS_EMBED_URL}
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: '400px' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Localização Catalogus"
                    className="h-full w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
