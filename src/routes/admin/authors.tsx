import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DashboardLayout } from '../../components/admin/layout'
import { AdminGuard } from '../../components/admin/AdminGuard'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../contexts/AuthProvider'
import { Button } from '../../components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '../../components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import { AuthorForm } from '../../components/admin/authors/AuthorForm'
import { AuthorDetail } from '../../components/admin/authors/AuthorDetail'
import { toast } from 'sonner'
import type { AuthorRow, AuthorFormValues } from '../../types/author'

export const Route = createFileRoute('/admin/authors')({
  component: AdminAuthorsPage,
})

function AdminAuthorsPage() {
  const { profile, session, signOut } = useAuth()
  const userName = profile?.name ?? session?.user.email ?? 'Admin'
  const userEmail = session?.user.email ?? ''
  const queryClient = useQueryClient()

  const [showForm, setShowForm] = useState(false)
  const [editingAuthor, setEditingAuthor] = useState<AuthorRow | null>(null)
  const [detailAuthor, setDetailAuthor] = useState<AuthorRow | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [linkingAuthor, setLinkingAuthor] = useState<AuthorRow | null>(null)
  const [profileSearch, setProfileSearch] = useState('')

  const authorsQuery = useQuery({
    queryKey: ['admin', 'authors'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('authors')
          .select(`
            id,
            name,
            wp_slug,
            photo_url,
            phone,
            author_type,
            claim_status,
            profile_id,
            featured,
            profile:profiles!authors_profile_id_fkey(
              id,
              name,
              email
            )
          `)
          .order('name', { ascending: true })
        if (error) {
          console.error('Authors query error:', error)
          throw error
        }
        console.log('Fetched authors:', data?.length ?? 0, 'authors')
        return (data as AuthorRow[]) ?? []
      } catch (err) {
        console.error('Failed to fetch authors:', err)
        throw err
      }
    },
    staleTime: 0,
    retry: 1,
  })

  const resizePhoto = async (file: File) => {
    if (!file.type.startsWith('image/')) return file

    const maxDimension = 1400
    const quality = 0.85
    const shouldResize = file.size > 1_200_000

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const url = URL.createObjectURL(file)
      const image = new Image()
      image.onload = () => {
        URL.revokeObjectURL(url)
        resolve(image)
      }
      image.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Failed to load image'))
      }
      image.src = url
    })

    const scale = Math.min(1, maxDimension / Math.max(img.width, img.height))
    if (!shouldResize && scale === 1) return file

    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.width * scale)
    canvas.height = Math.round(img.height * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => (result ? resolve(result) : reject(new Error('Resize failed'))),
        'image/jpeg',
        quality,
      )
    })

    const fileName = file.name.replace(/\.[^/.]+$/, '.jpg')
    return new File([blob], fileName, { type: blob.type })
  }

  const uploadPhoto = async (file: File, userId: string) => {
    const preparedFile = await resizePhoto(file)
    const maxSize = 5 * 1024 * 1024
    if (preparedFile.size > maxSize) {
      throw new Error('Profile photo must be 5MB or less.')
    }

    const path = `author-photos/${userId}/${Date.now()}-${preparedFile.name}`
    const { error: uploadError } = await supabase.storage
      .from('author-photos')
      .upload(path, preparedFile, { upsert: true, contentType: preparedFile.type })
    if (uploadError) throw uploadError
    const { data } = supabase.storage.from('author-photos').getPublicUrl(path)
    return { path, publicUrl: data.publicUrl }
  }

  const createAuthor = useMutation({
    mutationFn: async (payload: { values: AuthorFormValues; file?: File | null }) => {
      const { values, file } = payload
      const payloadRow = {
        name: values.name,
        phone: values.phone || null,
        bio: values.bio || null,
        photo_url: values.photo_url || null,
        photo_path: values.photo_path || null,
        social_links: values.social_links ?? {},
        birth_date: values.birth_date || null,
        residence_city: values.residence_city || null,
        province: values.province || null,
        published_works: values.published_works ?? [],
        author_gallery: values.author_gallery ?? [],
        featured_video: values.featured_video || null,
        author_type: values.author_type || null,
      }

      const { data: created, error: insertError } = await supabase
        .from('authors')
        .insert(payloadRow)
        .select()
        .single()

      if (insertError) throw insertError

      if (file && created?.id) {
        const uploaded = await uploadPhoto(file, created.id)
        const { error: updateError } = await supabase
          .from('authors')
          .update({ photo_url: uploaded.publicUrl, photo_path: uploaded.path })
          .eq('id', created.id)
        if (updateError) throw updateError
      }
    },
    onSuccess: async () => {
      console.log('Author created, invalidating queries...')
      await queryClient.invalidateQueries({ queryKey: ['admin', 'authors'] })
      console.log('Refetching authors...')
      await queryClient.refetchQueries({ queryKey: ['admin', 'authors'] })
      console.log('Queries refreshed, closing form')
      setShowForm(false)
      toast.success('Author created successfully')
    },
    onError: (err: any) => {
      console.error('Create author error:', err)
      const message = err.message ?? 'Failed to create author'
      toast.error(message)
    },
  })

  const updateAuthor = useMutation({
    mutationFn: async (payload: { values: AuthorFormValues; file?: File | null; id: string }) => {
      const { values, file, id } = payload

      // Upload new photo if provided
      let photo_path = values.photo_path || null
      let photo_url = values.photo_url || null
      if (file) {
        // Delete old photo if exists
        if (values.photo_path) {
          await supabase.storage.from('author-photos').remove([values.photo_path])
        }
        const uploaded = await uploadPhoto(file, id)
        photo_url = uploaded.publicUrl
        photo_path = uploaded.path
      }

      // Update author
      const { error } = await supabase
        .from('authors')
        .update({
          name: values.name,
          phone: values.phone || null,
          bio: values.bio || null,
          photo_url,
          photo_path,
          social_links: values.social_links ?? {},
          birth_date: values.birth_date || null,
          residence_city: values.residence_city || null,
          province: values.province || null,
          published_works: values.published_works,
          author_gallery: values.author_gallery,
          featured_video: values.featured_video || null,
          author_type: values.author_type || null,
        })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'authors'] })
      await queryClient.refetchQueries({ queryKey: ['admin', 'authors'] })
      setShowForm(false)
      setEditingAuthor(null)
      toast.success('Author updated successfully')
    },
    onError: (err: any) => {
      console.error('Update author error:', err)
      toast.error(err.message ?? 'Failed to update author')
    },
  })

  const deleteAuthor = useMutation({
    mutationFn: async (id: string) => {
      // Get author to find photo path
      const { data: author } = await supabase
        .from('authors')
        .select('photo_path')
        .eq('id', id)
        .single()

      // Delete photo if exists
      if (author?.photo_path) {
        await supabase.storage.from('author-photos').remove([author.photo_path])
      }

      // Delete author row
      const { error } = await supabase.from('authors').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'authors'] })
      await queryClient.refetchQueries({ queryKey: ['admin', 'authors'] })
      setDeleteConfirm(null)
      toast.success('Author deleted successfully')
    },
    onError: (err: any) => {
      console.error('Delete author error:', err)
      toast.error(err.message ?? 'Failed to delete author')
    },
  })

  const toggleFeatured = useMutation({
    mutationFn: async (payload: { id: string; featured: boolean }) => {
      const { error } = await supabase
        .from('authors')
        .update({ featured: payload.featured })
        .eq('id', payload.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'authors'] })
      toast.success('Featured status updated')
    },
    onError: (err: any) =>
      toast.error(err.message ?? 'Failed to update featured status'),
  })

  // Profile search query for linking
  const profilesQuery = useQuery({
    queryKey: ['admin', 'profiles-search', profileSearch],
    queryFn: async () => {
      if (!profileSearch.trim()) return []
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, role, status')
        .eq('role', 'author')
        .or(`name.ilike.%${profileSearch}%,email.ilike.%${profileSearch}%`)
        .limit(10)

      if (error) throw error
      return data
    },
    enabled: !!linkingAuthor && profileSearch.length > 0,
  })

  const linkProfile = useMutation({
    mutationFn: async (payload: { authorId: string; profileId: string }) => {
      const adminId = session?.user?.id

      const { error } = await supabase
        .from('authors')
        .update({
          profile_id: payload.profileId,
          claim_status: 'approved',
          claimed_at: new Date().toISOString(),
          claim_reviewed_at: new Date().toISOString(),
          claim_reviewed_by: adminId,
        })
        .eq('id', payload.authorId)

      if (error) throw error

      // Ensure profile is approved
      await supabase
        .from('profiles')
        .update({ status: 'approved' })
        .eq('id', payload.profileId)
        .eq('status', 'pending')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'authors'] })
      setLinkingAuthor(null)
      setProfileSearch('')
      toast.success('Profile linked successfully')
    },
    onError: (err: any) => {
      toast.error(err.message ?? 'Failed to link profile')
    },
  })

  const unlinkProfile = useMutation({
    mutationFn: async (authorId: string) => {
      const { error } = await supabase
        .from('authors')
        .update({
          profile_id: null,
          claim_status: 'unclaimed',
          claim_reviewed_at: null,
          claim_reviewed_by: null,
        })
        .eq('id', authorId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'authors'] })
      toast.success('Profile unlinked')
    },
    onError: (err: any) => {
      toast.error(err.message ?? 'Failed to unlink profile')
    },
  })

  const handleFormSubmit = async (values: AuthorFormValues, file?: File | null) => {
    if (editingAuthor) {
      await updateAuthor.mutateAsync({ values, file, id: editingAuthor.id })
    } else {
      await createAuthor.mutateAsync({ values, file })
    }
  }

  const handleEdit = (author: AuthorRow) => {
    setEditingAuthor(author)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    setDeleteConfirm(id)
  }

  return (
    <AdminGuard>
      <DashboardLayout
        userRole={profile?.role ?? 'admin'}
        userName={userName}
        userEmail={userEmail}
        onSignOut={signOut}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase text-gray-500">Community</p>
              <h1 className="text-2xl font-semibold text-gray-900">
                Authors {authorsQuery.data ? `(${authorsQuery.data.length})` : ''}
              </h1>
            </div>
            <Button
              onClick={() => {
                setEditingAuthor(null)
                setShowForm(true)
              }}
            >
              Add author
            </Button>
          </div>
          <div className="rounded-2xl border border-gray-200 p-4 bg-white">
            {authorsQuery.isLoading ? (
              <p className="text-sm text-gray-500">Loading authors…</p>
            ) : authorsQuery.isError ? (
              <p className="text-sm text-rose-600">
                Failed to load authors. Check connection or permissions.
              </p>
            ) : authorsQuery.data?.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No authors found. Click "Add author" to create one.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-2 pr-3">Author</th>
                      <th className="py-2 pr-3">Phone</th>
                      <th className="py-2 pr-3">Tipo de Autor</th>
                      <th className="py-2 pr-3">Linked Profile</th>
                      <th className="py-2 pr-3">WordPress</th>
                      <th className="py-2 pr-3">Featured</th>
                      <th className="py-2 pr-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {authorsQuery.data?.map((author) => (
                      <tr
                        key={author.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => setDetailAuthor(author)}
                      >
                        <td className="py-3 pr-3">
                          <div className="flex items-center gap-3">
                            {author.photo_url ? (
                              <img
                                src={author.photo_url}
                                alt={author.name}
                                className="h-10 w-10 rounded-full object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-sm text-gray-600">
                                  {author.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{author.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-3 text-gray-600">
                          {author.phone ?? '—'}
                        </td>
                        <td className="py-3 pr-3 text-gray-600">
                          {author.author_type ?? '—'}
                        </td>
                        <td className="py-3 pr-3">
                          {author.profile ? (
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">
                                {author.profile.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {author.profile.email}
                              </div>
                              <span
                                className={`inline-block mt-1 px-2 py-0.5 text-xs rounded ${
                                  author.claim_status === 'approved'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : author.claim_status === 'pending'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {author.claim_status}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Not linked</span>
                          )}
                        </td>
                        <td className="py-3 pr-3">
                          <div className="text-sm text-gray-600">
                            {author.wp_slug ?? '—'}
                          </div>
                        </td>
                        <td className="py-3 pr-3 text-gray-600">
                          {author.featured ? 'Yes' : 'No'}
                        </td>
                        <td className="py-3 pr-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setDetailAuthor(author)
                                }}
                              >
                                View details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEdit(author)
                                }}
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleFeatured.mutate({
                                    id: author.id,
                                    featured: !(author.featured ?? false),
                                  })
                                }}
                              >
                                {author.featured ? 'Unfeature' : 'Mark featured'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setLinkingAuthor(author)
                                }}
                                disabled={!!author.profile_id}
                              >
                                {author.profile_id ? 'Change Linked Profile' : 'Link to Profile'}
                              </DropdownMenuItem>
                              {author.profile_id && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    unlinkProfile.mutate(author.id)
                                  }}
                                  className="text-orange-600"
                                >
                                  Unlink Profile
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDelete(author.id)
                                }}
                                className="text-red-600"
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Author Form Sheet */}
        <Sheet open={showForm} onOpenChange={setShowForm}>
          <SheetContent className="overflow-y-auto sm:max-w-lg px-4">
            <SheetHeader>
              <SheetTitle>
                {editingAuthor ? 'Edit Author' : 'Add New Author'}
              </SheetTitle>
              <SheetDescription>
                {editingAuthor
                  ? 'Update author profile information'
                  : 'Create a new author profile'}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <AuthorForm
                initial={
                  editingAuthor
                    ? {
                        name: editingAuthor.name,
                        phone: editingAuthor.phone ?? '',
                        bio: editingAuthor.bio ?? '',
                        photo_url: editingAuthor.photo_url ?? '',
                        photo_path: editingAuthor.photo_path ?? '',
                        social_links: editingAuthor.social_links ?? {},
                        birth_date: editingAuthor.birth_date ?? '',
                        residence_city: editingAuthor.residence_city ?? '',
                        province: editingAuthor.province ?? '',
                        published_works: editingAuthor.published_works ?? [],
                        author_gallery: editingAuthor.author_gallery ?? [],
                        featured_video: editingAuthor.featured_video ?? '',
                        author_type: editingAuthor.author_type ?? '',
                      }
                    : undefined
                }
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setShowForm(false)
                  setEditingAuthor(null)
                }}
                submitting={createAuthor.isPending || updateAuthor.isPending}
                mode={editingAuthor ? 'edit' : 'create'}
              />
            </div>
          </SheetContent>
        </Sheet>

        {/* Author Detail Dialog */}
        <Dialog open={!!detailAuthor} onOpenChange={() => setDetailAuthor(null)}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Author Details</DialogTitle>
              <DialogDescription>View author profile information</DialogDescription>
            </DialogHeader>
            {detailAuthor && <AuthorDetail author={detailAuthor} />}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Author</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this author? This action cannot be undone
                and will remove their profile and all associated data.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 mt-4">
              <Button
                variant="ghost"
                onClick={() => setDeleteConfirm(null)}
                disabled={deleteAuthor.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={() => deleteConfirm && deleteAuthor.mutate(deleteConfirm)}
                disabled={deleteAuthor.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteAuthor.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Profile Linking Dialog */}
        <Dialog
          open={!!linkingAuthor}
          onOpenChange={() => {
            setLinkingAuthor(null)
            setProfileSearch('')
          }}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Link Profile to {linkingAuthor?.name}</DialogTitle>
              <DialogDescription>
                Search and select an author profile to link to this author record
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label htmlFor="profile-search" className="text-sm font-medium text-gray-700 mb-2 block">
                  Search profiles
                </label>
                <input
                  id="profile-search"
                  type="text"
                  placeholder="Search by name or email..."
                  value={profileSearch}
                  onChange={(e) => setProfileSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              {profileSearch && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {profilesQuery.isLoading ? (
                    <p className="text-sm text-gray-500 text-center py-4">Searching...</p>
                  ) : profilesQuery.data?.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No matching profiles found
                    </p>
                  ) : (
                    profilesQuery.data?.map((profile) => (
                      <button
                        key={profile.id}
                        onClick={() =>
                          linkProfile.mutate({
                            authorId: linkingAuthor!.id,
                            profileId: profile.id,
                          })
                        }
                        disabled={linkProfile.isPending}
                        className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <p className="font-medium text-gray-900">{profile.name}</p>
                        <p className="text-sm text-gray-600">{profile.email}</p>
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 text-xs rounded ${
                            profile.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : profile.status === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {profile.status}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}

              {!profileSearch && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Start typing to search for author profiles
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </AdminGuard>
  )
}
