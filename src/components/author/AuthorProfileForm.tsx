import { useState } from 'react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { StatusBadge } from '../admin/ui/StatusBadge'
import type { ProfileUpdateValues, SocialLinks } from '../../types/author'

type Profile = {
  id: string
  name: string
  email?: string
  phone?: string | null
  bio?: string | null
  photo_url?: string | null
  photo_path?: string | null
  social_links?: SocialLinks | null
  status?: string | null
}

type AuthorProfileFormProps = {
  profile: Profile
  onSubmit: (values: ProfileUpdateValues, file?: File | null) => Promise<void> | void
  submitting?: boolean
}

const defaultValues: ProfileUpdateValues = {
  name: '',
  phone: '',
  bio: '',
  photo_url: '',
  photo_path: '',
  social_links: {},
}

export function AuthorProfileForm({
  profile,
  onSubmit,
  submitting = false,
}: AuthorProfileFormProps) {
  const [values, setValues] = useState<ProfileUpdateValues>({
    name: profile.name ?? defaultValues.name,
    phone: profile.phone ?? defaultValues.phone,
    bio: profile.bio ?? defaultValues.bio,
    photo_url: profile.photo_url ?? defaultValues.photo_url,
    photo_path: profile.photo_path ?? defaultValues.photo_path,
    social_links: profile.social_links ?? defaultValues.social_links,
  })
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    profile.photo_url ?? null,
  )
  const [file, setFile] = useState<File | null>(null)

  const handleChange = (key: keyof ProfileUpdateValues, value: string) => {
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
        {/* Status (Read-only) */}
        <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Account Status</p>
              <p className="text-xs text-gray-500 mt-1">
                {profile.status === 'pending' &&
                  'Your account is pending admin approval'}
                {profile.status === 'approved' &&
                  'Your account has been approved'}
                {profile.status === 'rejected' &&
                  'Your account has been rejected. Please contact admin.'}
              </p>
            </div>
            <StatusBadge
              label={profile.status ?? 'pending'}
              variant={
                profile.status === 'approved'
                  ? 'success'
                  : profile.status === 'rejected'
                    ? 'danger'
                    : 'warning'
              }
            />
          </div>
        </div>

        {/* Email (Read-only) */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={profile.email ?? ''}
            disabled
            className="bg-gray-100"
          />
          <p className="text-xs text-gray-500">
            Email cannot be changed. Contact admin if needed.
          </p>
        </div>

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
            placeholder="Your name"
          />
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
            placeholder="Tell us about yourself (max 500 characters)"
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
      </div>

      {/* Form Actions */}
      <div className="flex justify-end border-t pt-4">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
