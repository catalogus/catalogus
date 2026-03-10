import { Mail, MapPin, Phone, Send } from 'lucide-react'
import { CATALOGUS_SOCIAL_LINKS } from '@/lib/socialLinks.tsx'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

export const MAPS_EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m14!1m8!1d448.38230452918225!2d32.5733279!3d-25.9661238!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1ee69b3e2e0a2e25%3A0xc67761a4a41f64c9!2sDEZAINE!5e0!3m2!1sen!2smz!4v1769515561453!5m2!1sen!2smz'

const formatTel = (value: string) => value.replace(/[^\d+]/g, '')

export function ContactHero({ title, subtitle, socialTitle }: { title: string; subtitle: string; socialTitle: string }) {
  const { t } = useTranslation()
  return (
    <section className="bg-white">
      <div className="container mx-auto px-4 py-16 lg:px-15 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h1 className="text-4xl font-semibold leading-tight text-gray-900 md:text-6xl">{title}</h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-gray-600 md:text-lg">{subtitle}</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <p className="text-xs font-bold uppercase tracking-[0.4em] text-black">{socialTitle}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {CATALOGUS_SOCIAL_LINKS.map((link) => (
                  <a key={link.name} href={link.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:border-[#c07238]/60 hover:text-gray-900">
                    <span className="grid h-6 w-6 place-items-center rounded-full border border-gray-200 bg-white text-gray-900">
                      <link.Icon className="h-3.5 w-3.5" />
                    </span>
                    <span>{t(link.labelKey)}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function ContactQuickCards({ email, phoneNumbers, addressLine, labels }: { email: string; phoneNumbers: string[]; addressLine: string; labels: Record<string, string> }) {
  return (
    <section>
      <div className="container mx-auto px-4 py-12 lg:px-15">
        <div className="grid gap-6 md:grid-cols-3">
          <a href={`mailto:${email}`} className="group flex items-start gap-4 border border-gray-200 bg-white p-6 transition-colors hover:border-[#c07238]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#f7f4ef] transition-colors group-hover:bg-[#c07238]/10"><Mail className="h-5 w-5 text-[#c07238]" /></div>
            <div><h3 className="font-semibold text-gray-900">{labels.email}</h3><p className="mt-1 text-sm text-gray-600">{email}</p></div>
          </a>
          <div className="group flex items-start gap-4 border border-gray-200 bg-white p-6 transition-colors hover:border-[#c07238]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#f7f4ef] transition-colors group-hover:bg-[#c07238]/10"><Phone className="h-5 w-5 text-[#c07238]" /></div>
            <div>
              <h3 className="font-semibold text-gray-900">{labels.phone}</h3>
              <div className="mt-1 space-y-1 text-sm text-gray-600">
                {phoneNumbers.map((phone) => <a key={phone} href={`tel:${formatTel(phone)}`} className="block transition-colors hover:text-[#c07238]">{phone}</a>)}
              </div>
            </div>
          </div>
          <div className="group flex items-start gap-4 border border-gray-200 bg-white p-6"><div className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#f7f4ef]"><MapPin className="h-5 w-5 text-[#c07238]" /></div><div><h3 className="font-semibold text-gray-900">{labels.address}</h3><p className="mt-1 text-sm text-gray-600">{addressLine}</p></div></div>
        </div>
      </div>
    </section>
  )
}

export function ContactFormSection({ title, subtitle, subjectOptions, formData, onChange, onSubmit, isSubmitting, isSuccess, onResetSuccess, labels }: { title: string; subtitle: string; subjectOptions: Array<{ value: string; label: string }>; formData: { name: string; email: string; subject: string; message: string }; onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void; onSubmit: (event: React.FormEvent) => Promise<void>; isSubmitting: boolean; isSuccess: boolean; onResetSuccess: () => void; labels: Record<string, string> }) {
  return (
    <div className="order-2 lg:order-1">
      <h2 className="text-2xl font-semibold text-gray-900 md:text-3xl">{title}</h2>
      <p className="mt-3 text-sm text-gray-600 md:text-base">{subtitle}</p>
      {isSuccess ? (
        <div className="mt-8 border border-green-200 bg-green-50 p-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center bg-green-100"><svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div><div><h3 className="font-semibold text-green-800">{labels.successTitle}</h3><p className="text-sm text-green-700">{labels.successBody}</p></div></div><button type="button" onClick={onResetSuccess} className="mt-4 text-sm font-medium text-green-700 underline hover:text-green-900">{labels.successCta}</button></div>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={labels.nameLabel} htmlFor="name"><input type="text" id="name" name="name" value={formData.name} onChange={onChange} required className="w-full border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" placeholder={labels.namePlaceholder} /></Field>
            <Field label={labels.emailLabel} htmlFor="email"><input type="email" id="email" name="email" value={formData.email} onChange={onChange} required className="w-full border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" placeholder={labels.emailPlaceholder} /></Field>
          </div>
          <Field label={labels.subjectLabel} htmlFor="subject"><select id="subject" name="subject" value={formData.subject} onChange={onChange} required className="w-full border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900">{subjectOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></Field>
          <Field label={labels.messageLabel} htmlFor="message"><textarea id="message" name="message" value={formData.message} onChange={onChange} required rows={5} className="w-full resize-none border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" placeholder={labels.messagePlaceholder} /></Field>
          <button type="submit" disabled={isSubmitting} className={cn('inline-flex items-center gap-2 bg-[#1c1b1a] px-8 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white transition-colors', 'hover:bg-[#c07238] disabled:cursor-not-allowed disabled:opacity-50')}>{isSubmitting ? labels.submitting : <>{labels.submit}<Send className="h-4 w-4" /></>}</button>
        </form>
      )}
    </div>
  )
}

export function ContactMap({ title }: { title: string }) {
  return <div className="order-1 lg:order-2"><div className="aspect-square w-full overflow-hidden bg-gray-200 lg:aspect-auto lg:h-full lg:min-h-[500px]"><iframe src={MAPS_EMBED_URL} width="100%" height="100%" style={{ border: 0, minHeight: '400px' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={title} className="h-full w-full" /></div></div>
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return <div><label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-gray-700">{label}</label>{children}</div>
}
