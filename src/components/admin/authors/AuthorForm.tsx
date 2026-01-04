import { useState } from 'react'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { Button } from '../../ui/button'
import { Select } from '../../ui/select'
import type { AuthorFormValues, AuthorStatus, SocialLinks } from '../../../types/author'

type AuthorFormProps = {
  initial?: Partial<AuthorFormValues>
  onSubmit: (values: AuthorFormValues, file?: File | null) => Promise<void> | void
  onCancel: () => void
  submitting?: boolean
  mode: 'create' | 'edit'
}

const defaultValues: AuthorFormValues = {
  name: '',
  email: '',
  password: '',
  phone: '',
  bio: '',
  photo_url: '',
  photo_path: '',
  social_links: {},
  status: 'pending',
  role: 'author',
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
  })
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    initial?.photo_url ?? null,
  )
  const [file, setFile] = useState<File | null>(null)

  const handleChange = (
    key: keyof AuthorFormValues,
    value: string | AuthorStatus,
  ) => {
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

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={values.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
            disabled={mode === 'edit'}
            placeholder="author@example.com"
            className={mode === 'edit' ? 'bg-gray-100' : ''}
          />
          {mode === 'edit' && (
            <p className="text-xs text-gray-500">Email cannot be changed</p>
          )}
        </div>

        {/* Password (create mode only) */}
        {mode === 'create' && (
          <div className="space-y-2">
            <Label htmlFor="password">
              Password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              value={values.password}
              onChange={(e) => handleChange('password', e.target.value)}
              required
              minLength={8}
              placeholder="Minimum 8 characters"
            />
          </div>
        )}

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

        {/* Social Links */}
        <div className="space-y-3 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Social Links</h3>

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
        </div>

        {/* Status */}
        <div className="space-y-2 border-t pt-4">
          <Label htmlFor="status">
            Status <span className="text-red-500">*</span>
          </Label>
          <select
            id="status"
            value={values.status}
            onChange={(e) => handleChange('status', e.target.value as AuthorStatus)}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
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
