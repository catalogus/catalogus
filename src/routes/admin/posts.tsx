import { useCallback, useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DashboardLayout } from '../../components/admin/layout'
import { AdminGuard } from '../../components/admin/AdminGuard'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../contexts/AuthProvider'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
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
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import { PostForm } from '../../components/admin/posts/PostForm'
import { PostDetail } from '../../components/admin/posts/PostDetail'
import type {
  PostRow,
  PostFormValues,
  PostStatus,
  Category,
  Tag,
  PostsFilterParams,
} from '../../types/post'
import { toast } from 'sonner'
import {
  MoreHorizontal,
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  CheckSquare,
} from 'lucide-react'

export const Route = createFileRoute('/admin/posts')({
  component: AdminPostsPage,
})

function AdminPostsPage() {
  const { profile, session, signOut } = useAuth()
  const userName = profile?.name ?? session?.user.email ?? 'Admin'
  const userEmail = session?.user.email ?? ''
  const currentUserId = session?.user.id ?? ''
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  const queryClient = useQueryClient()
  const statusCountsKey = ['admin', 'posts', 'status-counts'] as const

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
  const [editingPost, setEditingPost] = useState<PostRow | null>(null)
  const [detailPost, setDetailPost] = useState<PostRow | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [filters, setFilters] = useState<PostsFilterParams>({
    search: '',
    status: 'published',
    category_id: undefined,
    tag_id: undefined,
    sort_by: 'newest',
    page: 1,
    per_page: 20,
  })

  const categoriesQuery = useQuery({
    queryKey: ['admin', 'post-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_categories')
        .select('*')
        .eq('is_active', true)
        .order('order_weight', { ascending: true })
      if (error) throw error
      return data as Category[]
    },
    staleTime: 60_000,
  })

  const tagsQuery = useQuery({
    queryKey: ['admin', 'post-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_tags')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })
      if (error) throw error
      return data as Tag[]
    },
    staleTime: 60_000,
  })

  const buildPostsQueryKey = (activeFilters: PostsFilterParams) =>
    ['admin', 'posts', activeFilters] as const

  const fetchPosts = useCallback(async (activeFilters: PostsFilterParams) => {
    let query = supabase
      .from('posts')
      .select(
        `
          *,
          categories:post_categories_map(category:post_categories(*)),
          tags:post_tags_map(tag:post_tags(*))
        `,
        { count: 'exact' },
      )

    if (activeFilters.status) {
      query = query.eq('status', activeFilters.status)
    }

    if (activeFilters.search) {
      query = query.or(
        `title.ilike.%${activeFilters.search}%,body.ilike.%${activeFilters.search}%`,
      )
    }

    switch (activeFilters.sort_by) {
      case 'oldest':
        query = query.order('created_at', { ascending: true })
        break
      case 'title_asc':
        query = query.order('title', { ascending: true })
        break
      case 'title_desc':
        query = query.order('title', { ascending: false })
        break
      case 'featured':
        query = query.order('featured', { ascending: false })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    const from = ((activeFilters.page ?? 1) - 1) * (activeFilters.per_page ?? 20)
    const to = from + (activeFilters.per_page ?? 20) - 1
    query = query.range(from, to)

    const { data, error, count } = await withTimeout(
      query,
      15_000,
      'Posts query',
    )
    if (error) throw error

    const authorIds = [
      ...new Set(data?.map((p: any) => p.author_id).filter(Boolean)),
    ]

    let authorsMap: Record<string, any> = {}
    if (authorIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, email, photo_url')
        .in('id', authorIds)

      if (profiles) {
        authorsMap = profiles.reduce((acc: Record<string, any>, profile: any) => {
          acc[profile.id] = profile
          return acc
        }, {})
      }
    }

    const posts = (data ?? []).map((post: any) => ({
      ...post,
      author: post.author_id ? authorsMap[post.author_id] || null : null,
      categories:
        post.categories?.map((c: any) => c.category).filter(Boolean) ?? [],
      tags: post.tags?.map((t: any) => t.tag).filter(Boolean) ?? [],
    }))

    return { posts: posts as PostRow[], total: count ?? 0 }
  }, [withTimeout])

  const postsQueryKey = buildPostsQueryKey(filters)
  const postsQuery = useQuery({
    queryKey: postsQueryKey,
    queryFn: () => fetchPosts(filters),
    staleTime: 30_000,
  })

  useEffect(() => {
    const statuses: PostStatus[] = ['published', 'draft', 'trash']
    statuses.forEach((status) => {
      if (status === filters.status) return
      const nextFilters: PostsFilterParams = { ...filters, status }
      queryClient.prefetchQuery({
        queryKey: buildPostsQueryKey(nextFilters),
        queryFn: () => fetchPosts(nextFilters),
      })
    })
  }, [
    filters.status,
    filters.search,
    filters.category_id,
    filters.tag_id,
    filters.sort_by,
    filters.page,
    filters.per_page,
    queryClient,
    fetchPosts,
  ])

  const updateCurrentPosts = (
    updater: (data: { posts: PostRow[]; total: number }) => {
      posts: PostRow[]
      total: number
    },
  ) => {
    queryClient.setQueryData(postsQueryKey, (old) => {
      if (!old) return old
      return updater(old as { posts: PostRow[]; total: number })
    })
  }

  const updateStatusCounts = (from: PostStatus, to: PostStatus, count: number) => {
    if (from === to || count <= 0) return
    queryClient.setQueryData(statusCountsKey, (old) => {
      if (!old) return old
      const data = old as Record<PostStatus, number>
      return {
        ...data,
        [from]: Math.max(0, (data[from] ?? 0) - count),
        [to]: (data[to] ?? 0) + count,
      }
    })
  }

  const decrementStatusCount = (status: PostStatus, count: number) => {
    if (count <= 0) return
    queryClient.setQueryData(statusCountsKey, (old) => {
      if (!old) return old
      const data = old as Record<PostStatus, number>
      return {
        ...data,
        [status]: Math.max(0, (data[status] ?? 0) - count),
      }
    })
  }

  const statusCountsQuery = useQuery({
    queryKey: statusCountsKey,
    queryFn: async () => {
      const statuses: PostStatus[] = ['published', 'draft', 'trash']
      const entries = await Promise.all(
        statuses.map(async (status) => {
          const { count, error } = await withTimeout(
            supabase
              .from('posts')
              .select('id', { count: 'exact', head: true })
              .eq('status', status),
            15_000,
            'Posts count',
          )
          if (error) throw error
          return [status, count ?? 0] as const
        }),
      )
      return Object.fromEntries(entries) as Record<PostStatus, number>
    },
    staleTime: 30_000,
  })

  const totalPages = Math.ceil(
    (postsQuery.data?.total ?? 0) / (filters.per_page ?? 20),
  )
  const statusCounts = statusCountsQuery.data ?? {
    published: 0,
    draft: 0,
    trash: 0,
  }
  const emptyStateConfig = {
    published: {
      title: 'No published posts yet',
      description: 'Create a post and publish it when you are ready.',
      action: 'New Post',
    },
    draft: {
      title: 'No drafts yet',
      description: 'Start a draft to save your work for later.',
      action: 'Start Draft',
    },
    trash: {
      title: 'Trash is empty',
      description: 'Deleted posts will show up here.',
      action: null,
    },
  }

  const createTag = useMutation({
    mutationFn: async (name: string) => {
      const slug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')

      const { data, error } = await supabase
        .from('post_tags')
        .insert({ name, slug })
        .select()
        .single()

      if (error) throw error
      return data as Tag
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'post-tags'] })
      toast.success('Tag created')
    },
    onError: (err: any) => toast.error(err.message ?? 'Failed to create tag'),
  })

  const uploadImage = async (file: File, postId: string) => {
    const maxFeaturedImageSize = 5 * 1024 * 1024
    if (file.size > maxFeaturedImageSize) {
      throw new Error('Featured image must be 5MB or less.')
    }
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase configuration.')
    }
    const accessToken = session?.access_token
    if (!accessToken) {
      throw new Error('Missing auth session. Please sign in again.')
    }

    const path = `post-images/${postId}/${Date.now()}-${file.name}`
    const encodedPath = path.split('/').map(encodeURIComponent).join('/')
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60_000)
    try {
      const response = await fetch(
        `${supabaseUrl}/storage/v1/object/post-images/${encodedPath}`,
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

    const { data } = supabase.storage.from('post-images').getPublicUrl(path)
    return { path, publicUrl: data.publicUrl }
  }

  const insertPostViaRest = async (post: Record<string, any>) => {
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
      const response = await fetch(`${supabaseUrl}/rest/v1/posts`, {
        method: 'POST',
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify([post]),
        signal: controller.signal,
      })
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || `Post insert failed (${response.status}).`)
      }
    } finally {
      clearTimeout(timeoutId)
    }
  }

  const updatePostsViaRest = async (ids: string[], patch: Record<string, any>) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase configuration.')
    }
    const accessToken = session?.access_token
    if (!accessToken) {
      throw new Error('Missing auth session. Please sign in again.')
    }
    if (ids.length === 0) return

    const idFilter = `id=in.(${ids.join(',')})`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15_000)
    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/posts?${encodeURI(idFilter)}`,
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
        throw new Error(text || `Post update failed (${response.status}).`)
      }
    } finally {
      clearTimeout(timeoutId)
    }
  }

  const updatePostsStatusViaRest = async (ids: string[], status: PostStatus) => {
    await updatePostsViaRest(ids, { status })
  }

  const deletePostsViaRest = async (ids: string[]) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase configuration.')
    }
    const accessToken = session?.access_token
    if (!accessToken) {
      throw new Error('Missing auth session. Please sign in again.')
    }
    if (ids.length === 0) return

    const idFilter = `id=in.(${ids.join(',')})`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15_000)
    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/posts?${encodeURI(idFilter)}`,
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
        throw new Error(text || `Post delete failed (${response.status}).`)
      }
    } finally {
      clearTimeout(timeoutId)
    }
  }

  const upsertPost = useMutation({
    mutationFn: async (
      payload: PostFormValues & { id?: string; file?: File | null },
    ) => {
      const bodyLength = (payload.body ?? '').length
      const fileSize = payload.file?.size ?? 0
      console.log('upsertPost mutation started', {
        title: payload.title,
        slug: payload.slug,
        status: payload.status,
        bodyLength,
        hasFile: !!payload.file,
        fileSize,
      })

      const resolvedPostId = payload.id ?? (() => {
        if (typeof crypto === 'undefined' || !crypto.randomUUID) {
          throw new Error('UUID generator unavailable in this environment.')
        }
        return crypto.randomUUID()
      })()
      let postId = payload.id ?? null

      let featured_image_url = payload.featured_image_url
      let featured_image_path = payload.featured_image_path

      if (payload.file) {
        console.log('Uploading image...')
        const uploaded = await uploadImage(payload.file, resolvedPostId)
        featured_image_url = uploaded.publicUrl
        featured_image_path = uploaded.path
      }

      const base: any = {
        title: payload.title,
        slug: payload.slug,
        excerpt: payload.excerpt,
        body: payload.body,
        featured_image_url,
        featured_image_path,
        author_id: payload.author_id || currentUserId,
        status: payload.status,
        published_at: payload.published_at,
        featured: payload.featured,
        language: payload.language,
      }

      console.log('Inserting/updating post', {
        title: base.title,
        slug: base.slug,
        status: base.status,
        bodyLength,
        hasFile: !!payload.file,
        fileSize,
      })

      if (payload.id) {
        console.log('Updating existing post...')
        const { error } = await withTimeout(
          supabase.from('posts').update(base).eq('id', payload.id),
          15_000,
          'Post update',
        )
        if (error) {
          console.error('Update error:', error)
          throw error
        }
        postId = payload.id
      } else {
        console.log('Inserting new post...')
        base.id = resolvedPostId
        await withTimeout(insertPostViaRest(base), 15_000, 'Post insert')
        postId = resolvedPostId
        console.log('Insert completed', { postId })
      }

      if (!postId) {
        throw new Error('Failed to resolve post ID for updates')
      }

      const updateRelations = async () => {
        try {
          await withTimeout(
            supabase.from('post_categories_map').delete().eq('post_id', postId),
            15_000,
            'Post categories cleanup',
          )
          if (payload.category_ids && payload.category_ids.length > 0) {
            const { error } = await withTimeout(
              supabase.from('post_categories_map').insert(
                payload.category_ids.map((category_id) => ({
                  post_id: postId,
                  category_id,
                })),
              ),
              15_000,
              'Post categories assign',
            )
            if (error) throw error
          }
        } catch (error) {
          console.error('Post categories update failed:', error)
          toast.warning('Post saved, but categories could not be updated.')
        }

        try {
          await withTimeout(
            supabase.from('post_tags_map').delete().eq('post_id', postId),
            15_000,
            'Post tags cleanup',
          )
          if (payload.tag_ids && payload.tag_ids.length > 0) {
            const { error } = await withTimeout(
              supabase.from('post_tags_map').insert(
                payload.tag_ids.map((tag_id) => ({
                  post_id: postId,
                  tag_id,
                })),
              ),
              15_000,
              'Post tags assign',
            )
            if (error) throw error
          }
        } catch (error) {
          console.error('Post tags update failed:', error)
          toast.warning('Post saved, but tags could not be updated.')
        }
      }

      void updateRelations()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] })
      queryClient.invalidateQueries({ queryKey: statusCountsKey })
      setShowForm(false)
      setEditingPost(null)
      toast.success('Post saved')
    },
    onError: (err: any) => {
      console.error('Post save failed:', err)
      toast.error(err?.message ?? 'Failed to save post')
    },
  })

  const moveToTrash = useMutation({
    mutationFn: async (ids: string[]) => {
      const fromStatus = (filters.status ?? 'published') as PostStatus
      await updatePostsViaRest(ids, {
        status: 'trash',
        previous_status: fromStatus,
      })
    },
    onSuccess: (_data, ids) => {
      const fromStatus = (filters.status ?? 'published') as PostStatus
      updateStatusCounts(fromStatus, 'trash', ids.length)
      updateCurrentPosts((data) => {
        const next = data.posts
          .map((post) =>
            ids.includes(post.id)
              ? {
                  ...post,
                  status: 'trash' as PostStatus,
                  previous_status: fromStatus,
                }
              : post,
          )
          .filter((post) => post.status === filters.status)
        return { ...data, posts: next, total: next.length }
      })
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] })
      queryClient.refetchQueries({ queryKey: ['admin', 'posts'] })
      queryClient.invalidateQueries({ queryKey: statusCountsKey })
      setSelectedIds(new Set())
      toast.success('Moved to trash')
    },
    onError: (err: any) => toast.error(err.message ?? 'Failed to move to trash'),
  })

  const restoreFromTrash = useMutation({
    mutationFn: async (ids: string[]) => {
      const currentPosts = postsQuery.data?.posts ?? []
      const selected = currentPosts.filter((post) => ids.includes(post.id))
      const grouped = selected.reduce((acc, post) => {
        const nextStatus = post.previous_status ?? 'draft'
        if (!acc[nextStatus]) acc[nextStatus] = []
        acc[nextStatus].push(post.id)
        return acc
      }, {} as Record<PostStatus, string[]>)

      await Promise.all(
        Object.entries(grouped).map(([status, postIds]) =>
          updatePostsViaRest(postIds, {
            status,
            previous_status: null,
          }),
        ),
      )
    },
    onSuccess: (_data, ids) => {
      const currentPosts = postsQuery.data?.posts ?? []
      const selected = currentPosts.filter((post) => ids.includes(post.id))
      const grouped = selected.reduce((acc, post) => {
        const nextStatus = post.previous_status ?? 'draft'
        acc[nextStatus] = (acc[nextStatus] ?? 0) + 1
        return acc
      }, {} as Record<PostStatus, number>)

      Object.entries(grouped).forEach(([status, count]) => {
        updateStatusCounts('trash', status as PostStatus, count)
      })
      updateCurrentPosts((data) => {
        const next = data.posts.filter((post) => !ids.includes(post.id))
        return { ...data, posts: next, total: next.length }
      })
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] })
      queryClient.invalidateQueries({ queryKey: statusCountsKey })
      setSelectedIds(new Set())
      toast.success('Posts restored to drafts')
    },
    onError: (err: any) => toast.error(err.message ?? 'Failed to restore posts'),
  })

  const deletePost = useMutation({
    mutationFn: async (id: string) => {
      await deletePostsViaRest([id])
    },
    onSuccess: (_data, id) => {
      decrementStatusCount('trash', 1)
      updateCurrentPosts((data) => {
        const next = data.posts.filter((post) => post.id !== id)
        return { ...data, posts: next, total: next.length }
      })
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] })
      queryClient.invalidateQueries({ queryKey: statusCountsKey })
      toast.success('Post deleted')
    },
    onError: (err: any) => toast.error(err.message ?? 'Failed to delete post'),
  })

  const deletePosts = useMutation({
    mutationFn: async (ids: string[]) => {
      await deletePostsViaRest(ids)
    },
    onSuccess: (_data, ids) => {
      decrementStatusCount('trash', ids.length)
      updateCurrentPosts((data) => {
        const next = data.posts.filter((post) => !ids.includes(post.id))
        return { ...data, posts: next, total: next.length }
      })
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] })
      queryClient.invalidateQueries({ queryKey: statusCountsKey })
      setSelectedIds(new Set())
      toast.success('Posts deleted')
    },
    onError: (err: any) => toast.error(err.message ?? 'Failed to delete posts'),
  })

  const toggleFeatured = useMutation({
    mutationFn: async (payload: { id: string; featured: boolean }) => {
      const { error } = await supabase
        .from('posts')
        .update({ featured: payload.featured })
        .eq('id', payload.id)
      if (error) throw error
    },
    onSuccess: (_data, payload) => {
      updateCurrentPosts((data) => ({
        ...data,
        posts: data.posts.map((post) =>
          post.id === payload.id ? { ...post, featured: payload.featured } : post,
        ),
      }))
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] })
      toast.success('Featured status updated')
    },
    onError: (err: any) =>
      toast.error(err.message ?? 'Failed to update featured'),
  })

  const bulkPublish = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('posts')
        .update({ status: 'published', published_at: new Date().toISOString() })
        .in('id', ids)
      if (error) throw error
    },
    onSuccess: (_data, ids) => {
      const fromStatus = (filters.status ?? 'draft') as PostStatus
      updateStatusCounts(fromStatus, 'published', ids.length)
      updateCurrentPosts((data) => {
        const now = new Date().toISOString()
        const next = data.posts
          .map((post) =>
            ids.includes(post.id)
              ? {
                  ...post,
                  status: 'published' as PostStatus,
                  published_at: now,
                }
              : post,
          )
          .filter((post) => post.status === filters.status)
        return { ...data, posts: next, total: next.length }
      })
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] })
      queryClient.invalidateQueries({ queryKey: statusCountsKey })
      setSelectedIds(new Set())
      toast.success('Posts published')
    },
    onError: (err: any) => toast.error(err.message ?? 'Failed to publish posts'),
  })

  const bulkSetFeatured = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('posts')
        .update({ featured: true })
        .in('id', ids)
      if (error) throw error
    },
    onSuccess: (_data, ids) => {
      updateCurrentPosts((data) => ({
        ...data,
        posts: data.posts.map((post) =>
          ids.includes(post.id) ? { ...post, featured: true } : post,
        ),
      }))
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] })
      setSelectedIds(new Set())
      toast.success('Posts marked as featured')
    },
    onError: (err: any) =>
      toast.error(err.message ?? 'Failed to mark as featured'),
  })

  const handleSelectAll = () => {
    if (selectedIds.size === postsQuery.data?.posts.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(postsQuery.data?.posts.map((p) => p.id) ?? []))
    }
  }

  const handleSelectOne = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelectedIds(next)
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'published',
      category_id: undefined,
      tag_id: undefined,
      sort_by: 'newest',
      page: 1,
      per_page: 20,
    })
  }

  const statusColors: Record<PostStatus, string> = {
    draft: 'bg-gray-100 text-gray-800',
    published: 'bg-green-100 text-green-800',
    scheduled: 'bg-blue-100 text-blue-800',
    pending: 'bg-yellow-100 text-yellow-800',
    trash: 'bg-red-100 text-red-800',
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
              <h1 className="text-2xl font-semibold text-gray-900">Posts</h1>
            </div>
            <Button
              onClick={() => {
                setEditingPost(null)
                setShowForm(true)
              }}
            >
              New Post
            </Button>
          </div>

          <div className="rounded-2xl border border-gray-200 p-4 bg-white space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { label: 'Published', value: 'published', count: statusCounts.published },
                { label: 'Drafts', value: 'draft', count: statusCounts.draft },
                { label: 'Trash', value: 'trash', count: statusCounts.trash },
              ].map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      status: tab.value as PostStatus | 'all',
                      page: 1,
                    }))
                  }
                  className={`rounded-full px-4 py-1.5 text-sm border flex items-center gap-2 ${
                    filters.status === tab.value
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      filters.status === tab.value
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {statusCountsQuery.isLoading ? '…' : tab.count}
                  </span>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search posts..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      search: e.target.value,
                      page: 1,
                    }))
                  }
                  className="pl-9"
                />
              </div>

              <select
                value={filters.status ?? 'published'}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: e.target.value as PostStatus | 'all',
                    page: 1,
                  }))
                }
                className="w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="trash">Trash</option>
              </select>

              <select
                value={filters.category_id ?? ''}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    category_id: e.target.value || undefined,
                    page: 1,
                  }))
                }
                className="w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
              >
                <option value="">All Categories</option>
                {categoriesQuery.data?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <select
                value={filters.sort_by ?? 'newest'}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    sort_by: e.target.value as PostsFilterParams['sort_by'],
                    page: 1,
                  }))
                }
                className="w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title_asc">Title A-Z</option>
                <option value="title_desc">Title Z-A</option>
                <option value="featured">Featured First</option>
              </select>
            </div>

            {(filters.search ||
              filters.status !== 'published' ||
              filters.category_id ||
              filters.tag_id) && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                label: 'Published',
                count: statusCountsQuery.isLoading ? '…' : statusCounts.published,
              },
              {
                label: 'Drafts',
                count: statusCountsQuery.isLoading ? '…' : statusCounts.draft,
              },
              {
                label: 'Trash',
                count: statusCountsQuery.isLoading ? '…' : statusCounts.trash,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-3"
              >
                <p className="text-xs uppercase text-gray-500">{item.label}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {item.count}
                </p>
              </div>
            ))}
          </div>

          {selectedIds.size > 0 && (
            <div className="rounded-2xl border border-gray-200 p-3 bg-blue-50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <CheckSquare className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">
                  {selectedIds.size} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                {filters.status === 'draft' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => bulkPublish.mutate(Array.from(selectedIds))}
                  >
                    Publish
                  </Button>
                )}
                {filters.status !== 'trash' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => bulkSetFeatured.mutate(Array.from(selectedIds))}
                    >
                      Set Featured
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => moveToTrash.mutate(Array.from(selectedIds))}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Move to Trash
                    </Button>
                  </>
                )}
                {filters.status === 'trash' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => restoreFromTrash.mutate(Array.from(selectedIds))}
                    >
                      Restore
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deletePosts.mutate(Array.from(selectedIds))}
                    >
                      Delete Permanently
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedIds(new Set())}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            {postsQuery.isLoading ? (
              <p className="text-sm text-gray-500 p-4">Loading posts...</p>
            ) : postsQuery.isError ? (
              <p className="text-sm text-rose-600 p-4">
                Failed to load posts. Check connection or permissions.
              </p>
            ) : (postsQuery.data?.posts.length ?? 0) === 0 ? (
              <div className="p-8 text-center space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {emptyStateConfig[filters.status]?.title ?? 'No posts yet'}
                </h3>
                <p className="text-sm text-gray-600">
                  {emptyStateConfig[filters.status]?.description ??
                    'Create your first post to get started.'}
                </p>
                {emptyStateConfig[filters.status]?.action && (
                  <Button
                    onClick={() => {
                      setEditingPost(null)
                      setShowForm(true)
                    }}
                  >
                    {emptyStateConfig[filters.status].action}
                  </Button>
                )}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={
                            selectedIds.size === postsQuery.data?.posts.length &&
                            selectedIds.size > 0
                          }
                          onChange={handleSelectAll}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Categories</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-16">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {postsQuery.data?.posts.map((post) => (
                      <TableRow
                        key={post.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => setDetailPost(post)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(post.id)}
                            onChange={() => handleSelectOne(post.id)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                        </TableCell>
                        <TableCell className="font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            {post.title}
                            {post.featured && <span className="text-xs">*</span>}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {post.author?.name ?? 'Unknown'}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {post.categories?.map((c) => c.name).join(', ') || '-'}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              statusColors[post.status]
                            }`}
                          >
                            {post.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-600 text-sm">
                          {new Date(post.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => setDetailPost(post)}>
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingPost(post)
                                  setShowForm(true)
                                }}
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  toggleFeatured.mutate({
                                    id: post.id,
                                    featured: !post.featured,
                                  })
                                }
                              >
                                {post.featured ? 'Unfeature' : 'Mark Featured'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {post.status === 'draft' && (
                                <DropdownMenuItem
                                  onClick={() => bulkPublish.mutate([post.id])}
                                >
                                  Publish
                                </DropdownMenuItem>
                              )}
                              {post.status !== 'trash' ? (
                                <DropdownMenuItem
                                  onClick={() => moveToTrash.mutate([post.id])}
                                >
                                  Move to Trash
                                </DropdownMenuItem>
                              ) : (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => restoreFromTrash.mutate([post.id])}
                                  >
                                    Restore to Draft
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => deletePost.mutate(post.id)}
                                  >
                                    Delete Permanently
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">
                        Showing {((filters.page ?? 1) - 1) * (filters.per_page ?? 20) + 1}{' '}
                        to{' '}
                        {Math.min(
                          (filters.page ?? 1) * (filters.per_page ?? 20),
                          postsQuery.data?.total ?? 0,
                        )}{' '}
                        of {postsQuery.data?.total ?? 0} results
                      </span>
                      <select
                        value={filters.per_page}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            per_page: Number(e.target.value),
                            page: 1,
                          }))
                        }
                        className="rounded border border-gray-300 px-2 py-1 text-sm"
                      >
                        <option value={10}>10 per page</option>
                        <option value={20}>20 per page</option>
                        <option value={50}>50 per page</option>
                        <option value={100}>100 per page</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            page: Math.max(1, (prev.page ?? 1) - 1),
                          }))
                        }
                        disabled={(filters.page ?? 1) <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <span className="text-sm text-gray-700">
                        Page {filters.page} of {totalPages}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            page: Math.min(totalPages, (prev.page ?? 1) + 1),
                          }))
                        }
                        disabled={(filters.page ?? 1) >= totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <Sheet open={showForm} onOpenChange={setShowForm}>
            <SheetContent className="w-full sm:max-w-3xl px-4 overflow-hidden">
              <SheetHeader>
                <SheetTitle>{editingPost ? 'Edit Post' : 'New Post'}</SheetTitle>
                <SheetDescription>
                  Create and manage blog posts with rich content.
                </SheetDescription>
              </SheetHeader>
              <div className="pt-4 max-h-[85vh] overflow-y-auto pr-2">
                <PostForm
                  initial={
                    editingPost
                      ? {
                          title: editingPost.title,
                          slug: editingPost.slug,
                          excerpt: editingPost.excerpt ?? '',
                          body: editingPost.body ?? '',
                          featured_image_url:
                            editingPost.featured_image_url ?? '',
                          featured_image_path:
                            editingPost.featured_image_path ?? '',
                          author_id: editingPost.author_id ?? currentUserId,
                          status: editingPost.status,
                          published_at: editingPost.published_at,
                          featured: editingPost.featured,
                          language: editingPost.language as 'pt' | 'en',
                          category_ids:
                            editingPost.categories?.map((c) => c.id) ?? [],
                          tag_ids: editingPost.tags?.map((t) => t.id) ?? [],
                          new_tags: [],
                        }
                      : undefined
                  }
                  submitting={upsertPost.isPending}
                  onSubmit={async (vals, file) => {
                    await upsertPost.mutateAsync({
                      ...vals,
                      id: editingPost?.id,
                      file,
                    })
                  }}
                  categories={categoriesQuery.data ?? []}
                  tags={tagsQuery.data ?? []}
                  onCreateTag={(name) => createTag.mutateAsync(name)}
                  currentUserId={currentUserId}
                  onCancel={() => {
                    setShowForm(false)
                    setEditingPost(null)
                  }}
                />
              </div>
            </SheetContent>
          </Sheet>

          <Dialog open={!!detailPost} onOpenChange={() => setDetailPost(null)}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{detailPost?.title ?? 'Post Detail'}</DialogTitle>
              </DialogHeader>
              {detailPost && <PostDetail post={detailPost} />}
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </AdminGuard>
  )
}
