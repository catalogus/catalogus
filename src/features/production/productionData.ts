export type GalleryImage = { type: 'image'; src: string; alt: string }
export type GalleryVideo = { type: 'video'; src: string; alt: string }
export type GalleryItem = GalleryImage | GalleryVideo
export type Project = { id: string; title: string; description: string; meta: string[]; gallery?: GalleryItem[] }
export type ProjectTranslation = { id: string; title: string; description: string; meta: string[]; gallery?: 'cidade' | 'suhura' | 'encontro' | 'como' }
export type LightboxState = { items: GalleryItem[]; index: number; title: string }

const cidadeGalleryFiles = ['PAP_6350.webp', 'PAP_6377.webp', '_PAP5469.webp', '_PAP5483.webp', '_PAP5494.webp', '_PAP5500.webp', '_PAP5539.webp', '_PAP5564.webp', '_PAP5580.webp', '_PAP5672.webp', '_PAP5746.webp']
const suhuraGalleryFiles = ['P1100250.webp', 'P1100274.webp', 'P1100295.webp', 'P1100295n.webp']
const encontroGalleryFiles = ['ENCONTRO COM LIVRO_23 DE MARCO10.webp', 'ENCONTRO COM LIVRO_23 DE MARCO11.webp', 'ENCONTRO COM LIVRO_23 DE MARCO14.webp', 'ENCONTRO COM LIVRO_23 DE MARCO19.webp', 'ENCONTRO COM LIVRO_23 DE MARCO2.webp', 'ENCONTRO COM LIVRO_23 DE MARCO22.webp', 'ENCONTRO COM LIVRO_23 DE MARCO6.webp', 'ENCONTRO COM LIVRO_23 DE MARCO8.webp', 'ENCONTRO COM LIVRO_23 DE MARCO9.webp']
const comoGalleryFiles = ['IMG_0232.JPG', 'IMG_0236.JPG', 'IMG_0246.JPG', 'IMG_0257.JPG', 'IMG_0275.JPG', 'IMG_0276.JPG', 'IMG_0277.JPG', 'IMG_0285.JPG', 'IMG_0286.JPG', 'IMG_0291.JPG', 'IMG_0292.JPG', 'IMG_0294.JPG', 'IMG_0295.JPG', 'IMG_0298.JPG', 'IMG_0300.JPG', 'IMG_0301.JPG', 'IMG_0302.JPG', 'IMG_0308.JPG', 'IMG_0311.JPG', 'IMG_0317.JPG', 'IMG_0324.JPG', 'IMG_0326.JPG', 'IMG_0335.JPG', 'IMG_0349.JPG', 'IMG_0354.JPG', 'IMG_0359.JPG', 'WhatsApp Image 2023-09-16 at 14.59.56 (1).jpeg', 'WhatsApp Image 2023-09-16 at 14.59.56.jpeg', 'WhatsApp Image 2023-09-16 at 14.59.57.jpeg']

export const tileLayouts = [
  { className: 'lg:col-span-7 lg:row-span-2', size: 'large' },
  { className: 'lg:col-span-5 lg:row-span-2', size: 'medium' },
  { className: 'lg:col-span-5 lg:row-span-2', size: 'medium' },
  { className: 'lg:col-span-7 lg:row-span-2', size: 'large' },
  { className: 'lg:col-span-6 lg:row-span-2', size: 'small' },
  { className: 'lg:col-span-6 lg:row-span-2', size: 'small' },
]

export const tileGradients = ['from-[#0d0b12] via-[#2c1f3b] to-[#5f4aa8]', 'from-[#1a1613] via-[#4a2f1b] to-[#b36a39]', 'from-[#121417] via-[#27424d] to-[#5d91a2]', 'from-[#141212] via-[#3a262b] to-[#a64d5c]', 'from-[#151312] via-[#3b3328] to-[#7c6a50]', 'from-[#101417] via-[#24323f] to-[#4a6a8a]']
export const tagPalette = ['bg-[#c6f36d] text-black', 'bg-[#ffd166] text-black', 'bg-[#5de2ff] text-black', 'bg-[#ff8fab] text-black', 'bg-[#bdb2ff] text-black', 'bg-[#a6ff8f] text-black', 'bg-[#ffc6ff] text-black']

export const buildProductionMedia = (t: any, i18nLanguage: string) => {
  const cidadeVideoId = 'H0jPe_QwvpY'
  const cidadeVideoBackgroundSrc = `https://www.youtube-nocookie.com/embed/${cidadeVideoId}?autoplay=1&mute=1&loop=1&playlist=${cidadeVideoId}&controls=0&modestbranding=1&playsinline=1&rel=0`
  const cidadeVideoLightboxSrc = `https://www.youtube-nocookie.com/embed/${cidadeVideoId}?autoplay=1&mute=1&loop=1&playlist=${cidadeVideoId}&controls=1&modestbranding=1&playsinline=1&rel=0`
  const cidadeGallery = [{ type: 'video', src: cidadeVideoLightboxSrc, alt: t('production.galleryAlt.cidadeVideo') }, ...cidadeGalleryFiles.map((file, index) => ({ type: 'image', src: `/cidade_nas_maos/${file}`, alt: t('production.galleryAlt.cidade', { index: index + 1 }) }))] as GalleryItem[]
  const suhuraGallery = suhuraGalleryFiles.map((file, index) => ({ type: 'image', src: `/ninguem_matou_suhura/${file}`, alt: t('production.galleryAlt.suhura', { index: index + 1 }) })) as GalleryItem[]
  const encontroGallery = encontroGalleryFiles.map((file, index) => ({ type: 'image', src: encodeURI(`/encontro_com_livro/${file}`), alt: t('production.galleryAlt.encontro', { index: index + 1 }) })) as GalleryItem[]
  const comoGallery = comoGalleryFiles.map((file, index) => ({ type: 'image', src: encodeURI(`/como_uma_gota_de_sal/${file}`), alt: t('production.galleryAlt.como', { index: index + 1 }) })) as GalleryItem[]
  const projects = (t('production.projects', { returnObjects: true }) as ProjectTranslation[]).map((project) => ({
    ...project,
    gallery: project.gallery === 'cidade' ? cidadeGallery : project.gallery === 'suhura' ? suhuraGallery : project.gallery === 'encontro' ? encontroGallery : project.gallery === 'como' ? comoGallery : undefined,
  }))
  return { cidadeVideoBackgroundSrc, projects, key: i18nLanguage }
}
