import { StatusBadge } from '../ui/StatusBadge'
import type { AuthorRow } from '../../../types/author'
import { Twitter, Linkedin, Globe, Instagram } from 'lucide-react'

type AuthorDetailProps = {
  author: AuthorRow
}

export function AuthorDetail({ author }: AuthorDetailProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const hasSocialLinks =
    author.social_links &&
    Object.values(author.social_links).some((link) => link)

  return (
    <div className="space-y-6">
      {/* Photo and Basic Info */}
      <div className="flex items-start gap-6">
        {author.photo_url ? (
          <img
            src={author.photo_url}
            alt={author.name}
            className="h-32 w-32 rounded-lg object-cover border border-gray-200"
          />
        ) : (
          <div className="h-32 w-32 rounded-lg bg-gray-200 flex items-center justify-center border border-gray-300">
            <span className="text-4xl text-gray-400">
              {author.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        <div className="flex-1 space-y-3">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {author.name}
            </h2>
            {author.email && (
              <p className="text-sm text-gray-600">{author.email}</p>
            )}
          </div>

          <div>
            <StatusBadge
              label={author.status ?? 'pending'}
              variant={
                author.status === 'approved'
                  ? 'success'
                  : author.status === 'rejected'
                    ? 'danger'
                    : 'warning'
              }
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="border-t pt-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">
          Contact Information
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Phone</p>
            <p className="text-sm text-gray-900">
              {author.phone || 'Not provided'}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Email</p>
            <p className="text-sm text-gray-900">
              {author.email || 'Not provided'}
            </p>
          </div>
        </div>
      </div>

      {/* Bio */}
      {author.bio && (
        <div className="border-t pt-4 space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">Biography</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {author.bio}
          </p>
        </div>
      )}

      {/* Social Links */}
      {hasSocialLinks && (
        <div className="border-t pt-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Social Links</h3>

          <div className="space-y-2">
            {author.social_links?.twitter && (
              <a
                href={author.social_links.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                <Twitter className="h-4 w-4" />
                <span>{author.social_links.twitter}</span>
              </a>
            )}

            {author.social_links?.linkedin && (
              <a
                href={author.social_links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                <Linkedin className="h-4 w-4" />
                <span>{author.social_links.linkedin}</span>
              </a>
            )}

            {author.social_links?.website && (
              <a
                href={author.social_links.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                <Globe className="h-4 w-4" />
                <span>{author.social_links.website}</span>
              </a>
            )}

            {author.social_links?.instagram && (
              <a
                href={author.social_links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                <Instagram className="h-4 w-4" />
                <span>{author.social_links.instagram}</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="border-t pt-4">
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
          <div>
            <p>Created</p>
            <p className="text-gray-900">{formatDate(author.created_at)}</p>
          </div>
          <div>
            <p>Last Updated</p>
            <p className="text-gray-900">{formatDate(author.updated_at)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
