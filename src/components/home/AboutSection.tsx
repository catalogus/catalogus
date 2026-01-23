import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function AboutSection() {
  const { t } = useTranslation()
  const [aboutVisible, setAboutVisible] = useState(false)
  const aboutRef = useRef<HTMLDivElement | null>(null)
  const aboutText = t('home.about.description')
  const aboutWords = aboutText.split(' ')

  useEffect(() => {
    if (!aboutRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAboutVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.35 },
    )
    observer.observe(aboutRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="bg-[#f4efe9]">
      <div className="container mx-auto px-4 py-32 lg:px-15">
        <div
          ref={aboutRef}
          className={`max-w-7xl space-y-6 ${
            aboutVisible ? 'about-reveal-active' : 'about-reveal'
          }`}
        >
          <p className="text-xs uppercase tracking-[0.35em] text-gray-600">
            {t('home.about.label')}
          </p>
          <p className="text-2xl leading-tight text-gray-900 md:text-4xl">
            {aboutWords.map((word, index) => (
              <span
                key={`${word}-${index}`}
                className="reveal-word"
                style={{ animationDelay: `${index * 18}ms` }}
              >
                {word}
                {index < aboutWords.length - 1 ? ' ' : ''}
              </span>
            ))}
          </p>
          <a href="/sobre" className="about-link">
            {t('home.about.cta')}
            <span className="about-link-arrow" aria-hidden="true">
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}
