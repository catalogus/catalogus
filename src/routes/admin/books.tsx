import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DashboardLayout } from '../../components/admin/layout'
import { withAdminGuard } from '../../components/admin/withAdminGuard'
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
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { BookForm, type BookFormValues } from '../../components/admin/books/BookForm'
import { toast } from 'sonner'
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

export const Route = createFileRoute('/admin/books')({
  component: withAdminGuard(AdminBooksPage),
})

type BookRow = {
  id: string
  title: string
  slug: string
  price_mzn: number
  promo_type: 'promocao' | 'pre-venda' | null
  promo_price_mzn: number | null
  promo_start_date: string | null
  promo_end_date: string | null
  stock: number
  category: string | null
  language: string
  is_active: boolean
  featured: boolean
  cover_url: string | null
  cover_path: string | null
  description: string | null
  description_json: any
  isbn: string | null
  publisher: string | null
  seo_title: string | null
  seo_description: string | null
  authors?: {
    author_id: string
    authors: { id: string; name: string | null; photo_path: string | null } | null
  }[]
}

function AdminBooksPage() {
  const { profile, session, signOut } = useAuth()
  const userName = profile?.name ?? session?.user.email ?? 'Admin'
  const userEmail = session?.user.email ?? ''
  const queryClient = useQueryClient()
  const authKey = session?.user.id ?? 'anon'
  const canQuery = !!session?.access_token
  const [showForm, setShowForm] = useState(false)
  const [editingBook, setEditingBook] = useState<BookRow | null>(null)
  const [detailBook, setDetailBook] = useState<BookRow | null>(null)
  const authorsQuery = useQuery({
    queryKey: ['admin', 'authors', 'list', authKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('authors')
        .select('id, name, photo_path')
        .order('name', { ascending: true })
      if (error) throw error
      return data as Array<{ id: string; name: string; photo_path: string | null }>
    },
    staleTime: 60_000,
    enabled: canQuery,
  })

  const booksQuery = useQuery({
    queryKey: ['admin', 'books', authKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('books')
        .select(
          'id, title, slug, price_mzn, promo_type, promo_price_mzn, promo_start_date, promo_end_date, stock, category, language, is_active, featured, cover_url, cover_path, description, description_json, isbn, publisher, seo_title, seo_description, authors:authors_books(author_id, authors(id, name, photo_path))',
        )
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as BookRow[]
    },
    staleTime: 30_000,
    enabled: canQuery,
  })

  const toggleActive = useMutation({
    mutationFn: async (payload: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('books')
        .update({ is_active: payload.is_active })
        .eq('id', payload.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'books'] })
      queryClient.invalidateQueries({ queryKey: ['home', 'featured-books'] })
      toast.success('Status updated')
    },
    onError: (err) => toast.error(err.message ?? 'Failed to update status'),
  })

  const toggleFeatured = useMutation({
    mutationFn: async (payload: { id: string; featured: boolean }) => {
      const { error } = await supabase
        .from('books')
        .update({ featured: payload.featured })
        .eq('id', payload.id)
      if (error) throw error
    },
    onSuccess: (_data, payload) => {
      setDetailBook((current) =>
        current?.id === payload.id
          ? { ...current, featured: payload.featured }
          : current,
      )
      queryClient.invalidateQueries({ queryKey: ['admin', 'books'] })
      queryClient.invalidateQueries({ queryKey: ['home', 'featured-books'] })
      toast.success('Featured updated')
    },
    onError: (err) => toast.error(err.message ?? 'Failed to update featured'),
  })

  const updateStock = useMutation({
    mutationFn: async (payload: { id: string; stock: number }) => {
      const { error } = await supabase
        .from('books')
        .update({ stock: payload.stock })
        .eq('id', payload.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'books'] })
    },
  })

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN',
      maximumFractionDigits: 0,
    }).format(value)

  const coverUrlFor = (book: BookRow) => {
    if (book.cover_url) return book.cover_url
    if (book.cover_path) {
      return supabase.storage.from('covers').getPublicUrl(book.cover_path).data
        .publicUrl
    }
    return null
  }

  const addAuthor = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('authors')
        .insert({ name })
        .select('id, name, photo_path')
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'authors', 'list'] })
      toast.success('Author added')
    },
    onError: (err) => toast.error(err.message ?? 'Failed to add author'),
  })

  const uploadCover = async (file: File, bookId: string) => {
    const path = `covers/${bookId}/${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('covers')
      .upload(path, file, { upsert: true })
    if (uploadError) throw uploadError
    const { data } = supabase.storage.from('covers').getPublicUrl(path)
    return { path, publicUrl: data.publicUrl }
  }

  const upsertBook = useMutation({
    mutationFn: async (
      payload: BookFormValues & { id?: string; file?: File | null },
    ) => {
      const author_ids = payload.author_ids
      const bookId = payload.id ?? crypto.randomUUID?.() ?? Date.now().toString()

      let cover_url = payload.cover_url
      let cover_path = payload.cover_path
      if (payload.file) {
        const uploaded = await uploadCover(payload.file, bookId)
        cover_url = uploaded.publicUrl
        cover_path = uploaded.path
      }

      const description_json = payload.description
        ? {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: payload.description }],
              },
            ],
          }
        : null

      const base: any = {
        ...payload,
        id: payload.id ?? bookId,
        cover_url,
        cover_path,
        description_json,
        promo_type: payload.promo_type || null,
        promo_price_mzn: payload.promo_price_mzn ?? null,
        promo_start_date: payload.promo_start_date || null,
        promo_end_date: payload.promo_end_date || null,
      }
      delete base.file
      delete base.author_ids

      if (payload.id) {
        const { error } = await supabase.from('books').update(base).eq('id', payload.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('books').insert(base)
        if (error) throw error
      }

      await supabase.from('authors_books').delete().eq('book_id', bookId)
      if (author_ids && author_ids.length > 0) {
        const { error } = await supabase.from('authors_books').insert(
          author_ids.map((author_id) => ({
            author_id,
            book_id: bookId,
          })),
        )
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'books'] })
      queryClient.invalidateQueries({ queryKey: ['home', 'featured-books'] })
      setShowForm(false)
      setEditingBook(null)
      toast.success('Book saved')
    },
    onError: (err) => toast.error(err.message ?? 'Failed to save book'),
  })

  const deleteBook = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('books').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'books'] })
      queryClient.invalidateQueries({ queryKey: ['home', 'featured-books'] })
      toast.success('Book deleted')
    },
    onError: (err) => toast.error(err.message ?? 'Failed to delete book'),
  })

  return (
    <DashboardLayout
      userRole={profile?.role ?? 'admin'}
      userName={userName}
      userEmail={userEmail}
      onSignOut={signOut}
    >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase text-gray-500">Catalog</p>
              <h1 className="text-2xl font-semibold text-gray-900">Books</h1>
            </div>
            <Button
              onClick={() => {
                setEditingBook(null)
                setShowForm(true)
              }}
            >
              Add book
            </Button>
          </div>
          <div className="rounded-2xl border border-gray-200 p-4 bg-white">
            {booksQuery.isLoading ? (
              <p className="text-sm text-gray-500">Loading books…</p>
            ) : booksQuery.isError ? (
              <p className="text-sm text-rose-600">
                Failed to load books. Check connection or permissions.
              </p>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Authors</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Language</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {booksQuery.data?.map((book) => (
                      <TableRow
                        key={book.id}
                        className="align-middle cursor-pointer hover:bg-gray-50"
                        onClick={() => setDetailBook(book)}
                      >
                        <TableCell className="font-medium text-gray-900">
                          {book.title}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {book.authors
                            ?.map((a) => a.authors?.name)
                            .filter(Boolean)
                            .join(', ') || '—'}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {book.category ?? '—'}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {book.language?.toUpperCase()}
                        </TableCell>
                        <TableCell className="text-gray-900">
                          {formatPrice(book.price_mzn)}
                        </TableCell>
                        <TableCell className="text-gray-900">{book.stock}</TableCell>
                        <TableCell className="text-sm">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onMouseDown={(e) => e.stopPropagation()}
                                onClickCapture={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDetailBook(book)}
                              >
                                View details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingBook(book)
                                  setShowForm(true)
                                }}
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  toggleFeatured.mutate({
                                    id: book.id,
                                    featured: !book.featured,
                                  })
                                }
                              >
                                {book.featured ? 'Unfeature' : 'Mark featured'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  toggleActive.mutate({
                                    id: book.id,
                                    is_active: !book.is_active,
                                  })
                                }
                              >
                                {book.is_active ? 'Deactivate' : 'Activate'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => deleteBook.mutate(book.id)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  {booksQuery.data?.length === 0 && (
                    <TableCaption>No books yet.</TableCaption>
                  )}
                </Table>
              </div>
            )}
          </div>
          <Sheet open={showForm} onOpenChange={setShowForm}>
            <SheetContent className="w-full sm:max-w-xl px-4 overflow-hidden">
              <SheetHeader>
                <SheetTitle>
                  {editingBook ? 'Edit book' : 'Add book'}
                </SheetTitle>
                <SheetDescription>
                  Manage title, slug, pricing, stock, and visibility.
                </SheetDescription>
              </SheetHeader>
              <div className="pt-4 max-h-[80vh] overflow-y-auto pr-2 space-y-4">
                <BookForm
                  initial={
                    editingBook
                      ? {
                          title: editingBook.title,
                          slug: editingBook.slug,
                          price_mzn: editingBook.price_mzn,
                          promo_type: editingBook.promo_type ?? '',
                          promo_price_mzn: editingBook.promo_price_mzn ?? null,
                          promo_start_date: editingBook.promo_start_date ?? '',
                          promo_end_date: editingBook.promo_end_date ?? '',
                          stock: editingBook.stock,
                          category: editingBook.category ?? '',
                          language: editingBook.language,
                          is_active: editingBook.is_active,
                          featured: editingBook.featured ?? false,
                          cover_url: editingBook.cover_url ?? '',
                          cover_path: editingBook.cover_path ?? '',
                          description: editingBook.description ?? '',
                          isbn: editingBook.isbn ?? '',
                          publisher: editingBook.publisher ?? '',
                          seo_title: editingBook.seo_title ?? '',
                          seo_description: editingBook.seo_description ?? '',
                          author_ids:
                            editingBook.authors?.map((a) => a.author_id) ?? [],
                        }
                      : undefined
                  }
                  submitting={upsertBook.isPending}
                  onSubmit={async (vals, file) => {
                    await upsertBook.mutateAsync({
                      ...vals,
                      id: editingBook?.id,
                      file,
                    })
                  }}
                  authors={
                    authorsQuery.data?.map((a) => ({
                      id: a.id,
                      name: a.name ?? 'Autor',
                    })) ?? []
                  }
                  onCreateAuthor={(name) => addAuthor.mutateAsync(name)}
                  onCancel={() => {
                    setShowForm(false)
                    setEditingBook(null)
                  }}
                />
              </div>
            </SheetContent>
          </Sheet>
          <Dialog open={!!detailBook} onOpenChange={() => setDetailBook(null)}>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>{detailBook?.title ?? 'Book detail'}</DialogTitle>
                <DialogDescription>
                  {detailBook?.seo_description ??
                    detailBook?.description ??
                    'Book details'}
                </DialogDescription>
              </DialogHeader>
              {detailBook && (
                <div className="space-y-4">
                  {coverUrlFor(detailBook) && (
                    <img
                      src={coverUrlFor(detailBook) ?? ''}
                      alt={detailBook.title}
                      className="w-full max-h-64 rounded-xl object-cover border border-gray-200"
                    />
                  )}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Price</p>
                      <p className="font-semibold text-gray-900">
                        {formatPrice(detailBook.price_mzn)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Stock</p>
                      <p className="font-semibold text-gray-900">
                        {detailBook.stock}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Category</p>
                      <p className="font-semibold text-gray-900">
                        {detailBook.category ?? '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Language</p>
                      <p className="font-semibold text-gray-900">
                        {detailBook.language?.toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">ISBN</p>
                      <p className="font-semibold text-gray-900">
                        {detailBook.isbn ?? '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Publisher</p>
                      <p className="font-semibold text-gray-900">
                        {detailBook.publisher ?? '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Featured</p>
                      <p className="font-semibold text-gray-900">
                        {detailBook.featured ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Promo type</p>
                      <p className="font-semibold text-gray-900">
                        {detailBook.promo_type ?? '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Promo price</p>
                      <p className="font-semibold text-gray-900">
                        {detailBook.promo_price_mzn !== null &&
                        detailBook.promo_price_mzn !== undefined
                          ? formatPrice(detailBook.promo_price_mzn)
                          : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Promo start</p>
                      <p className="font-semibold text-gray-900">
                        {detailBook.promo_start_date ?? '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Promo end</p>
                      <p className="font-semibold text-gray-900">
                        {detailBook.promo_end_date ?? '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Active</p>
                      <p className="font-semibold text-gray-900">
                        {detailBook.is_active ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                  {detailBook.authors && detailBook.authors.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-gray-500 text-sm">Authors</p>
                      <p className="font-semibold text-gray-900">
                        {detailBook.authors
                          .map((a) => a.authors?.name)
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    </div>
                  )}
                  {detailBook.description && (
                    <div className="space-y-1">
                      <p className="text-gray-500 text-sm">Description</p>
                      <p className="text-gray-900 whitespace-pre-line">
                        {detailBook.description}
                      </p>
                    </div>
                  )}
                  {(detailBook.seo_title || detailBook.seo_description) && (
                    <div className="space-y-1">
                      <p className="text-gray-500 text-sm">SEO</p>
                      <p className="text-gray-900 font-semibold">
                        {detailBook.seo_title}
                      </p>
                      <p className="text-gray-700 text-sm">
                        {detailBook.seo_description}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
    </DashboardLayout>
  )
}
