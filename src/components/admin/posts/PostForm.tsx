import { useEffect, useState } from 'react'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { Button } from '../../ui/button'
import { TipTapEditor } from './TipTapEditor'
import type { PostFormValues, Category, Tag, PostStatus } from '../../../types/post'
import { toast } from 'sonner'
import { validateAndOptimizeImage } from '../../../lib/imageOptimization'

type CategoryOption = Category
type TagOption = Tag

type PostFormProps = {
  initial?: Partial<PostFormValues>
  onSubmit: (values: PostFormValues, file?: File | null) => Promise<void> | void
  onTranslate?: (values: PostFormValues, file?: File | null) => Promise<void> | void
  onCancel: () => void
  submitting?: boolean
  translating?: boolean
  categories: CategoryOption[]
  tags: TagOption[]
  onCreateTag?: (name: string) => Promise<TagOption>
  currentUserId?: string
}

const defaultValues: PostFormValues = {
  title: '',
  slug: '',
  excerpt: '',
  body: '',
  featured_image_url: '',
  featured_image_path: '',
  author_id: '',
  status: 'draft',
  published_at: null,
  featured: false,
  language: 'pt',
  category_ids: [],
  tag_ids: [],
  new_tags: [],
}

export function PostForm({
  initial,
  onSubmit,
  onTranslate,
  onCancel,
  submitting = false,
  translating = false,
  categories,
  tags,
  onCreateTag,
  currentUserId = '',
}: PostFormProps) {
  const maxFeaturedImageSize = 5 * 1024 * 1024
  const [values, setValues] = useState<PostFormValues>({
    ...defaultValues,
    ...initial,
    author_id: initial?.author_id ?? currentUserId,
    category_ids: initial?.category_ids ?? defaultValues.category_ids,
    tag_ids: initial?.tag_ids ?? defaultValues.tag_ids,
    new_tags: initial?.new_tags ?? defaultValues.new_tags,
  })
  const [imagePreview, setImagePreview] = useState<string | null>(
    initial?.featured_image_url ?? null,
  )
  const [file, setFile] = useState<File | null>(null)
  const [localTags, setLocalTags] = useState<TagOption[]>(tags)
  const [newTagName, setNewTagName] = useState('')
  const [addingTag, setAddingTag] = useState(false)
  const [isOptimizingImage, setIsOptimizingImage] = useState(false)
  const [tagSearch, setTagSearch] = useState('')
  const [optimizationStats, setOptimizationStats] = useState<{
    originalSizeMB: string
    optimizedSizeMB: string
  } | null>(null)

  useEffect(() => {
    setLocalTags(tags)
  }, [tags])

  const handleChange = (
    key: keyof PostFormValues,
    value: string | number | boolean | any[] | null | any,
  ) => {
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleEditorUpdate = (html: string) => {
    setValues((prev) => ({
      ...prev,
      body: html,
    }))
  }

  const handleSubmit = async (e: React.FormEvent | React.MouseEvent, saveAs?: PostStatus) => {
    e.preventDefault()
    e.stopPropagation()

    const slug =
      values.slug ||
      values.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')

    const finalValues: PostFormValues = {
      ...values,
      slug,
      status: saveAs ?? values.status,
      published_at: saveAs === 'published' ? new Date().toISOString() : values.published_at,
    }

    try {
      await onSubmit(finalValues, file)
    } catch (error) {
      console.error('Submit error:', error)
    }
  }

  const handleTranslate = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!onTranslate) return

    const slug =
      values.slug ||
      values.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')

    const finalValues: PostFormValues = {
      ...values,
      slug,
    }

    try {
      await onTranslate(finalValues, file)
    } catch (error) {
      console.error('Translate error:', error)
    }
  }

  const addTag = async () => {
    if (!onCreateTag) return
    const name = newTagName.trim()
    if (!name) return
    setAddingTag(true)
    try {
      const created = await onCreateTag(name)
      setLocalTags((prev) => [...prev, created])
      handleChange('tag_ids', [...values.tag_ids, created.id])
      setNewTagName('')
    } finally {
      setAddingTag(false)
    }
  }

  // Build hierarchical category display
  const buildCategoryTree = (
    categories: CategoryOption[],
    parentId: string | null = null,
    depth: number = 0,
  ): Array<CategoryOption & { depth: number }> => {
    const children = categories.filter((cat) => cat.parent_id === parentId)
    const result: Array<CategoryOption & { depth: number }> = []

    children.forEach((cat) => {
      result.push({ ...cat, depth })
      result.push(...buildCategoryTree(categories, cat.id, depth + 1))
    })

    return result
  }

  const categoriesTree = buildCategoryTree(categories)
  const selectedTags = localTags.filter((tag) => values.tag_ids.includes(tag.id))
  const tagSearchLower = tagSearch.trim().toLowerCase()
  const filteredTags = tagSearchLower
    ? localTags.filter((tag) => tag.name.toLowerCase().includes(tagSearchLower))
    : localTags

  return (
    <form className="space-y-6" onSubmit={(e) => handleSubmit(e)}>
      {/* Action Buttons */}
      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        {onTranslate && (
          <Button
            type="button"
            variant="outline"
            onClick={handleTranslate}
            disabled={submitting || translating}
          >
            {translating ? 'Translating…' : 'Translate'}
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={(e) => handleSubmit(e, 'draft')}
          disabled={submitting}
        >
          Save as Draft
        </Button>
        <Button
          type="button"
          onClick={(e) => handleSubmit(e, 'published')}
          disabled={submitting}
        >
          {submitting ? 'Publishing…' : 'Publish'}
        </Button>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          required
          value={values.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Enter post title"
        />
      </div>

      {/* Content Editor */}
      <div className="space-y-2">
        <Label>Content</Label>
        <TipTapEditor
          content={values.body}
          onUpdate={handleEditorUpdate}
          placeholder="Write your post content here..."
        />
      </div>

      {/* Excerpt */}
      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt</Label>
        <textarea
          id="excerpt"
          value={values.excerpt}
          onChange={(e) => handleChange('excerpt', e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          rows={3}
          placeholder="Brief summary of the post"
        />
      </div>

      {/* Featured Image */}
      <div className="space-y-2">
        <Label>Featured Image</Label>
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
          <div className="flex items-center gap-4">
            <label
              htmlFor="featured-image"
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100"
            >
              Choose file
            </label>
            <input
              id="featured-image"
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const selected = e.target.files?.[0] ?? null
                if (!selected) {
                  setFile(null)
                  setImagePreview(null)
                  setOptimizationStats(null)
                  return
                }

                setIsOptimizingImage(true)
                setOptimizationStats(null)

                try {
                  const originalSizeMB = (selected.size / 1024 / 1024).toFixed(2)

                  // Optimize image before upload
                  const optimizedFile = await validateAndOptimizeImage(selected, 'postFeaturedImage')

                  const optimizedSizeMB = (optimizedFile.size / 1024 / 1024).toFixed(2)

                  setFile(optimizedFile)
                  setImagePreview(URL.createObjectURL(optimizedFile))
                  setOptimizationStats({ originalSizeMB, optimizedSizeMB })

                  toast.success(`Image optimized: ${originalSizeMB}MB → ${optimizedSizeMB}MB`)
                } catch (error) {
                  console.error('Image optimization error:', error)
                  toast.error(error instanceof Error ? error.message : 'Failed to optimize image')
                  // Reset file input
                  e.target.value = ''
                } finally {
                  setIsOptimizingImage(false)
                }
              }}
              className="hidden"
              disabled={isOptimizingImage}
            />
            <div className="flex flex-col text-sm text-gray-600">
              <span className="font-medium">
                {isOptimizingImage
                  ? 'Optimizing image...'
                  : file?.name ?? imagePreview
                    ? 'Preview loaded'
                    : 'No file chosen'}
              </span>
              {optimizationStats ? (
                <span className="text-xs text-green-600">
                  Optimized: {optimizationStats.originalSizeMB}MB → {optimizationStats.optimizedSizeMB}MB
                </span>
              ) : (
                <span className="text-xs text-gray-500">JPG/PNG, up to 50MB</span>
              )}
            </div>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Featured image preview"
                className="h-20 w-32 rounded-md border border-gray-200 object-cover ml-auto"
              />
            )}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <Label>Categories</Label>
        <p className="text-xs text-gray-500">
          Select one or more categories for this post.
        </p>
        <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white p-3 space-y-1">
          {categoriesTree.map((category) => {
            const checked = values.category_ids.includes(category.id)
            return (
              <label
                key={category.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 text-sm"
                style={{ paddingLeft: `${category.depth * 1.5 + 0.5}rem` }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...values.category_ids, category.id]
                      : values.category_ids.filter((id) => id !== category.id)
                    handleChange('category_ids', next)
                  }}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-gray-900">{category.name}</span>
              </label>
            )
          })}
          {categoriesTree.length === 0 && (
            <p className="text-xs text-gray-500 px-2 py-1">No categories available.</p>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags</Label>
        <p className="text-xs text-gray-500">
          Search and select tags. Large lists are easier to manage here.
        </p>
        <div className="rounded-lg border border-gray-200 bg-white p-3 space-y-3">
          <div className="flex flex-wrap gap-2">
            {selectedTags.length > 0 ? (
              selectedTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() =>
                    handleChange(
                      'tag_ids',
                      values.tag_ids.filter((id) => id !== tag.id),
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-700 hover:border-gray-400"
                >
                  #{tag.name}
                  <span className="text-gray-400">×</span>
                </button>
              ))
            ) : (
              <p className="text-xs text-gray-500">No tags selected.</p>
            )}
          </div>

          <Input
            placeholder="Search tags..."
            value={tagSearch}
            onChange={(e) => setTagSearch(e.target.value)}
          />

          <div className="max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-white">
            {filteredTags.length > 0 ? (
              filteredTags.map((tag) => {
                const checked = values.tag_ids.includes(tag.id)
                return (
                  <label
                    key={tag.id}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...values.tag_ids, tag.id]
                          : values.tag_ids.filter((id) => id !== tag.id)
                        handleChange('tag_ids', next)
                      }}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-gray-900">{tag.name}</span>
                  </label>
                )
              })
            ) : (
              <p className="px-3 py-2 text-xs text-gray-500">No matching tags.</p>
            )}
          </div>
        </div>
        {onCreateTag && (
          <div className="flex items-center gap-2 pt-2">
            <Input
              placeholder="New tag name"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTag()
                }
              }}
            />
            <Button type="button" onClick={addTag} disabled={addingTag}>
              {addingTag ? 'Adding…' : 'Add Tag'}
            </Button>
          </div>
        )}
      </div>

      {/* Status & Publish Settings */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={values.status}
            onChange={(e) => handleChange('status', e.target.value as PostStatus)}
            className="w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
            <option value="pending">Pending Review</option>
            <option value="trash">Trash</option>
          </select>
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

      {/* Scheduled Date (shown when status is 'scheduled') */}
      {values.status === 'scheduled' && (
        <div className="space-y-2">
          <Label htmlFor="published_at">Publish Date & Time</Label>
          <Input
            id="published_at"
            type="datetime-local"
            value={
              values.published_at
                ? new Date(values.published_at).toISOString().slice(0, 16)
                : ''
            }
            onChange={(e) =>
              handleChange('published_at', e.target.value ? new Date(e.target.value).toISOString() : null)
            }
          />
        </div>
      )}

      {/* Featured Toggle */}
      <div className="flex items-center gap-4">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.featured}
            onChange={(e) => handleChange('featured', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <span className="text-gray-900">Featured Post</span>
        </label>
      </div>

    </form>
  )
}
