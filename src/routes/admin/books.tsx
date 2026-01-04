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
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { BookForm, type BookFormValues } from '../../components/admin/books/BookForm'

export const Route = createFileRoute('/admin/books')({
  component: AdminBooksPage,
})

type BookRow = {
  id: string
  title: string
  price_mzn: number
  stock: number
  category: string | null
  language: string
  is_active: boolean
  cover_url: string | null
  description: string | null
}

function AdminBooksPage() {
  const { profile, session, signOut } = useAuth()
  const userName = profile?.name ?? session?.user.email ?? 'Admin'
  const userEmail = session?.user.email ?? ''
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingBook, setEditingBook] = useState<BookRow | null>(null)

  const booksQuery = useQuery({
    queryKey: ['admin', 'books'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('books')
        .select(
          'id, title, price_mzn, stock, category, language, is_active, cover_url, description',
        )
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as BookRow[]
    },
    staleTime: 30_000,
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
    },
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

  const upsertBook = useMutation({
    mutationFn: async (payload: BookFormValues & { id?: string }) => {
      if (payload.id) {
        const { error } = await supabase
          .from('books')
          .update(payload)
          .eq('id', payload.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('books').insert(payload)
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'books'] })
      setShowForm(false)
      setEditingBook(null)
    },
  })

  const deleteBook = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('books').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'books'] })
    },
  })

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
                      <TableHead>Category</TableHead>
                      <TableHead>Language</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {booksQuery.data?.map((book) => (
                      <TableRow key={book.id} className="align-middle">
                        <TableCell className="font-medium text-gray-900">
                          {book.title}
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
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={0}
                              defaultValue={book.stock}
                              onBlur={(e) =>
                                updateStock.mutate({
                                  id: book.id,
                                  stock: Number(e.target.value || 0),
                                })
                              }
                              className="w-20 rounded-lg border border-input px-2 py-1 text-sm"
                            />
                            {updateStock.isPending && (
                              <span className="text-xs text-gray-500">
                                Saving…
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <label className="inline-flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={book.is_active}
                              onChange={(e) =>
                                toggleActive.mutate({
                                  id: book.id,
                                  is_active: e.target.checked,
                                })
                              }
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <span className="text-gray-700">
                              {book.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </label>
                        </TableCell>
                        <TableCell className="space-x-2 text-sm">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingBook(book)
                              setShowForm(true)
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteBook.mutate(book.id)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            Delete
                          </Button>
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
            <SheetContent className="w-full sm:max-w-xl px-4">
              <SheetHeader>
                <SheetTitle>
                  {editingBook ? 'Edit book' : 'Add book'}
                </SheetTitle>
                <SheetDescription>
                  Manage title, slug, pricing, stock, and visibility.
                </SheetDescription>
              </SheetHeader>
              <div className="pt-4">
                <BookForm
                  initial={editingBook ?? undefined}
                  submitting={upsertBook.isPending}
                  onSubmit={async (vals) => {
                    await upsertBook.mutateAsync({
                      ...vals,
                      id: editingBook?.id,
                    })
                  }}
                  onCancel={() => {
                    setShowForm(false)
                    setEditingBook(null)
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
