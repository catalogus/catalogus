import { useState, useEffect } from 'react'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { Button } from '../../ui/button'
import type { HeroSlideFormValues, ContentType } from '../../../types/hero'
import { toast } from 'sonner'

type HeroSlideFormProps = {
  initial?: Partial<HeroSlideFormValues>
  onSubmit: (values: HeroSlideFormValues, file?: File | null) => Promise<void> | void
  onCancel: () => void
  submitting?: boolean
  books: { id: string; title: string; cover_url: string | null }[]
  authors: { id: string; name: string; photo_url: string | null }[]
  posts: { id: string; title: string; featured_image_url: string | null }[]
}

const defaultValues: HeroSlideFormValues = {
  title: '',
  subtitle: '',
  description: '',
  cta_text: '',
  cta_url: '',
  background_image_url: '',
  background_image_path: '',
  accent_color: '',
  content_type: 'custom',
  content_id: null,
  order_weight: 0,
  is_active: true,
}

export function HeroSlideForm({
  initial,
  onSubmit,
  onCancel,
  submitting = false,
  books,
  authors,
  posts,
}: HeroSlideFormProps) {
  const maxImageSize = 5 * 1024 * 1024
  const [values, setValues] = useState<HeroSlideFormValues>({
    ...defaultValues,
    ...initial,
  })
  const [imagePreview, setImagePreview] = useState<string | null>(
    initial?.background_image_url ?? null,
  )
  const [file, setFile] = useState<File | null>(null)
  const accentPickerValue = /^#[0-9a-fA-F]{6}$/.test(values.accent_color)
    ? values.accent_color
    : '#4b5563'

  const handleChange = (
    key: keyof HeroSlideFormValues,
    value: string | number | boolean | null,
  ) => {
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!values.title.trim()) {
      toast.error('Title is required')
      return
    }

    try {
      await onSubmit(values, file)
    } catch (error) {
      console.error('Submit error:', error)
    }
  }

  const getContentOptions = () => {
    switch (values.content_type) {
      case 'book':
        return books
      case 'author':
        return authors
      case 'post':
        return posts
      default:
        return []
    }
  }

  const getContentLabel = (item: any) => {
    if (values.content_type === 'author') {
      return item.name
    }
    return item.title
  }

  // Auto-populate CTA URL when content is selected
  useEffect(() => {
    if (values.content_type === 'custom' || !values.content_id) {
      return
    }

    let autoUrl = ''
    switch (values.content_type) {
      case 'book':
        autoUrl = `/livro/${values.content_id}`
        break
      case 'author':
        autoUrl = `/autor/${values.content_id}`
        break
      case 'post':
        autoUrl = `/post/${values.content_id}`
        break
    }

    if (autoUrl && values.cta_url !== autoUrl) {
      handleChange('cta_url', autoUrl)
    }
  }, [values.content_type, values.content_id])

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Background Image */}
      <div className="space-y-2">
        <Label>Background Image</Label>
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
          <div className="flex items-center gap-4">
            <label
              htmlFor="background-image"
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100"
            >
              Choose file
            </label>
            <input
              id="background-image"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const selected = e.target.files?.[0] ?? null
                if (selected && selected.size > maxImageSize) {
                  toast.error('Background image must be 5MB or less.')
                  e.currentTarget.value = ''
                  return
                }
                setFile(selected)
                if (selected) {
                  setImagePreview(URL.createObjectURL(selected))
                }
              }}
              className="hidden"
            />
            <div className="flex flex-col text-sm text-gray-600">
              <span className="font-medium">
                {file?.name ?? imagePreview ? 'Preview loaded' : 'No file chosen'}
              </span>
              <span className="text-xs text-gray-500">JPG/PNG, up to 5MB</span>
            </div>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Background preview"
                className="h-20 w-32 rounded-md border border-gray-200 object-cover ml-auto"
              />
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Upload a landscape image optimized for hero display (recommended: 1920x1080)
        </p>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          required
          value={values.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Enter slide title"
        />
      </div>

      {/* Subtitle */}
      <div className="space-y-2">
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input
          id="subtitle"
          value={values.subtitle}
          onChange={(e) => handleChange('subtitle', e.target.value)}
          placeholder="Enter subtitle (optional)"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          value={values.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          rows={3}
          placeholder="Brief description of the slide"
        />
      </div>

      {/* CTA Text */}
      <div className="space-y-2">
        <Label htmlFor="cta_text">Call-to-Action Text</Label>
        <Input
          id="cta_text"
          value={values.cta_text}
          onChange={(e) => handleChange('cta_text', e.target.value)}
          placeholder="e.g., Explorar, Ver Mais, Saber Mais"
        />
      </div>

      {/* CTA URL */}
      <div className="space-y-2">
        <Label htmlFor="cta_url">Call-to-Action URL</Label>
        <Input
          id="cta_url"
          value={values.cta_url}
          onChange={(e) => handleChange('cta_url', e.target.value)}
          placeholder="/livros, /autores, https://..."
          disabled={values.content_type !== 'custom' && !!values.content_id}
        />
        {values.content_type !== 'custom' && values.content_id ? (
          <p className="text-xs text-blue-600">
            Auto-populated from selected {values.content_type}. Change content type to "Custom" to edit manually.
          </p>
        ) : (
          <p className="text-xs text-gray-500">
            Enter a relative path (/livros) or absolute URL (https://example.com)
          </p>
        )}
      </div>

      {values.content_type === 'author' && (
        <div className="space-y-2">
          <Label htmlFor="accent_color">Accent Color</Label>
          <div className="flex items-center gap-3">
            <input
              id="accent_color"
              type="color"
              value={accentPickerValue}
              onChange={(e) => handleChange('accent_color', e.target.value)}
              className="h-10 w-14 cursor-pointer rounded border border-gray-300 bg-white p-1"
            />
            <Input
              type="text"
              value={values.accent_color}
              onChange={(e) => handleChange('accent_color', e.target.value)}
              placeholder="#4b5563"
            />
          </div>
          <p className="text-xs text-gray-500">
            Used as the background for Author Highlight slides.
          </p>
        </div>
      )}

      {/* Content Type */}
      <div className="space-y-2">
        <Label htmlFor="content_type">Content Type</Label>
        <select
          id="content_type"
          value={values.content_type}
          onChange={(e) => {
            const newType = e.target.value as ContentType
            handleChange('content_type', newType)
            handleChange('content_id', null)
            if (newType !== 'author') {
              handleChange('accent_color', '')
            }
          }}
          className="w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
        >
          <option value="custom">Custom (standalone slide)</option>
          <option value="book">Book Highlight</option>
          <option value="author">Author Highlight</option>
          <option value="post">Post Highlight</option>
        </select>
        <p className="text-xs text-gray-500">
          Select what this slide should highlight. Choose "Custom" for standalone slides.
        </p>
      </div>

      {/* Content Picker (conditional) */}
      {values.content_type !== 'custom' && (
        <div className="space-y-2">
          <Label htmlFor="content_id">
            Select {values.content_type === 'book' ? 'Book' : values.content_type === 'author' ? 'Author' : 'Post'}
          </Label>
          <select
            id="content_id"
            value={values.content_id ?? ''}
            onChange={(e) => handleChange('content_id', e.target.value || null)}
            className="w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          >
            <option value="">-- Select {values.content_type} --</option>
            {getContentOptions().map((item) => (
              <option key={item.id} value={item.id}>
                {getContentLabel(item)}
              </option>
            ))}
          </select>
          {getContentOptions().length === 0 && (
            <p className="text-xs text-amber-600">
              No {values.content_type}s available. Create one first or select "Custom" type.
            </p>
          )}
          {values.content_type === 'author' && (
            <p className="text-xs text-gray-500">
              Only featured authors appear here. Mark authors as featured in the Authors admin.
            </p>
          )}
        </div>
      )}

      {/* Order Weight & Active Status */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="order_weight">Order Weight</Label>
          <Input
            id="order_weight"
            type="number"
            value={values.order_weight}
            onChange={(e) => handleChange('order_weight', parseInt(e.target.value, 10) || 0)}
            placeholder="0"
          />
          <p className="text-xs text-gray-500">
            Lower numbers appear first in the carousel
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="is_active">Status</Label>
          <div className="flex items-center gap-4 pt-2">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={values.is_active}
                onChange={(e) => handleChange('is_active', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-gray-900">Active (visible on homepage)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save Slide'}
        </Button>
      </div>
    </form>
  )
}
