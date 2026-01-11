import { useEffect, useState } from 'react'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { Button } from '../../ui/button'

type AuthorOption = { id: string; name: string }

export type BookFormValues = {
  title: string
  slug: string
  price_mzn: number
  stock: number
  category: string
  language: string
  is_active: boolean
  featured: boolean
  cover_url: string
  cover_path: string
  description: string
  isbn: string
  publisher: string
  seo_title: string
  seo_description: string
  author_ids: string[]
}

type BookFormProps = {
  initial?: Partial<BookFormValues>
  onSubmit: (values: BookFormValues, file?: File | null) => Promise<void> | void
  onCancel: () => void
  submitting?: boolean
  authors: AuthorOption[]
  onCreateAuthor?: (name: string) => Promise<AuthorOption>
}

const defaultValues: BookFormValues = {
  title: '',
  slug: '',
  price_mzn: 0,
  stock: 0,
  category: '',
  language: 'pt',
  is_active: true,
  featured: false,
  cover_url: '',
  cover_path: '',
  description: '',
  isbn: '',
  publisher: '',
  seo_title: '',
  seo_description: '',
  author_ids: [],
}

export function BookForm({
  initial,
  onSubmit,
  onCancel,
  submitting = false,
  authors,
  onCreateAuthor,
}: BookFormProps) {
  const [values, setValues] = useState<BookFormValues>({
    ...defaultValues,
    ...initial,
    author_ids: initial?.author_ids ?? defaultValues.author_ids,
  })
  const [coverPreview, setCoverPreview] = useState<string | null>(
    initial?.cover_url ?? null,
  )
  const [file, setFile] = useState<File | null>(null)
  const [localAuthors, setLocalAuthors] = useState<AuthorOption[]>(authors)
  const [newAuthorName, setNewAuthorName] = useState('')
  const [addingAuthor, setAddingAuthor] = useState(false)
  const [authorSearch, setAuthorSearch] = useState('')
  const [authorPickerOpen, setAuthorPickerOpen] = useState(false)

  useEffect(() => {
    setLocalAuthors(authors)
  }, [authors])

  const handleChange = (
    key: keyof BookFormValues,
    value: string | number | boolean,
  ) => {
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const slug =
      values.slug ||
      values.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
    onSubmit({ ...values, slug }, file)
  }

  const toggleAuthor = (authorId: string) => {
    const isSelected = values.author_ids.includes(authorId)
    const next = isSelected
      ? values.author_ids.filter((id) => id !== authorId)
      : [...values.author_ids, authorId]
    handleChange('author_ids', next)
  }

  const addAuthor = async () => {
    if (!onCreateAuthor) return
    const name = newAuthorName.trim()
    if (!name) return
    setAddingAuthor(true)
    try {
      const created = await onCreateAuthor(name)
      setLocalAuthors((prev) => [...prev, created])
      handleChange('author_ids', [...values.author_ids, created.id])
      setNewAuthorName('')
    } finally {
      setAddingAuthor(false)
    }
  }

  const normalizedSearch = authorSearch.trim().toLowerCase()
  const filteredAuthors = normalizedSearch
    ? localAuthors.filter((author) =>
        author.name.toLowerCase().includes(normalizedSearch),
      )
    : localAuthors
  const selectedAuthors = localAuthors.filter((author) =>
    values.author_ids.includes(author.id),
  )

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          required
          value={values.title}
          onChange={(e) => handleChange('title', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Authors</Label>
          <button
            type="button"
            onClick={() => setAuthorPickerOpen((prev) => !prev)}
            className="text-xs font-semibold text-gray-900 hover:text-gray-700"
          >
            {authorPickerOpen ? 'Hide list' : 'Select authors'}
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Select from the catalog or add a new author.
        </p>
        {selectedAuthors.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedAuthors.map((author) => (
              <span
                key={author.id}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700"
              >
                {author.name}
                <button
                  type="button"
                  onClick={() => toggleAuthor(author.id)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label={`Remove ${author.name}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500">No authors selected yet.</p>
        )}
        {authorPickerOpen && (
          <div className="rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-200 p-2">
              <Input
                placeholder="Search authors..."
                value={authorSearch}
                onChange={(e) => setAuthorSearch(e.target.value)}
              />
            </div>
            <div className="max-h-56 overflow-y-auto">
              {filteredAuthors.map((author) => {
                const selected = values.author_ids.includes(author.id)
                return (
                  <button
                    key={author.id}
                    type="button"
                    onClick={() => toggleAuthor(author.id)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    <span className="text-gray-900">{author.name}</span>
                    <span className="text-xs text-gray-500">
                      {selected ? 'Selected' : 'Add'}
                    </span>
                  </button>
                )
              })}
              {localAuthors.length === 0 && (
                <p className="px-3 py-3 text-xs text-gray-500">
                  No authors yet.
                </p>
              )}
              {localAuthors.length > 0 && filteredAuthors.length === 0 && (
                <p className="px-3 py-3 text-xs text-gray-500">
                  No authors match that search.
                </p>
              )}
            </div>
          </div>
        )}
        {onCreateAuthor && (
          <div className="flex items-center gap-2 pt-2">
            <Input
              placeholder="New author name"
              value={newAuthorName}
              onChange={(e) => setNewAuthorName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addAuthor()
                }
              }}
            />
            <Button type="button" onClick={addAuthor} disabled={addingAuthor}>
              {addingAuthor ? 'Adding…' : 'Add'}
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Cover image</Label>
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
          <div className="flex items-center gap-4">
            <label
              htmlFor="cover"
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100"
            >
              Choose file
            </label>
            <input
              id="cover"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const selected = e.target.files?.[0] ?? null
                setFile(selected)
                if (selected) {
                  setCoverPreview(URL.createObjectURL(selected))
                }
              }}
              className="hidden"
            />
            <div className="flex flex-col text-sm text-gray-600">
              <span className="font-medium">
                {file?.name ?? coverPreview ? 'Preview loaded' : 'No file chosen'}
              </span>
              <span className="text-xs text-gray-500">JPG/PNG, up to 5MB</span>
            </div>
            {coverPreview && (
              <img
                src={coverPreview}
                alt="Cover preview"
                className="h-16 w-12 rounded-md border border-gray-200 object-cover ml-auto"
              />
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          value={values.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price (MZN)</Label>
          <Input
            id="price"
            type="number"
            min={0}
            value={values.price_mzn}
            onChange={(e) => handleChange('price_mzn', Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            type="number"
            min={0}
            value={values.stock}
            onChange={(e) => handleChange('stock', Number(e.target.value))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="isbn">ISBN</Label>
          <Input
            id="isbn"
            value={values.isbn}
            onChange={(e) => handleChange('isbn', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="publisher">Publisher</Label>
          <Input
            id="publisher"
            value={values.publisher}
            onChange={(e) => handleChange('publisher', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={values.category}
            onChange={(e) => handleChange('category', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <select
            id="language"
            value={values.language}
            onChange={(e) => handleChange('language', e.target.value)}
            className="w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          >
            <option value="pt">Português</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="seo_title">SEO title</Label>
        <Input
          id="seo_title"
          value={values.seo_title}
          onChange={(e) => handleChange('seo_title', e.target.value)}
        />
        <Label htmlFor="seo_description" className="pt-1">
          SEO description
        </Label>
        <textarea
          id="seo_description"
          value={values.seo_description}
          onChange={(e) => handleChange('seo_description', e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          rows={2}
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.featured}
            onChange={(e) => handleChange('featured', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <span className="text-gray-900">Featured</span>
        </label>
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.is_active}
            onChange={(e) => handleChange('is_active', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <span className="text-gray-900">Active</span>
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  )
}
