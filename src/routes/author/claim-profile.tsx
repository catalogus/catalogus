import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AuthorGuard } from '../../components/author/AuthorGuard'
import { useAuth } from '../../contexts/AuthProvider'
import { supabase } from '../../lib/supabaseClient'
import { toast } from 'sonner'
import type { AuthorRow } from '../../types/author'

export const Route = createFileRoute('/author/claim-profile')({
  component: ClaimProfilePage,
})

function ClaimProfilePage() {
  const { profile, session } = useAuth()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAuthor, setSelectedAuthor] = useState<AuthorRow | null>(null)

  // Query unclaimed authors
  const unclaimedAuthorsQuery = useQuery({
    queryKey: ['authors', 'unclaimed', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('authors')
        .select('id, name, bio, photo_url, photo_path, residence_city, province, wp_slug, claim_status')
        .in('claim_status', ['unclaimed', 'rejected'])
        .order('name', { ascending: true })
        .limit(20)

      if (searchTerm.trim()) {
        query = query.or(`name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%`)
      }

      const { data, error } = await query
      if (error) throw error
      return data as AuthorRow[]
    },
  })

  // Submit claim mutation
  const submitClaim = useMutation({
    mutationFn: async (authorId: string) => {
      const userId = session?.user?.id
      if (!userId) throw new Error('Not authenticated')

      // Update author table with claim request
      const { error } = await supabase
        .from('authors')
        .update({
          profile_id: userId,
          claim_status: 'pending',
          claimed_at: new Date().toISOString(),
        })
        .eq('id', authorId)
        .in('claim_status', ['unclaimed', 'rejected'])

      if (error) throw error

      // Insert into author_claims for audit trail
      await supabase.from('author_claims').insert({
        author_id: authorId,
        profile_id: userId,
        status: 'pending',
        claimed_at: new Date().toISOString(),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authors', 'unclaimed'] })
      queryClient.invalidateQueries({ queryKey: ['author', 'by-profile', session?.user?.id] })
      toast.success('Claim submitted! Awaiting admin approval.')
      setSelectedAuthor(null)
    },
    onError: (err: any) => {
      toast.error(err.message ?? 'Failed to submit claim')
    },
  })

  return (
    <AuthorGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Claim Your Author Profile</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Find and claim your existing author profile in our catalog
                </p>
              </div>
              <Link
                to="/author/profile"
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Back to Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Search */}
          <div className="mb-8">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search for your author profile
            </label>
            <input
              id="search"
              type="text"
              placeholder="Search by name or bio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {/* Results */}
          {unclaimedAuthorsQuery.isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading authors...</p>
            </div>
          ) : unclaimedAuthorsQuery.error ? (
            <div className="text-center py-12">
              <p className="text-red-600">Error loading authors. Please try again.</p>
            </div>
          ) : unclaimedAuthorsQuery.data?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchTerm ? 'No matching authors found.' : 'No unclaimed author profiles available.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {unclaimedAuthorsQuery.data?.map((author) => (
                <div
                  key={author.id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Author Photo */}
                  <div className="aspect-square bg-gray-100">
                    {author.photo_url ? (
                      <img
                        src={author.photo_url}
                        alt={author.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg
                          className="w-24 h-24"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Author Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{author.name}</h3>
                    {(author.residence_city || author.province) && (
                      <p className="text-sm text-gray-500 mb-2">
                        {[author.residence_city, author.province].filter(Boolean).join(', ')}
                      </p>
                    )}
                    {author.bio && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">{author.bio}</p>
                    )}

                    {author.claim_status === 'rejected' && (
                      <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                        Previously rejected - you can re-claim
                      </div>
                    )}

                    <button
                      onClick={() => setSelectedAuthor(author)}
                      className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                    >
                      Claim This Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        {selectedAuthor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Claim</h2>
              <p className="text-gray-600 mb-4">
                Are you sure you want to claim the author profile for{' '}
                <span className="font-semibold">{selectedAuthor.name}</span>?
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Your claim will be reviewed by an administrator before approval.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedAuthor(null)}
                  disabled={submitClaim.isPending}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => submitClaim.mutate(selectedAuthor.id)}
                  disabled={submitClaim.isPending}
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
                >
                  {submitClaim.isPending ? 'Submitting...' : 'Confirm Claim'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthorGuard>
  )
}
