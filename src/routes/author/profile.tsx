import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AuthorGuard } from '../../components/author/AuthorGuard'
import { AuthorProfileForm } from '../../components/author/AuthorProfileForm'
import { useAuth } from '../../contexts/AuthProvider'
import { supabase } from '../../lib/supabaseClient'
import { toast } from 'sonner'
import type { ProfileUpdateValues } from '../../types/author'

export const Route = createFileRoute('/author/profile')({
  component: AuthorProfilePage,
})

function AuthorProfilePage() {
  const { profile, session, signOut } = useAuth()
  const queryClient = useQueryClient()

  const uploadPhoto = async (file: File, userId: string) => {
    const path = `author-photos/${userId}/${Date.now()}-${file.name}`
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', session?.user?.id] })
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
