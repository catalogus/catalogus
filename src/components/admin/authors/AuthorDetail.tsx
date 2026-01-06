import type { AuthorRow } from '../../../types/author'
import { Twitter, Linkedin, Globe, Instagram, Youtube, Facebook, MapPin, Calendar, Video } from 'lucide-react'

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
            {author.author_type && (
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {author.author_type}
              </p>
            )}
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
          {author.wp_slug && (
            <div>
              <p className="text-xs text-gray-500">WordPress Slug</p>
              <p className="text-sm text-gray-900">{author.wp_slug}</p>
            </div>
          )}
        </div>
      </div>

      {/* Personal Information */}
      {(author.birth_date || author.residence_city || author.province) && (
        <div className="border-t pt-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">
            Personal Information
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {author.birth_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Birth Date</p>
                  <p className="text-sm text-gray-900">
                    {formatDate(author.birth_date)}
                  </p>
                </div>
              </div>
            )}

            {author.residence_city && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">City</p>
                  <p className="text-sm text-gray-900">{author.residence_city}</p>
                </div>
              </div>
            )}

            {author.province && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Province</p>
                  <p className="text-sm text-gray-900">{author.province}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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

            {author.social_links?.facebook && (
              <a
                href={author.social_links.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                <Facebook className="h-4 w-4" />
                <span>{author.social_links.facebook}</span>
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

            {author.social_links?.youtube && (
              <a
                href={author.social_links.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                <Youtube className="h-4 w-4" />
                <span>{author.social_links.youtube}</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Featured Video */}
      {author.featured_video && (
        <div className="border-t pt-4 space-y-2">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Video className="h-4 w-4" />
            Featured Video
          </h3>
          <a
            href={author.featured_video}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline break-all"
          >
            {author.featured_video}
          </a>
        </div>
      )}

      {/* Published Works */}
      {author.published_works && author.published_works.length > 0 && (
        <div className="border-t pt-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">
            Obras Publicadas (Published Works)
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {author.published_works.map((work, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-3 flex gap-3"
              >
                {work.cover_url && (
                  <img
                    src={work.cover_url}
                    alt={work.title}
                    className="h-32 w-24 object-cover rounded border border-gray-200 shrink-0"
                  />
                )}
                <div className="flex-1 space-y-2">
                  <h4 className="font-semibold text-gray-900">{work.title}</h4>
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Gênero:</span> {work.genre}
                  </p>
                  <p className="text-sm text-gray-700">{work.synopsis}</p>
                  {work.link && (
                    <a
                      href={work.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 hover:underline inline-block"
                    >
                      Ver obra
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Author Gallery */}
      {author.author_gallery && author.author_gallery.length > 0 && (
        <div className="border-t pt-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">
            Galeria do Autor (Author Gallery)
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {author.author_gallery.map((image, index) => (
              <div key={index} className="space-y-1">
                <img
                  src={image.url}
                  alt={image.caption || `Gallery image ${index + 1}`}
                  className="w-full h-32 object-cover rounded border border-gray-200"
                />
                {image.caption && (
                  <p className="text-xs text-gray-600">{image.caption}</p>
                )}
              </div>
            ))}
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
