import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DashboardLayout } from '../../components/admin/layout'
import { AdminGuard } from '../../components/admin/AdminGuard'
import { StatusBadge } from '../../components/admin/ui/StatusBadge'
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

  const authorsQuery = useQuery({
    queryKey: ['admin', 'authors'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, email, status, phone, bio, photo_url, photo_path, social_links, created_at, updated_at')
          .eq('role', 'author')
          .order('created_at', { ascending: false })
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

  const uploadPhoto = async (file: File, userId: string) => {
    const path = `author-photos/${userId}/${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('author-photos')
      .upload(path, file, { upsert: true })
    if (uploadError) throw uploadError
    const { data } = supabase.storage.from('author-photos').getPublicUrl(path)
    return { path, publicUrl: data.publicUrl }
  }

  const createAuthor = useMutation({
    mutationFn: async (payload: { values: AuthorFormValues; file?: File | null }) => {
      const { values, file } = payload

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(values.email)) {
        throw new Error('Please enter a valid email address')
      }

      // Create auth user with email auto-confirm
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email.toLowerCase().trim(),
        password: values.password!,
        options: {
          data: { name: values.name },
          emailRedirectTo: undefined,
        },
      })

      if (authError) {
        // Better error messages
        if (authError.message.includes('email_address_invalid')) {
          throw new Error('Email address format is invalid. Please check Supabase Auth settings or use a different email domain.')
        }
        if (authError.message.includes('User already registered')) {
          throw new Error('An account with this email already exists.')
        }
        throw authError
      }
      if (!authData.user) throw new Error('Failed to create user')

      const userId = authData.user.id

      // Upload photo if provided
      let photo_path = null
      let photo_url = null
      if (file) {
        const uploaded = await uploadPhoto(file, userId)
        photo_url = uploaded.publicUrl
        photo_path = uploaded.path
      }

      // Create or update profile with author role
      // First, check if profile was auto-created
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', userId)
        .single()

      if (existingProfile) {
        // Profile was auto-created, update it with correct role
        const { error: updateError, data: profileData } = await supabase
          .from('profiles')
          .update({
            name: values.name,
            email: values.email.toLowerCase().trim(),
            phone: values.phone,
            bio: values.bio,
            photo_url,
            photo_path,
            role: 'author',
            status: values.status,
            social_links: values.social_links,
          })
          .eq('id', userId)
          .select()

        if (updateError) throw updateError
        console.log('Updated profile to author role:', profileData)
      } else {
        // Profile doesn't exist, create it
        const { error: insertError, data: profileData } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            name: values.name,
            email: values.email.toLowerCase().trim(),
            phone: values.phone,
            bio: values.bio,
            photo_url,
            photo_path,
            role: 'author',
            status: values.status,
            social_links: values.social_links,
          })
          .select()

        if (insertError) throw insertError
        console.log('Created author profile:', profileData)
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
      let photo_path = values.photo_path
      let photo_url = values.photo_url
      if (file) {
        // Delete old photo if exists
        if (values.photo_path) {
          await supabase.storage.from('author-photos').remove([values.photo_path])
        }
        const uploaded = await uploadPhoto(file, id)
        photo_url = uploaded.publicUrl
        photo_path = uploaded.path
      }

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          name: values.name,
          phone: values.phone,
          bio: values.bio,
          photo_url,
          photo_path,
          status: values.status,
          social_links: values.social_links,
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
        .from('profiles')
        .select('photo_path')
        .eq('id', id)
        .single()

      // Delete photo if exists
      if (author?.photo_path) {
        await supabase.storage.from('author-photos').remove([author.photo_path])
      }

      // Delete profile (this will also delete the auth user via cascade)
      const { error } = await supabase.from('profiles').delete().eq('id', id)
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

  const updateStatus = useMutation({
    mutationFn: async (payload: { id: string; status: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ status: payload.status })
        .eq('id', payload.id)
      if (error) throw error
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'authors'] })
      await queryClient.refetchQueries({ queryKey: ['admin', 'authors'] })
      toast.success('Status updated')
    },
    onError: (err: any) => toast.error(err.message ?? 'Failed to update status'),
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
                      <th className="py-2 pr-3">Email</th>
                      <th className="py-2 pr-3">Phone</th>
                      <th className="py-2 pr-3">Status</th>
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
                          {author.email ?? '—'}
                        </td>
                        <td className="py-3 pr-3 text-gray-600">
                          {author.phone ?? '—'}
                        </td>
                        <td className="py-3 pr-3">
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
                              {(author.status !== 'approved' || author.status !== 'rejected' || author.status !== 'pending') && (
                                <DropdownMenuSeparator />
                              )}
                              {author.status !== 'approved' && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    updateStatus.mutate({
                                      id: author.id,
                                      status: 'approved',
                                    })
                                  }}
                                >
                                  Approve
                                </DropdownMenuItem>
                              )}
                              {author.status !== 'rejected' && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    updateStatus.mutate({
                                      id: author.id,
                                      status: 'rejected',
                                    })
                                  }}
                                >
                                  Reject
                                </DropdownMenuItem>
                              )}
                              {(author.status === 'approved' || author.status === 'rejected') && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    updateStatus.mutate({
                                      id: author.id,
                                      status: 'pending',
                                    })
                                  }}
                                >
                                  Set to Pending
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
                  : 'Create a new author account'}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <AuthorForm
                initial={
                  editingAuthor
                    ? {
                        name: editingAuthor.name,
                        email: '', // Email not editable
                        phone: editingAuthor.phone ?? '',
                        bio: editingAuthor.bio ?? '',
                        photo_url: editingAuthor.photo_url ?? '',
                        photo_path: editingAuthor.photo_path ?? '',
                        social_links: editingAuthor.social_links ?? {},
                        status: (editingAuthor.status as any) ?? 'pending',
                        role: 'author',
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
                and will remove their account and all associated data.
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
      </DashboardLayout>
    </AdminGuard>
  )
}
