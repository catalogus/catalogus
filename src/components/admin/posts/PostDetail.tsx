import { Calendar, User, Eye, Tag as TagIcon, FolderOpen } from 'lucide-react'
import type { PostRow } from '../../../types/post'

type PostDetailProps = {
  post: PostRow
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  published: 'bg-green-100 text-green-800',
  scheduled: 'bg-blue-100 text-blue-800',
  pending: 'bg-yellow-100 text-yellow-800',
  trash: 'bg-red-100 text-red-800',
}

const translationStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  review: 'bg-blue-100 text-blue-800',
  failed: 'bg-red-100 text-red-800',
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return 'Not set'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function PostDetail({ post }: PostDetailProps) {
  return (
    <div className="space-y-6">
      {/* Featured Image */}
      {post.featured_image_url && (
        <div className="w-full">
          <img
            src={post.featured_image_url}
            alt={post.title}
            className="w-full h-auto max-h-96 object-cover rounded-lg border border-gray-200"
          />
        </div>
      )}

      {/* Title & Status */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900">{post.title}</h2>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
              statusColors[post.status] ?? 'bg-gray-100 text-gray-800'
            }`}
          >
            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
          </span>
        </div>
        {post.featured && (
          <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-xs font-medium">
            ⭐ Featured
          </span>
        )}
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">Author</p>
            <p className="font-medium text-gray-900">
              {post.author?.name ?? 'Unknown'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">Published</p>
            <p className="font-medium text-gray-900">
              {formatDate(post.published_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Eye className="h-4 w-4 text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">Views</p>
            <p className="font-medium text-gray-900">
              {(post.view_count ?? 0).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">Last Updated</p>
            <p className="font-medium text-gray-900">
              {formatDate(post.updated_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Excerpt */}
      {post.excerpt && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-700">Excerpt</h3>
          <p className="text-sm italic text-gray-600 bg-gray-50 p-3 rounded-lg">
            {post.excerpt}
          </p>
        </div>
      )}

      {/* Categories */}
      {post.categories && post.categories.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-700">Categories</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {post.categories.map((category) => (
              <span
                key={category.id}
                className="inline-flex items-center rounded-md bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 border border-blue-200"
              >
                {category.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TagIcon className="h-4 w-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-700">Tags</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 border border-gray-200"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700">Content</h3>
        <div
          className="prose prose-sm max-w-none border-t border-gray-200 pt-4"
          dangerouslySetInnerHTML={{ __html: post.body ?? '<p>No content</p>' }}
        />
      </div>

      {/* Metadata Footer */}
      <div className="border-t border-gray-200 pt-4 text-xs text-gray-500 space-y-1">
        <p>
          <strong>Slug:</strong> {post.slug}
        </p>
        <p>
          <strong>Language:</strong>{' '}
          {post.language === 'pt' ? 'Português' : 'English'}
        </p>
        {post.translation_status && (
          <p>
            <strong>Translation:</strong>{' '}
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                translationStatusColors[post.translation_status] ??
                'bg-gray-100 text-gray-800'
              }`}
            >
              {post.translation_status}
            </span>
          </p>
        )}
        {post.source_post_id && (
          <p>
            <strong>Source Post:</strong> {post.source_post_id}
          </p>
        )}
        <p>
          <strong>Post Type:</strong> {post.post_type}
        </p>
        <p>
          <strong>Created:</strong> {formatDate(post.created_at)}
        </p>
      </div>
    </div>
  )
}
