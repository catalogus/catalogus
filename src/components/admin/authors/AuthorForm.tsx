import { useState } from 'react'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { Button } from '../../ui/button'
import type { AuthorFormValues, SocialLinks } from '../../../types/author'

type AuthorFormProps = {
  initial?: Partial<AuthorFormValues>
  onSubmit: (values: AuthorFormValues, file?: File | null) => Promise<void> | void
  onCancel: () => void
  submitting?: boolean
  mode: 'create' | 'edit'
}

const defaultValues: AuthorFormValues = {
  name: '',
  phone: '',
  bio: '',
  photo_url: '',
  photo_path: '',
  social_links: {},
  birth_date: '',
  residence_city: '',
  province: '',
  published_works: [],
  author_gallery: [],
  featured_video: '',
  author_type: '',
}

export function AuthorForm({
  initial,
  onSubmit,
  onCancel,
  submitting = false,
  mode,
}: AuthorFormProps) {
  const [values, setValues] = useState<AuthorFormValues>({
    ...defaultValues,
    ...initial,
    social_links: initial?.social_links ?? defaultValues.social_links,
    published_works: initial?.published_works ?? defaultValues.published_works,
    author_gallery: initial?.author_gallery ?? defaultValues.author_gallery,
  })
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    initial?.photo_url ?? null,
  )
  const [file, setFile] = useState<File | null>(null)

  const handleChange = (key: keyof AuthorFormValues, value: string) => {
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSocialLinkChange = (
    platform: keyof SocialLinks,
    value: string,
  ) => {
    setValues((prev) => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value || undefined,
      },
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null
    setFile(selected)
    if (selected) {
      setPhotoPreview(URL.createObjectURL(selected))
    }
  }

  const handleAddPublishedWork = () => {
    setValues((prev) => ({
      ...prev,
      published_works: [
        ...prev.published_works,
        { title: '', genre: '', synopsis: '', link: '' },
      ],
    }))
  }

  const handlePublishedWorkChange = (
    index: number,
    field: keyof import('../../../types/author').PublishedWork,
    value: string,
  ) => {
    setValues((prev) => ({
      ...prev,
      published_works: prev.published_works.map((work, i) =>
        i === index ? { ...work, [field]: value } : work,
      ),
    }))
  }

  const handleRemovePublishedWork = (index: number) => {
    setValues((prev) => ({
      ...prev,
      published_works: prev.published_works.filter((_, i) => i !== index),
    }))
  }

  const handleWorkCoverChange = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    // For now, create a preview URL. The actual upload will happen on form submit
    const previewUrl = URL.createObjectURL(file)
    setValues((prev) => ({
      ...prev,
      published_works: prev.published_works.map((work, i) =>
        i === index ? { ...work, cover_url: previewUrl } : work,
      ),
    }))
  }

  const handleAddGalleryImage = () => {
    setValues((prev) => ({
      ...prev,
      author_gallery: [...prev.author_gallery, { url: '', path: '', caption: '' }],
    }))
  }

  const handleGalleryImageChange = (
    index: number,
    field: 'url' | 'caption',
    value: string,
  ) => {
    setValues((prev) => ({
      ...prev,
      author_gallery: prev.author_gallery.map((img, i) =>
        i === index ? { ...img, [field]: value } : img,
      ),
    }))
  }

  const handleRemoveGalleryImage = (index: number) => {
    setValues((prev) => ({
      ...prev,
      author_gallery: prev.author_gallery.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(values, file)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            value={values.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            minLength={2}
            maxLength={100}
            placeholder="Author name"
          />
        </div>

        {/* Author Type */}
        <div className="space-y-2">
          <Label htmlFor="author_type">
            Tipo de Autor <span className="text-red-500">*</span>
          </Label>
          <select
            id="author_type"
            value={values.author_type}
            onChange={(e) => handleChange('author_type', e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          >
            <option value="">Selecionar tipo</option>
            <option value="Autor">Autor</option>
            <option value="Cineasta">Cineasta</option>
            <option value="Escritor">Escritor</option>
            <option value="Escritora">Escritora</option>
            <option value="Jornalista">Jornalista</option>
            <option value="Pesquisador">Pesquisador</option>
            <option value="Poeta">Poeta</option>
          </select>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={values.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+258 84 123 4567"
          />
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <textarea
            id="bio"
            value={values.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            maxLength={500}
            rows={4}
            placeholder="Author biography (max 500 characters)"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
          <p className="text-xs text-gray-500">
            {values.bio.length}/500 characters
          </p>
        </div>

        {/* Photo */}
        <div className="space-y-2">
          <Label htmlFor="photo">Profile Photo</Label>
          {photoPreview && (
            <div className="mb-2">
              <img
                src={photoPreview}
                alt="Preview"
                className="h-32 w-32 rounded-lg object-cover border border-gray-200"
              />
            </div>
          )}
          <Input
            id="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
          />
          <p className="text-xs text-gray-500">
            Max 5MB. Supported formats: JPG, PNG, WEBP, GIF
          </p>
        </div>

        {/* Birth Date */}
        <div className="space-y-2">
          <Label htmlFor="birth_date">Birth Date</Label>
          <Input
            id="birth_date"
            type="date"
            value={values.birth_date}
            onChange={(e) => handleChange('birth_date', e.target.value)}
          />
        </div>

        {/* Residence City */}
        <div className="space-y-2">
          <Label htmlFor="residence_city">Residence City</Label>
          <Input
            id="residence_city"
            type="text"
            value={values.residence_city}
            onChange={(e) => handleChange('residence_city', e.target.value)}
            placeholder="City name"
          />
        </div>

        {/* Province */}
        <div className="space-y-2">
          <Label htmlFor="province">Province</Label>
          <Input
            id="province"
            type="text"
            value={values.province}
            onChange={(e) => handleChange('province', e.target.value)}
            placeholder="Province name"
          />
        </div>

        {/* Featured Video */}
        <div className="space-y-2">
          <Label htmlFor="featured_video">Featured Video URL</Label>
          <Input
            id="featured_video"
            type="url"
            value={values.featured_video}
            onChange={(e) => handleChange('featured_video', e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
          />
          <p className="text-xs text-gray-500">
            YouTube or Vimeo video URL
          </p>
        </div>

        {/* Social Links */}
        <div className="space-y-3 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Social Links</h3>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={values.social_links.website ?? ''}
              onChange={(e) => handleSocialLinkChange('website', e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              type="url"
              value={values.social_links.linkedin ?? ''}
              onChange={(e) =>
                handleSocialLinkChange('linkedin', e.target.value)
              }
              placeholder="https://linkedin.com/in/username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="facebook">Facebook</Label>
            <Input
              id="facebook"
              type="url"
              value={values.social_links.facebook ?? ''}
              onChange={(e) =>
                handleSocialLinkChange('facebook', e.target.value)
              }
              placeholder="https://facebook.com/username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              type="url"
              value={values.social_links.instagram ?? ''}
              onChange={(e) =>
                handleSocialLinkChange('instagram', e.target.value)
              }
              placeholder="https://instagram.com/username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter</Label>
            <Input
              id="twitter"
              type="url"
              value={values.social_links.twitter ?? ''}
              onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
              placeholder="https://twitter.com/username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="youtube">YouTube</Label>
            <Input
              id="youtube"
              type="url"
              value={values.social_links.youtube ?? ''}
              onChange={(e) =>
                handleSocialLinkChange('youtube', e.target.value)
              }
              placeholder="https://youtube.com/@username"
            />
          </div>
        </div>

        {/* Published Works */}
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">
              Obras Publicadas (Published Works)
            </h3>
            <Button
              type="button"
              onClick={handleAddPublishedWork}
              className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1"
            >
              + Add Work
            </Button>
          </div>

          {values.published_works.length === 0 ? (
            <p className="text-sm text-gray-500">No published works added yet</p>
          ) : (
            <div className="space-y-4">
              {values.published_works.map((work, index) => (
                <div
                  key={index}
                  className="border border-gray-300 rounded-lg p-4 space-y-3 bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900">
                      Obra #{index + 1}
                    </h4>
                    <Button
                      type="button"
                      onClick={() => handleRemovePublishedWork(index)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-xs"
                    >
                      Remove
                    </Button>
                  </div>

                  {/* Cover Image */}
                  <div className="space-y-2">
                    <Label htmlFor={`work_cover_${index}`}>
                      Capa da Obra <span className="text-red-500">*</span>
                    </Label>
                    {work.cover_url && (
                      <div className="mb-2">
                        <img
                          src={work.cover_url}
                          alt="Cover preview"
                          className="h-32 w-24 object-cover rounded border border-gray-200"
                        />
                      </div>
                    )}
                    <Input
                      id={`work_cover_${index}`}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => handleWorkCoverChange(index, e)}
                    />
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor={`work_title_${index}`}>
                      Título da Obra <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`work_title_${index}`}
                      type="text"
                      value={work.title}
                      onChange={(e) =>
                        handlePublishedWorkChange(index, 'title', e.target.value)
                      }
                      placeholder="Título que conta na Capa da Obra"
                      required
                    />
                  </div>

                  {/* Genre */}
                  <div className="space-y-2">
                    <Label htmlFor={`work_genre_${index}`}>
                      Gênero literário <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id={`work_genre_${index}`}
                      value={work.genre}
                      onChange={(e) =>
                        handlePublishedWorkChange(index, 'genre', e.target.value)
                      }
                      required
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    >
                      <option value="">Selecionar o tipo de Obra</option>
                      <option value="Romance">Romance</option>
                      <option value="Conto">Conto</option>
                      <option value="Poesia">Poesia</option>
                      <option value="Drama">Drama</option>
                      <option value="Infantil">Infantil</option>
                      <option value="Ficção Científica">Ficção Científica</option>
                      <option value="Suspense">Suspense</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>

                  {/* Synopsis */}
                  <div className="space-y-2">
                    <Label htmlFor={`work_synopsis_${index}`}>
                      Sinopse da Obra <span className="text-red-500">*</span>
                    </Label>
                    <textarea
                      id={`work_synopsis_${index}`}
                      value={work.synopsis}
                      onChange={(e) =>
                        handlePublishedWorkChange(index, 'synopsis', e.target.value)
                      }
                      placeholder="Breve descrição/resumo"
                      required
                      rows={3}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    />
                  </div>

                  {/* Link */}
                  <div className="space-y-2">
                    <Label htmlFor={`work_link_${index}`}>Link da Obra</Label>
                    <Input
                      id={`work_link_${index}`}
                      type="url"
                      value={work.link ?? ''}
                      onChange={(e) =>
                        handlePublishedWorkChange(index, 'link', e.target.value)
                      }
                      placeholder="Endereço na web"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Author Gallery */}
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">
              Galeria do Autor (Author Gallery)
            </h3>
            <Button
              type="button"
              onClick={handleAddGalleryImage}
              className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1"
            >
              + Add Image
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Add image URLs for the author's gallery
          </p>

          {values.author_gallery.length === 0 ? (
            <p className="text-sm text-gray-500">No gallery images added yet</p>
          ) : (
            <div className="space-y-3">
              {values.author_gallery.map((image, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      value={image.url}
                      onChange={(e) =>
                        handleGalleryImageChange(index, 'url', e.target.value)
                      }
                      placeholder="Image URL"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(index)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3"
                    >
                      Remove
                    </Button>
                  </div>
                  <Input
                    type="text"
                    value={image.caption ?? ''}
                    onChange={(e) =>
                      handleGalleryImageChange(index, 'caption', e.target.value)
                    }
                    placeholder="Caption (optional)"
                  />
                  {image.url && (
                    <img
                      src={image.url}
                      alt={image.caption || 'Gallery preview'}
                      className="h-24 w-full object-cover rounded border border-gray-200"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 border-t pt-4">
        <Button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="bg-gray-200 text-gray-900 hover:bg-gray-300"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting
            ? mode === 'create'
              ? 'Creating...'
              : 'Saving...'
            : mode === 'create'
              ? 'Create Author'
              : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
