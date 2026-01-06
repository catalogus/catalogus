import { useEffect, useRef, useState } from 'react'

const aboutText =
  'Há 5 anos, a paixão pelos livros, a irreverência e a colaboração movem a equipa da Catalogus. Posicionamo-nos como um dos principais actores do sistema literário e cultural de Moçambique, actuando no campo editorial, na comunicação cultural e na criação e implementação de projectos literários que fortalecem o sector e ampliam o número de leitores. Produzimos eventos e desenvolvemos produtos culturais que aproximam pessoas, ideias e histórias, movidas pelo sonho e pelo desejo de transformação.'
const aboutWords = aboutText.split(' ')

export default function AboutSection() {
  const [aboutVisible, setAboutVisible] = useState(false)
  const aboutRef = useRef<HTMLDivElement | null>(null)

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
            Sobre
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
            Ler mais
            <span className="about-link-arrow" aria-hidden="true">
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}
