import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { normalizeSearchTerm } from '../../lib/searchHelpers'

export function FloatingSearch() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const previousOverflow = useRef('')

  useEffect(() => {
    if (!open) return

    previousOverflow.current = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const id = requestAnimationFrame(() => inputRef.current?.focus())
    return () => {
      cancelAnimationFrame(id)
      document.body.style.overflow = previousOverflow.current
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

  useEffect(() => {
    const isEditableTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false
      if (target.isContentEditable) return true
      const tagName = target.tagName.toLowerCase()
      return tagName === 'input' || tagName === 'textarea' || tagName === 'select'
    }

    const handleShortcut = (event: KeyboardEvent) => {
      if (open || isEditableTarget(event.target)) return
      const key = event.key.toLowerCase()
      const isSlash =
        (key === '/' || event.code === 'Slash') &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey
      const isCmdK =
        key === 'k' && (event.metaKey || event.ctrlKey) && !event.altKey

      if (!isSlash && !isCmdK) return
      event.preventDefault()
      event.stopPropagation()
      setOpen(true)
    }

    window.addEventListener('keydown', handleShortcut, true)
    return () => window.removeEventListener('keydown', handleShortcut, true)
  }, [open])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = normalizeSearchTerm(value)
    if (!trimmed) return
    navigate({ to: '/pesquisa', search: { q: trimmed } })
    setOpen(false)
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--brand)] text-white shadow-lg transition-transform hover:-translate-y-0.5"
          aria-label="Abrir pesquisa"
        >
          <Search className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <form onSubmit={handleSubmit}>
              <label className="relative block">
                <span className="sr-only">Pesquisar</span>
                <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  ref={inputRef}
                  type="search"
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  placeholder="Pesquise por autor, livro ou noticia"
                  className="h-14 w-full rounded-full border border-gray-200 bg-white px-14 text-sm text-gray-900 shadow-lg outline-none transition focus:border-[color:var(--brand)]"
                />
              </label>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
