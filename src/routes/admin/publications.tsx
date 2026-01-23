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
import {
  PublicationForm,
  type PublicationFormValues,
} from '../../components/admin/publications/PublicationForm'
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
import type { Publication, ProcessingProgress } from '../../types/publication'
import {
  renderAllPages,
  dataUrlToBlob,
  extractPdfOutline,
} from '../../lib/pdfHelpers'

export const Route = createFileRoute('/admin/publications')({
  component: AdminPublicationsPage,
})

function AdminPublicationsPage() {
  const { profile, session, signOut } = useAuth()
  const userName = profile?.name ?? session?.user.email ?? 'Admin'
  const userEmail = session?.user.email ?? ''
  const queryClient = useQueryClient()

  const [showForm, setShowForm] = useState(false)
  const [editingPublication, setEditingPublication] = useState<Publication | null>(null)
  const [detailPublication, setDetailPublication] = useState<Publication | null>(null)
  const [processingProgress, setProcessingProgress] = useState<ProcessingProgress>({
    status: 'idle',
  })

  const publicationsQuery = useQuery({
    queryKey: ['admin', 'publications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('publications')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Publication[]
    },
    staleTime: 30_000,
  })

  const toggleActive = useMutation({
    mutationFn: async (payload: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('publications')
        .update({ is_active: payload.is_active })
        .eq('id', payload.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'publications'] })
      queryClient.invalidateQueries({ queryKey: ['publications'] })
      toast.success('Status actualizado')
    },
    onError: err => toast.error(err.message ?? 'Falha ao actualizar status'),
  })

  const toggleFeatured = useMutation({
    mutationFn: async (payload: { id: string; is_featured: boolean }) => {
      const { error } = await supabase
        .from('publications')
        .update({ is_featured: payload.is_featured })
        .eq('id', payload.id)
      if (error) throw error
    },
    onSuccess: (_data, payload) => {
      setDetailPublication(current =>
        current?.id === payload.id
          ? { ...current, is_featured: payload.is_featured }
          : current
      )
      queryClient.invalidateQueries({ queryKey: ['admin', 'publications'] })
      queryClient.invalidateQueries({ queryKey: ['publications'] })
      toast.success('Destaque actualizado')
    },
    onError: err => toast.error(err.message ?? 'Falha ao actualizar destaque'),
  })

  const upsertPublication = useMutation({
    mutationFn: async (
      payload: PublicationFormValues & { id?: string; pdfFile?: File | null }
    ) => {
      const publicationId =
        payload.id ?? crypto.randomUUID?.() ?? Date.now().toString()

      let pdf_path = ''
      let pdf_url = ''
      let cover_path = ''
      let cover_url = ''
      let page_count = 0

      // If new PDF file, upload and process
      if (payload.pdfFile) {
        setProcessingProgress({ status: 'uploading' })

        // Upload PDF
        const pdfFileName = `${publicationId}/original.pdf`
        const { error: uploadError } = await supabase.storage
          .from('publications')
          .upload(pdfFileName, payload.pdfFile, { upsert: true })

        if (uploadError) throw uploadError

        const { data: pdfUrlData } = supabase.storage
          .from('publications')
          .getPublicUrl(pdfFileName)

        pdf_path = pdfFileName
        pdf_url = pdfUrlData.publicUrl

        setProcessingProgress({ status: 'processing' })

        // Extract TOC if not provided
        let tableOfContents = payload.table_of_contents
        if (!tableOfContents || tableOfContents.length === 0) {
          try {
            tableOfContents = await extractPdfOutline(pdf_url)
          } catch {
            tableOfContents = []
          }
        }

        if (!payload.id) {
          const { error: insertError } = await supabase
            .from('publications')
            .insert({
              id: publicationId,
              title: payload.title,
              slug: payload.slug,
              description: payload.description || null,
              pdf_path,
              pdf_url,
              table_of_contents: tableOfContents,
              display_mode: payload.display_mode,
              page_width: payload.page_width,
              page_height: payload.page_height,
              is_active: payload.is_active,
              is_featured: payload.is_featured,
              publish_date: payload.publish_date || null,
              seo_title: payload.seo_title || null,
              seo_description: payload.seo_description || null,
              created_by: session?.user.id,
              updated_at: new Date().toISOString(),
            })
          if (insertError) throw insertError
        }

        // Delete existing pages for this publication
        await supabase
          .from('publication_pages')
          .delete()
          .eq('publication_id', publicationId)

        // Delete existing page images from storage
        const { data: existingFiles } = await supabase.storage
          .from('publications')
          .list(`${publicationId}/pages`)

        if (existingFiles && existingFiles.length > 0) {
          await supabase.storage
            .from('publications')
            .remove(existingFiles.map(f => `${publicationId}/pages/${f.name}`))
        }

        const { data: existingThumbs } = await supabase.storage
          .from('publications')
          .list(`${publicationId}/thumbnails`)

        if (existingThumbs && existingThumbs.length > 0) {
          await supabase.storage
            .from('publications')
            .remove(existingThumbs.map(f => `${publicationId}/thumbnails/${f.name}`))
        }

        // Render and upload all pages
        const pagesGenerator = renderAllPages(pdf_url, {
          onProgress: setProcessingProgress,
        })

        for await (const renderedPage of pagesGenerator) {
          page_count = renderedPage.pageNumber

          // Upload full-size page image
          const pageFileName = `${publicationId}/pages/page-${String(renderedPage.pageNumber).padStart(3, '0')}.webp`
          const pageBlob = dataUrlToBlob(renderedPage.imageDataUrl)

          const { error: pageUploadError } = await supabase.storage
            .from('publications')
            .upload(pageFileName, pageBlob, {
              contentType: 'image/webp',
              upsert: true,
            })

          if (pageUploadError) {
            console.error('Failed to upload page:', pageUploadError)
            continue
          }

          const { data: pageUrlData } = supabase.storage
            .from('publications')
            .getPublicUrl(pageFileName)

          // Upload thumbnail
          const thumbFileName = `${publicationId}/thumbnails/thumb-${String(renderedPage.pageNumber).padStart(3, '0')}.webp`
          const thumbBlob = dataUrlToBlob(renderedPage.thumbnailDataUrl)

          const { error: thumbUploadError } = await supabase.storage
            .from('publications')
            .upload(thumbFileName, thumbBlob, {
              contentType: 'image/webp',
              upsert: true,
            })

          if (thumbUploadError) {
            console.error('Failed to upload thumbnail:', thumbUploadError)
          }

          const { data: thumbUrlData } = supabase.storage
            .from('publications')
            .getPublicUrl(thumbFileName)

          // Insert page record
          await supabase.from('publication_pages').insert({
            publication_id: publicationId,
            page_number: renderedPage.pageNumber,
            image_path: pageFileName,
            image_url: pageUrlData.publicUrl,
            thumbnail_path: thumbFileName,
            thumbnail_url: thumbUrlData.publicUrl,
            width: renderedPage.width,
            height: renderedPage.height,
          })

          // Use first page as cover
          if (renderedPage.pageNumber === 1) {
            cover_path = pageFileName
            cover_url = pageUrlData.publicUrl
          }
        }

        // Update publication with final metadata
        const publicationData: any = {
          id: publicationId,
          title: payload.title,
          slug: payload.slug,
          description: payload.description || null,
          pdf_path,
          pdf_url,
          cover_path,
          cover_url,
          page_count,
          table_of_contents: tableOfContents,
          display_mode: payload.display_mode,
          page_width: payload.page_width,
          page_height: payload.page_height,
          is_active: payload.is_active,
          is_featured: payload.is_featured,
          publish_date: payload.publish_date || null,
          seo_title: payload.seo_title || null,
          seo_description: payload.seo_description || null,
          updated_at: new Date().toISOString(),
        }

        const { error } = await supabase
          .from('publications')
          .update(publicationData)
          .eq('id', publicationId)
        if (error) throw error
      } else {
        // Just update metadata, no new PDF
        const updateData: any = {
          title: payload.title,
          slug: payload.slug,
          description: payload.description || null,
          table_of_contents: payload.table_of_contents,
          display_mode: payload.display_mode,
          page_width: payload.page_width,
          page_height: payload.page_height,
          is_active: payload.is_active,
          is_featured: payload.is_featured,
          publish_date: payload.publish_date || null,
          seo_title: payload.seo_title || null,
          seo_description: payload.seo_description || null,
          updated_at: new Date().toISOString(),
        }

        const { error } = await supabase
          .from('publications')
          .update(updateData)
          .eq('id', payload.id)

        if (error) throw error
      }

      setProcessingProgress({ status: 'completed' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'publications'] })
      queryClient.invalidateQueries({ queryKey: ['publications'] })
      setShowForm(false)
      setEditingPublication(null)
      setProcessingProgress({ status: 'idle' })
      toast.success('Publicação guardada')
    },
    onError: err => {
      setProcessingProgress({ status: 'error', error: err.message })
      toast.error(err.message ?? 'Falha ao guardar publicação')
    },
  })

  const deletePublication = useMutation({
    mutationFn: async (id: string) => {
      // Delete storage files
      const { data: files } = await supabase.storage
        .from('publications')
        .list(id)

      if (files && files.length > 0) {
        // This is a folder, need to delete recursively
        const { data: pages } = await supabase.storage
          .from('publications')
          .list(`${id}/pages`)

        if (pages) {
          await supabase.storage
            .from('publications')
            .remove(pages.map(f => `${id}/pages/${f.name}`))
        }

        const { data: thumbs } = await supabase.storage
          .from('publications')
          .list(`${id}/thumbnails`)

        if (thumbs) {
          await supabase.storage
            .from('publications')
            .remove(thumbs.map(f => `${id}/thumbnails/${f.name}`))
        }

        await supabase.storage
          .from('publications')
          .remove(files.map(f => `${id}/${f.name}`))
      }

      // Delete database record (pages will cascade)
      const { error } = await supabase.from('publications').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'publications'] })
      queryClient.invalidateQueries({ queryKey: ['publications'] })
      toast.success('Publicação eliminada')
    },
    onError: err => toast.error(err.message ?? 'Falha ao eliminar publicação'),
  })

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—'
    const date = new Date(dateStr)
    if (Number.isNaN(date.getTime())) return '—'
    return date.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
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
              <p className="text-sm uppercase text-gray-500">Biblioteca Digital</p>
              <h1 className="text-2xl font-semibold text-gray-900">Publicações</h1>
            </div>
            <Button
              onClick={() => {
                setEditingPublication(null)
                setShowForm(true)
              }}
            >
              Adicionar publicação
            </Button>
          </div>

          <div className="rounded-2xl border border-gray-200 p-4 bg-white">
            {publicationsQuery.isLoading ? (
              <p className="text-sm text-gray-500">A carregar publicações...</p>
            ) : publicationsQuery.isError ? (
              <p className="text-sm text-rose-600">
                Falha ao carregar publicações. Verifique a conexão ou permissões.
              </p>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Capa</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Páginas</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acções</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {publicationsQuery.data?.map(pub => (
                      <TableRow
                        key={pub.id}
                        className="align-middle cursor-pointer hover:bg-gray-50"
                        onClick={() => setDetailPublication(pub)}
                      >
                        <TableCell>
                          {pub.cover_url ? (
                            <img
                              src={pub.cover_url}
                              alt={pub.title}
                              className="h-16 w-12 object-cover rounded border border-gray-200"
                            />
                          ) : (
                            <div className="h-16 w-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                              <svg
                                className="h-6 w-6 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1}
                                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                />
                              </svg>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{pub.title}</p>
                            <p className="text-xs text-gray-500">/publicacoes/{pub.slug}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {pub.page_count ?? '—'}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {formatDate(pub.publish_date)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {pub.is_active ? (
                              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                Activo
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                Inactivo
                              </span>
                            )}
                            {pub.is_featured && (
                              <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                                Destaque
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onMouseDown={e => e.stopPropagation()}
                                onClickCapture={e => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              onClick={e => e.stopPropagation()}
                            >
                              <DropdownMenuLabel>Acções</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  window.open(`/publicacoes/${pub.slug}`, '_blank')
                                }
                              >
                                Ver publicação
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingPublication(pub)
                                  setShowForm(true)
                                }}
                              >
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  toggleFeatured.mutate({
                                    id: pub.id,
                                    is_featured: !pub.is_featured,
                                  })
                                }
                              >
                                {pub.is_featured
                                  ? 'Remover destaque'
                                  : 'Marcar como destaque'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  toggleActive.mutate({
                                    id: pub.id,
                                    is_active: !pub.is_active,
                                  })
                                }
                              >
                                {pub.is_active ? 'Desactivar' : 'Activar'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => deletePublication.mutate(pub.id)}
                              >
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  {publicationsQuery.data?.length === 0 && (
                    <TableCaption>Nenhuma publicação ainda.</TableCaption>
                  )}
                </Table>
              </div>
            )}
          </div>

          {/* Form Sheet */}
          <Sheet open={showForm} onOpenChange={setShowForm}>
            <SheetContent className="w-full sm:max-w-xl px-4 overflow-hidden">
              <SheetHeader>
                <SheetTitle>
                  {editingPublication ? 'Editar publicação' : 'Nova publicação'}
                </SheetTitle>
                <SheetDescription>
                  Carregue um PDF e configure as opções de visualização.
                </SheetDescription>
              </SheetHeader>
              <div className="pt-4 max-h-[80vh] overflow-y-auto pr-2 space-y-4">
                <PublicationForm
                  initial={
                    editingPublication
                      ? {
                          title: editingPublication.title,
                          slug: editingPublication.slug,
                          description: editingPublication.description ?? '',
                          display_mode: editingPublication.display_mode,
                          page_width: editingPublication.page_width,
                          page_height: editingPublication.page_height,
                          is_active: editingPublication.is_active,
                          is_featured: editingPublication.is_featured,
                          publish_date: editingPublication.publish_date ?? '',
                          seo_title: editingPublication.seo_title ?? '',
                          seo_description: editingPublication.seo_description ?? '',
                          table_of_contents:
                            editingPublication.table_of_contents ?? [],
                          pdf_path: editingPublication.pdf_path,
                          pdf_url: editingPublication.pdf_url ?? undefined,
                          cover_url: editingPublication.cover_url ?? undefined,
                        }
                      : undefined
                  }
                  submitting={upsertPublication.isPending}
                  processingProgress={processingProgress}
                  onSubmit={async (vals, pdfFile) => {
                    await upsertPublication.mutateAsync({
                      ...vals,
                      id: editingPublication?.id,
                      pdfFile,
                    })
                  }}
                  onCancel={() => {
                    setShowForm(false)
                    setEditingPublication(null)
                    setProcessingProgress({ status: 'idle' })
                  }}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Detail Dialog */}
          <Dialog
            open={!!detailPublication}
            onOpenChange={() => setDetailPublication(null)}
          >
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>
                  {detailPublication?.title ?? 'Detalhes da publicação'}
                </DialogTitle>
                <DialogDescription>
                  {detailPublication?.seo_description ??
                    detailPublication?.description ??
                    'Detalhes da publicação'}
                </DialogDescription>
              </DialogHeader>
              {detailPublication && (
                <div className="space-y-4">
                  {detailPublication.cover_url && (
                    <img
                      src={detailPublication.cover_url}
                      alt={detailPublication.title}
                      className="w-full max-h-64 rounded-xl object-contain border border-gray-200 bg-gray-50"
                    />
                  )}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Páginas</p>
                      <p className="font-semibold text-gray-900">
                        {detailPublication.page_count ?? '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Modo de exibição</p>
                      <p className="font-semibold text-gray-900">
                        {detailPublication.display_mode === 'double'
                          ? 'Página dupla'
                          : 'Página única'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Data de publicação</p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(detailPublication.publish_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Estado</p>
                      <p className="font-semibold text-gray-900">
                        {detailPublication.is_active ? 'Activo' : 'Inactivo'}
                      </p>
                    </div>
                  </div>
                  {detailPublication.description && (
                    <div className="space-y-1">
                      <p className="text-gray-500 text-sm">Descrição</p>
                      <p className="text-gray-900 whitespace-pre-line">
                        {detailPublication.description}
                      </p>
                    </div>
                  )}
                  <div className="pt-4 border-t">
                    <a
                      href={`/publicacoes/${detailPublication.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
                    >
                      Abrir publicação
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </AdminGuard>
  )
}
