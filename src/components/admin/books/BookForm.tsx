import { useState } from 'react'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { Button } from '../../ui/button'

export type BookFormValues = {
  title: string
  slug: string
  price_mzn: number
  stock: number
  category: string
  language: string
  is_active: boolean
  cover_url: string
  description: string
}

type BookFormProps = {
  initial?: Partial<BookFormValues>
  onSubmit: (values: BookFormValues) => Promise<void> | void
  onCancel: () => void
  submitting?: boolean
}

const defaultValues: BookFormValues = {
  title: '',
  slug: '',
  price_mzn: 0,
  stock: 0,
  category: '',
  language: 'pt',
  is_active: true,
  cover_url: '',
  description: '',
}

export function BookForm({
  initial,
  onSubmit,
  onCancel,
  submitting = false,
}: BookFormProps) {
  const [values, setValues] = useState<BookFormValues>({
    ...defaultValues,
    ...initial,
  })

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
    onSubmit(values)
  }

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
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          required
          value={values.slug}
          onChange={(e) => handleChange('slug', e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cover_url">Cover URL</Label>
        <Input
          id="cover_url"
          value={values.cover_url}
          onChange={(e) => handleChange('cover_url', e.target.value)}
          placeholder="https://..."
        />
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
      <div className="flex items-center gap-2">
        <input
          id="is_active"
          type="checkbox"
          checked={values.is_active}
          onChange={(e) => handleChange('is_active', e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="is_active" className="text-sm font-normal">
          Active
        </Label>
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
