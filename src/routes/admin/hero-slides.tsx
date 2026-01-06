import { useCallback, useState } from 'react'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import type {
  HeroSlide,
  HeroSlideFormValues,
  ContentType,
} from '../../types/hero'
import { toast } from 'sonner'
import { MoreHorizontal, Eye, EyeOff, Trash2 } from 'lucide-react'
import { HeroSlideForm } from '../../components/admin/hero/HeroSlideForm'

export const Route = createFileRoute('/admin/hero-slides')({
  component: AdminHeroSlidesPage,
})

function AdminHeroSlidesPage() {
  const { profile, session, signOut } = useAuth()
  const userName = profile?.name ?? session?.user.email ?? 'Admin'
  const userEmail = session?.user.email ?? ''
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  const queryClient = useQueryClient()

  const withTimeout = async <T,>(promise: Promise<T>, ms: number, label: string) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    const timeoutPromise = new Promise<T>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`${label} timed out. Check network or Supabase policies.`))
      }, ms)
    })
    try {
      return await Promise.race([promise, timeoutPromise])
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }

  const [showForm, setShowForm] = useState(false)
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null)

  const slidesQuery = useQuery({
    queryKey: ['admin', 'hero-slides'],
    queryFn: async () => {
      const { data, error } = await withTimeout(
        supabase
          .from('hero_slides')
          .select('*')
          .order('order_weight', { ascending: true }),
        15_000,
        'Hero slides query',
      )
      if (error) throw error
      return data as HeroSlide[]
    },
    staleTime: 30_000,
  })

  const booksQuery = useQuery({
    queryKey: ['admin', 'books-for-hero'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('books')
        .select('id, title, cover_url')
        .order('title', { ascending: true })
      if (error) throw error
      return data as { id: string; title: string; cover_url: string | null }[]
    },
    staleTime: 60_000,
  })

  const authorsQuery = useQuery({
    queryKey: ['admin', 'authors-for-hero'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('authors')
        .select('id, name, photo_url')
        .eq('featured', true)
        .order('name', { ascending: true })
      if (error) throw error
      return data as { id: string; name: string; photo_url: string | null }[]
    },
    staleTime: 60_000,
  })

  const postsQuery = useQuery({
    queryKey: ['admin', 'posts-for-hero'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, featured_image_url')
        .eq('status', 'published')
        .order('title', { ascending: true })
      if (error) throw error
      return data as { id: string; title: string; featured_image_url: string | null }[]
    },
    staleTime: 60_000,
  })

  const uploadBackgroundImage = async (file: File, slideId: string) => {
    const maxImageSize = 5 * 1024 * 1024
    if (file.size > maxImageSize) {
      throw new Error('Background image must be 5MB or less.')
    }
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase configuration.')
    }
    const accessToken = session?.access_token
    if (!accessToken) {
      throw new Error('Missing auth session. Please sign in again.')
    }

    const path = `hero-backgrounds/${slideId}/${Date.now()}-${file.name}`
    const encodedPath = path.split('/').map(encodeURIComponent).join('/')
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60_000)
    try {
      const response = await fetch(
        `${supabaseUrl}/storage/v1/object/hero-backgrounds/${encodedPath}`,
        {
          method: 'POST',
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': file.type || 'application/octet-stream',
            'x-upsert': 'true',
          },
          body: file,
          signal: controller.signal,
        },
      )
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || `Image upload failed (${response.status}).`)
      }
    } finally {
      clearTimeout(timeoutId)
    }

    const { data } = supabase.storage.from('hero-backgrounds').getPublicUrl(path)
    return { path, publicUrl: data.publicUrl }
  }

  const insertSlideViaRest = async (slide: Record<string, any>) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase configuration.')
    }
    const accessToken = session?.access_token
    if (!accessToken) {
      throw new Error('Missing auth session. Please sign in again.')
    }
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15_000)
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/hero_slides`, {
        method: 'POST',
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify([slide]),
        signal: controller.signal,
      })
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || `Slide insert failed (${response.status}).`)
      }
    } finally {
      clearTimeout(timeoutId)
    }
  }

  const updateSlideViaRest = async (id: string, patch: Record<string, any>) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase configuration.')
    }
    const accessToken = session?.access_token
    if (!accessToken) {
      throw new Error('Missing auth session. Please sign in again.')
    }

    const idFilter = `id=eq.${id}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15_000)
    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/hero_slides?${idFilter}`,
        {
          method: 'PATCH',
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify(patch),
          signal: controller.signal,
        },
      )
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || `Slide update failed (${response.status}).`)
      }
    } finally {
      clearTimeout(timeoutId)
    }
  }

  const deleteSlideViaRest = async (id: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase configuration.')
    }
    const accessToken = session?.access_token
    if (!accessToken) {
      throw new Error('Missing auth session. Please sign in again.')
    }

    const idFilter = `id=eq.${id}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15_000)
    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/hero_slides?${idFilter}`,
        {
          method: 'DELETE',
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${accessToken}`,
            Prefer: 'return=minimal',
          },
          signal: controller.signal,
        },
      )
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || `Slide delete failed (${response.status}).`)
      }
    } finally {
      clearTimeout(timeoutId)
    }
  }

  const upsertSlide = useMutation({
    mutationFn: async (
      payload: HeroSlideFormValues & { id?: string; file?: File | null },
    ) => {
      const resolvedSlideId = payload.id ?? crypto.randomUUID()
      let slideId = payload.id ?? null

      let background_image_url = payload.background_image_url
      let background_image_path = payload.background_image_path

      if (payload.file) {
        const uploaded = await uploadBackgroundImage(payload.file, resolvedSlideId)
        background_image_url = uploaded.publicUrl
        background_image_path = uploaded.path
      }

      const base: any = {
        title: payload.title,
        subtitle: payload.subtitle || null,
        description: payload.description || null,
        cta_text: payload.cta_text || null,
        cta_url: payload.cta_url || null,
        background_image_url,
        background_image_path,
        accent_color: payload.accent_color || null,
        content_type: payload.content_type,
        content_id: payload.content_id,
        order_weight: payload.order_weight,
        is_active: payload.is_active,
      }

      if (payload.id) {
        await updateSlideViaRest(payload.id, base)
        slideId = payload.id
      } else {
        base.id = resolvedSlideId
        await insertSlideViaRest(base)
        slideId = resolvedSlideId
      }

      return slideId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'hero-slides'] })
      setShowForm(false)
      setEditingSlide(null)
      toast.success('Hero slide saved')
    },
    onError: (err: any) => {
      toast.error(err?.message ?? 'Failed to save hero slide')
    },
  })

  const deleteSlide = useMutation({
    mutationFn: async (id: string) => {
      await deleteSlideViaRest(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'hero-slides'] })
      toast.success('Hero slide deleted')
    },
    onError: (err: any) => toast.error(err.message ?? 'Failed to delete hero slide'),
  })

  const toggleActive = useMutation({
    mutationFn: async (payload: { id: string; is_active: boolean }) => {
      await updateSlideViaRest(payload.id, { is_active: payload.is_active })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'hero-slides'] })
      toast.success('Status updated')
    },
    onError: (err: any) => toast.error(err.message ?? 'Failed to update status'),
  })

  const getContentTypeLabel = (type: ContentType) => {
    switch (type) {
      case 'book':
        return 'Book'
      case 'author':
        return 'Author'
      case 'post':
        return 'Post'
      case 'custom':
        return 'Custom'
      default:
        return type
    }
  }

  const getLinkedContentName = (slide: HeroSlide) => {
    if (slide.content_type === 'custom' || !slide.content_id) {
      return '-'
    }

    if (slide.content_type === 'book') {
      const book = booksQuery.data?.find((b) => b.id === slide.content_id)
      return book?.title ?? 'Unknown'
    }

    if (slide.content_type === 'author') {
      const author = authorsQuery.data?.find((a) => a.id === slide.content_id)
      return author?.name ?? 'Unknown'
    }

    if (slide.content_type === 'post') {
      const post = postsQuery.data?.find((p) => p.id === slide.content_id)
      return post?.title ?? 'Unknown'
    }

    return '-'
  }

  return (
    <AdminGuard>
      <DashboardLayout
        userRole={profile?.role ?? 'admin'}
        userName={userName}
        userEmail={userEmail}
        onSignOut={signOut}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase text-gray-500">Content</p>
              <h1 className="text-2xl font-semibold text-gray-900">Hero Slides</h1>
            </div>
            <Button
              onClick={() => {
                setEditingSlide(null)
                setShowForm(true)
              }}
            >
              New Slide
            </Button>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            {slidesQuery.isLoading ? (
              <p className="text-sm text-gray-500 p-4">Loading hero slides...</p>
            ) : slidesQuery.isError ? (
              <p className="text-sm text-rose-600 p-4">
                Failed to load hero slides. Check connection or permissions.
              </p>
            ) : (slidesQuery.data?.length ?? 0) === 0 ? (
              <div className="p-8 text-center space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  No hero slides yet
                </h3>
                <p className="text-sm text-gray-600">
                  Create your first hero slide to showcase content on the homepage.
                </p>
                <Button
                  onClick={() => {
                    setEditingSlide(null)
                    setShowForm(true)
                  }}
                >
                  Create First Slide
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Thumbnail</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Content Type</TableHead>
                    <TableHead>Linked Content</TableHead>
                    <TableHead className="w-24">Order</TableHead>
                    <TableHead className="w-20">Active</TableHead>
                    <TableHead className="w-16">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slidesQuery.data?.map((slide) => (
                    <TableRow key={slide.id} className="hover:bg-gray-50">
                      <TableCell>
                        {slide.background_image_url ? (
                          <img
                            src={slide.background_image_url}
                            alt={slide.title}
                            className="h-12 w-20 object-cover rounded border border-gray-200"
                          />
                        ) : (
                          <div className="h-12 w-20 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                            <span className="text-xs text-gray-400">No image</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">
                        {slide.title}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {getContentTypeLabel(slide.content_type)}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {getLinkedContentName(slide)}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {slide.order_weight}
                      </TableCell>
                      <TableCell>
                        <button
                          type="button"
                          onClick={() =>
                            toggleActive.mutate({
                              id: slide.id,
                              is_active: !slide.is_active,
                            })
                          }
                          className="flex items-center gap-1 text-sm"
                        >
                          {slide.is_active ? (
                            <Eye className="h-4 w-4 text-green-600" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingSlide(slide)
                                setShowForm(true)
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                toggleActive.mutate({
                                  id: slide.id,
                                  is_active: !slide.is_active,
                                })
                              }
                            >
                              {slide.is_active ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    'Are you sure you want to delete this slide?',
                                  )
                                ) {
                                  deleteSlide.mutate(slide.id)
                                }
                              }}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <Sheet open={showForm} onOpenChange={setShowForm}>
            <SheetContent className="w-full sm:max-w-2xl px-4 overflow-hidden">
              <SheetHeader>
                <SheetTitle>
                  {editingSlide ? 'Edit Hero Slide' : 'New Hero Slide'}
                </SheetTitle>
                <SheetDescription>
                  Create and manage hero slides for the homepage carousel.
                </SheetDescription>
              </SheetHeader>
              <div className="pt-4 max-h-[85vh] overflow-y-auto pr-2">
                <HeroSlideForm
                  initial={
                    editingSlide
                      ? {
                          title: editingSlide.title,
                          subtitle: editingSlide.subtitle ?? '',
                          description: editingSlide.description ?? '',
                          cta_text: editingSlide.cta_text ?? '',
                          cta_url: editingSlide.cta_url ?? '',
                          background_image_url: editingSlide.background_image_url ?? '',
                          background_image_path: editingSlide.background_image_path ?? '',
                          accent_color: editingSlide.accent_color ?? '',
                          content_type: editingSlide.content_type,
                          content_id: editingSlide.content_id,
                          order_weight: editingSlide.order_weight,
                          is_active: editingSlide.is_active,
                        }
                      : undefined
                  }
                  submitting={upsertSlide.isPending}
                  onSubmit={async (vals, file) => {
                    await upsertSlide.mutateAsync({
                      ...vals,
                      id: editingSlide?.id,
                      file,
                    })
                  }}
                  books={booksQuery.data ?? []}
                  authors={authorsQuery.data ?? []}
                  posts={postsQuery.data ?? []}
                  onCancel={() => {
                    setShowForm(false)
                    setEditingSlide(null)
                  }}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </DashboardLayout>
    </AdminGuard>
  )
}
