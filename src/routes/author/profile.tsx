import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { AuthorGuard } from '../../components/author/AuthorGuard'
import { AuthorProfileForm } from '../../components/author/AuthorProfileForm'
import { useAuth } from '../../contexts/AuthProvider'
import { supabase } from '../../lib/supabaseClient'
import { toast } from 'sonner'
import type { ProfileUpdateValues, AuthorRow } from '../../types/author'

export const Route = createFileRoute('/author/profile')({
  component: AuthorProfilePage,
})

function AuthorProfilePage() {
  const { profile, session, signOut } = useAuth()
  const queryClient = useQueryClient()

  // Query for linked author record
  const linkedAuthorQuery = useQuery({
    queryKey: ['author', 'by-profile', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null
      const { data, error } = await supabase
        .from('authors')
        .select('id, name, bio, photo_url, claim_status, wp_slug')
        .eq('profile_id', profile.id)
        .maybeSingle()

      if (error) throw error
      return data as AuthorRow | null
    },
    enabled: !!profile?.id,
  })

  // Complete pending claim from localStorage (for users who signed up through claim flow)
  useEffect(() => {
    const completePendingClaim = async () => {
      if (!session?.user?.id) return

      const pendingClaim = localStorage.getItem('pendingAuthorClaim')
      if (!pendingClaim) return

      try {
        const claimData = JSON.parse(pendingClaim)

        // Create audit record with verification info
        await supabase.from('author_claims').insert({
          author_id: claimData.authorId,
          profile_id: session.user.id,
          status: 'pending',
          notes: `Email: ${claimData.email}\nPhone: ${claimData.phone}\nMessage: ${claimData.message}`,
        })

        // Update author record
        await supabase
          .from('authors')
          .update({
            profile_id: session.user.id,
            claim_status: 'pending',
            claimed_at: new Date().toISOString(),
          })
          .eq('id', claimData.authorId)

        // Clear localStorage
        localStorage.removeItem('pendingAuthorClaim')

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['author', 'by-profile', profile?.id] })

        toast.success('Reivindicação submetida com sucesso! Um administrador irá revisar.')
      } catch (error: any) {
        console.error('Failed to complete pending claim:', error)
        toast.error('Falha ao completar reivindicação. Tente novamente.')
        localStorage.removeItem('pendingAuthorClaim')
      }
    }

    completePendingClaim()
  }, [session?.user?.id, queryClient, profile?.id])

  const uploadPhoto = async (file: File, userId: string) => {
    // Path should NOT include bucket name - bucket is specified in .from()
    const path = `${userId}/${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('author-photos')
      .upload(path, file, { upsert: true })
    if (uploadError) throw uploadError
    const { data } = supabase.storage.from('author-photos').getPublicUrl(path)
    return { path, publicUrl: data.publicUrl }
  }

  const updateProfile = useMutation({
    mutationFn: async (payload: { values: ProfileUpdateValues; file?: File | null }) => {
      const { values, file } = payload

      if (!session?.user?.id) {
        throw new Error('Not authenticated')
      }

      // Upload new photo if provided
      let photo_path = values.photo_path
      let photo_url = values.photo_url
      if (file) {
        // Delete old photo if exists
        if (values.photo_path) {
          await supabase.storage.from('author-photos').remove([values.photo_path])
        }
        const uploaded = await uploadPhoto(file, session.user.id)
        photo_url = uploaded.publicUrl
        photo_path = uploaded.path
      }

      // Update own profile
      const { error } = await supabase
        .from('profiles')
        .update({
          name: values.name,
          phone: values.phone,
          bio: values.bio,
          photo_url,
          photo_path,
          social_links: values.social_links,
        })
        .eq('id', session.user.id)

      if (error) throw error

      // Sync to linked author record if approved
      const { data: linkedAuthor } = await supabase
        .from('authors')
        .select('id')
        .eq('profile_id', session.user.id)
        .eq('claim_status', 'approved')
        .maybeSingle()

      if (linkedAuthor) {
        const { error: authorError } = await supabase
          .from('authors')
          .update({
            name: values.name,
            phone: values.phone,
            bio: values.bio,
            photo_url,
            photo_path,
            social_links: values.social_links,
          })
          .eq('id', linkedAuthor.id)

        if (authorError) {
          console.error('Failed to sync to author record:', authorError)
          // Don't throw - profile update succeeded
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', session?.user?.id] })
      queryClient.invalidateQueries({ queryKey: ['author', 'by-profile', profile?.id] })
      toast.success('Profile updated successfully')
    },
    onError: (err: any) => {
      console.error('Update profile error:', err)
      toast.error(err.message ?? 'Failed to update profile')
    },
  })

  const handleSubmit = async (values: ProfileUpdateValues, file?: File | null) => {
    await updateProfile.mutateAsync({ values, file })
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    )
  }

  return (
    <AuthorGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your author profile information
              </p>
            </div>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Claim Status Banners */}
          {linkedAuthorQuery.data?.claim_status === 'pending' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-amber-600 mt-0.5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Your author claim is pending admin review
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    You'll be notified once your claim for "{linkedAuthorQuery.data.name}" is approved.
                  </p>
                </div>
              </div>
            </div>
          )}

          {linkedAuthorQuery.data?.claim_status === 'approved' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-emerald-600 mt-0.5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-emerald-800">
                    Your profile is linked to: {linkedAuthorQuery.data.name}
                  </p>
                  <Link
                    to={`/autor/${linkedAuthorQuery.data.wp_slug || linkedAuthorQuery.data.id}`}
                    className="text-sm text-emerald-700 underline hover:text-emerald-800 mt-1 inline-block"
                  >
                    View your public author page →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {linkedAuthorQuery.data?.claim_status === 'rejected' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-red-600 mt-0.5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">
                    Your claim was rejected by an administrator
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    Please contact support if you believe this was a mistake, or try claiming a different profile.
                  </p>
                  <Link
                    to="/author/claim-profile"
                    className="inline-block mt-2 px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                  >
                    Claim Another Profile
                  </Link>
                </div>
              </div>
            </div>
          )}

          {!linkedAuthorQuery.data && profile.status === 'pending' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start flex-1">
                  <svg
                    className="w-5 h-5 text-blue-600 mt-0.5 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Do you have an existing author profile in our catalog?
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Claim your author profile to manage your public information and link it to your account.
                    </p>
                  </div>
                </div>
                <Link
                  to="/author/claim-profile"
                  className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  Claim Profile
                </Link>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <AuthorProfileForm
              profile={{
                id: profile.id,
                name: profile.name ?? '',
                email: session?.user?.email,
                phone: profile.phone,
                bio: profile.bio,
                photo_url: profile.photo_url,
                photo_path: profile.photo_path,
                social_links: profile.social_links,
                status: profile.status,
              }}
              onSubmit={handleSubmit}
              submitting={updateProfile.isPending}
            />
          </div>
        </div>
      </div>
    </AuthorGuard>
  )
}
