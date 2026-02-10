import type { ProcessingProgress, TableOfContentsItem } from '../types/publication'
import pdfWorkerSrc from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url'

type PdfjsModule = typeof import('pdfjs-dist/legacy/build/pdf.mjs')

let pdfjsPromise: Promise<PdfjsModule> | null = null
let workerConfigured = false

const getPdfjs = async (): Promise<PdfjsModule> => {
  if (typeof window === 'undefined') {
    throw new Error('PDF processing requires a browser environment.')
  }

  if (!pdfjsPromise) {
    pdfjsPromise = import('pdfjs-dist/legacy/build/pdf.mjs')
  }

  const pdfjs = await pdfjsPromise
  if (!workerConfigured) {
    pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc
    workerConfigured = true
  }

  return pdfjs
}

export type PdfProcessingCallbacks = {
  onProgress: (progress: ProcessingProgress) => void
}

export type RenderedPage = {
  pageNumber: number
  imageDataUrl: string
  thumbnailDataUrl: string
  width: number
  height: number
}

export async function getPdfPageCount(pdfUrl: string): Promise<number> {
  const pdfjs = await getPdfjs()
  const pdf = await pdfjs.getDocument(pdfUrl).promise
  return pdf.numPages
}

export async function extractPdfOutline(
  pdfUrl: string
): Promise<TableOfContentsItem[]> {
  try {
    const pdfjs = await getPdfjs()
    const pdf = await pdfjs.getDocument(pdfUrl).promise
    const outline = await pdf.getOutline()

    if (!outline) return []

    const items: TableOfContentsItem[] = []

    const processItems = async (
      outlineItems: any[],
      level: number
    ): Promise<void> => {
      for (const item of outlineItems) {
        let pageNumber = 1

        try {
          if (item.dest) {
            if (typeof item.dest === 'string') {
              const dest = await pdf.getDestination(item.dest)
              if (dest && dest[0]) {
                pageNumber = (await pdf.getPageIndex(dest[0])) + 1
              }
            } else if (Array.isArray(item.dest) && item.dest[0]) {
              pageNumber = (await pdf.getPageIndex(item.dest[0])) + 1
            }
          }
        } catch {
          // Keep default pageNumber if extraction fails
        }

        items.push({
          title: item.title,
          pageNumber,
          level,
        })

        if (item.items?.length) {
          await processItems(item.items, level + 1)
        }
      }
    }

    await processItems(outline, 0)
    return items
  } catch {
    return []
  }
}

export async function renderPdfPage(
  pdfUrl: string,
  pageNumber: number,
  scale: number = 2
): Promise<{ imageDataUrl: string; width: number; height: number }> {
  const pdfjs = await getPdfjs()
  const pdf = await pdfjs.getDocument(pdfUrl).promise
  const page = await pdf.getPage(pageNumber)

  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  canvas.width = viewport.width
  canvas.height = viewport.height

  await (page.render({
    canvasContext: ctx,
    viewport,
  } as any)).promise

  const imageDataUrl = canvas.toDataURL('image/webp', 0.85)

  return {
    imageDataUrl,
    width: canvas.width,
    height: canvas.height,
  }
}

export async function renderPdfThumbnail(
  pdfUrl: string,
  pageNumber: number,
  maxWidth: number = 150
): Promise<string> {
  const pdfjs = await getPdfjs()
  const pdf = await pdfjs.getDocument(pdfUrl).promise
  const page = await pdf.getPage(pageNumber)

  // Calculate scale based on maxWidth
  const originalViewport = page.getViewport({ scale: 1 })
  const scale = maxWidth / originalViewport.width
  const viewport = page.getViewport({ scale })

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  canvas.width = viewport.width
  canvas.height = viewport.height

  await (page.render({
    canvasContext: ctx,
    viewport,
  } as any)).promise

  return canvas.toDataURL('image/webp', 0.7)
}

export async function* renderAllPages(
  pdfUrl: string,
  callbacks: PdfProcessingCallbacks
): AsyncGenerator<RenderedPage> {
  const pdfjs = await getPdfjs()
  const pdf = await pdfjs.getDocument(pdfUrl).promise
  const totalPages = pdf.numPages

  callbacks.onProgress({
    status: 'rendering',
    currentPage: 0,
    totalPages,
  })

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    callbacks.onProgress({
      status: 'rendering',
      currentPage: pageNum,
      totalPages,
    })

    const page = await pdf.getPage(pageNum)

    // Render full-size page
    const fullViewport = page.getViewport({ scale: 2 })
    const fullCanvas = document.createElement('canvas')
    const fullCtx = fullCanvas.getContext('2d')!
    fullCanvas.width = fullViewport.width
    fullCanvas.height = fullViewport.height

    await (page.render({
      canvasContext: fullCtx,
      viewport: fullViewport,
    } as any)).promise

    const imageDataUrl = fullCanvas.toDataURL('image/webp', 0.85)

    // Render thumbnail
    const thumbScale = 150 / page.getViewport({ scale: 1 }).width
    const thumbViewport = page.getViewport({ scale: thumbScale })
    const thumbCanvas = document.createElement('canvas')
    const thumbCtx = thumbCanvas.getContext('2d')!
    thumbCanvas.width = thumbViewport.width
    thumbCanvas.height = thumbViewport.height

    await (page.render({
      canvasContext: thumbCtx,
      viewport: thumbViewport,
    } as any)).promise

    const thumbnailDataUrl = thumbCanvas.toDataURL('image/webp', 0.7)

    yield {
      pageNumber: pageNum,
      imageDataUrl,
      thumbnailDataUrl,
      width: fullCanvas.width,
      height: fullCanvas.height,
    }
  }

  callbacks.onProgress({
    status: 'completed',
    currentPage: totalPages,
    totalPages,
  })
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(',')
  const mimeMatch = header.match(/:(.*?);/)
  const mime = mimeMatch ? mimeMatch[1] : 'image/webp'
  const binary = atob(data)
  const array = new Uint8Array(binary.length)

  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i)
  }

  return new Blob([array], { type: mime })
}
