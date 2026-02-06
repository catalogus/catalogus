import { createFileRoute } from '@tanstack/react-router'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { NewsletterModal } from '../components/NewsletterModal'
import { NewsletterSection } from '../components/NewsletterSection'
import { Hero } from '../components/Hero'
import AboutSection from '../components/home/AboutSection'
import FeaturedBooksSection from '../components/home/FeaturedBooksSection'
import FeaturedAuthorsSection from '../components/home/FeaturedAuthorsSection'
import NewsSection from '../components/home/NewsSection'
import PartnersSection from '../components/home/PartnersSection'
import { publicSupabase } from '../lib/supabasePublic'
import { SEO_DEFAULTS, buildSeo } from '../lib/seo'
import type { HeroSlide, HeroSlideWithContent } from '../types/hero'

type FeaturedBook = {
  id: string
  title: string
  slug: string | null
  price_mzn: number | null
  is_digital?: boolean | null
  digital_access?: 'paid' | 'free' | null
  promo_type?: 'promocao' | 'pre-venda' | null
  promo_price_mzn?: number | null
  promo_start_date?: string | null
  promo_end_date?: string | null
  promo_is_active?: boolean | null
  effective_price_mzn?: number | null
  description: string | null
  seo_description: string | null
  cover_url: string | null
  cover_path: string | null
}

type FeaturedAuthor = {
  id: string
  wp_slug: string | null
  name: string
  author_type: string | null
  photo_url: string | null
  photo_path: string | null
  social_links?: Record<string, string | null> | null
  claim_status?: 'unclaimed' | 'pending' | 'approved' | 'rejected'
  profile_id?: string | null
  profile?: {
    id: string
    name: string
    photo_url?: string | null
    photo_path?: string | null
    social_links?: Record<string, string | null> | null
  } | null
}

type NewsPost = {
  id: string
  title: string
  slug: string | null
  featured_image_url: string | null
  published_at: string | null
  created_at: string
  categories?: { category?: { name?: string | null; slug?: string | null; name_en?: string | null; slug_en?: string | null } | null }[] | null
}

const resolveCoverUrl = (book: FeaturedBook) => {
  if (book.cover_url) return book.cover_url
  if (!book.cover_path) return null
  return publicSupabase.storage.from('covers').getPublicUrl(book.cover_path).data.publicUrl
}

const resolveAuthorPhotoUrl = (author: FeaturedAuthor) => {
  if (author.photo_url) return author.photo_url
  if (!author.photo_path) return null
  return publicSupabase.storage.from('author-photos').getPublicUrl(author.photo_path).data.publicUrl
}

const mergeAuthorProfile = (author: FeaturedAuthor): FeaturedAuthor => {
  if (author.claim_status === 'approved' && author.profile) {
    return {
      ...author,
      name: author.profile.name || author.name,
      photo_url: author.profile.photo_url || author.photo_url,
      photo_path: author.profile.photo_path || author.photo_path,
      social_links: author.profile.social_links || author.social_links,
    }
  }
  return author
}

const fetchHeroSlides = async () => {
  const { data, error } = await publicSupabase
    .from('hero_slides')
    .select('*')
    .eq('is_active', true)
    .order('order_weight', { ascending: true })
  if (error) throw error
  const slides = (data as HeroSlide[]) ?? []
  const authorIds = Array.from(
    new Set(
      slides
        .filter((slide) => slide.content_type === 'author' && slide.content_id)
        .map((slide) => slide.content_id as string),
    ),
  )
  const bookIds = Array.from(
    new Set(
      slides
        .filter((slide) => slide.content_type === 'book' && slide.content_id)
        .map((slide) => slide.content_id as string),
    ),
  )

  if (authorIds.length === 0 && bookIds.length === 0) {
    return slides as HeroSlideWithContent[]
  }

  const [authorsResult, booksResult] = await Promise.all([
    authorIds.length
      ? publicSupabase
          .from('authors')
          .select('id, name, photo_url, photo_path')
          .in('id', authorIds)
      : Promise.resolve({ data: [], error: null }),
    bookIds.length
      ? publicSupabase
          .from('books')
          .select('id, title, cover_url, cover_path')
          .in('id', bookIds)
      : Promise.resolve({ data: [], error: null }),
  ])

  if (authorsResult.error) throw authorsResult.error
  if (booksResult.error) throw booksResult.error

  const authorMap = new Map(
    (authorsResult.data ?? []).map((author: any) => {
      const resolvedPhotoUrl =
        author.photo_url ||
        (author.photo_path
          ? publicSupabase.storage.from('author-photos').getPublicUrl(author.photo_path)
            .data.publicUrl
          : null)
      return [author.id, { ...author, photo_url: resolvedPhotoUrl }]
    }),
  )

  const bookMap = new Map(
    (booksResult.data ?? []).map((book: any) => {
      const resolvedCoverUrl =
        book.cover_url ||
        (book.cover_path
          ? publicSupabase.storage.from('covers').getPublicUrl(book.cover_path).data
            .publicUrl
          : null)
      return [book.id, { ...book, cover_url: resolvedCoverUrl }]
    }),
  )

  return slides.map((slide) => {
    if (slide.content_type === 'author' && slide.content_id) {
      return {
        ...slide,
        linked_content: authorMap.get(slide.content_id) ?? null,
      }
    }
    if (slide.content_type === 'book' && slide.content_id) {
      return {
        ...slide,
        linked_content: bookMap.get(slide.content_id) ?? null,
      }
    }
    return slide
  }) as HeroSlideWithContent[]
}

const fetchFeaturedBooks = async () => {
  const { data, error } = await publicSupabase
    .from('books_shop')
    .select(
      'id, title, slug, price_mzn, is_digital, digital_access, promo_type, promo_price_mzn, promo_start_date, promo_end_date, promo_is_active, effective_price_mzn, description, seo_description, cover_url, cover_path, featured, is_active',
    )
    .eq('featured', true)
    .eq('is_active', true)
    .limit(4)
  if (error) throw error
  return ((data ?? []) as FeaturedBook[]).map((book) => ({
    ...book,
    cover_url: resolveCoverUrl(book),
  }))
}

const fetchFeaturedAuthors = async () => {
  const selectFields = `id, wp_slug, name, author_type, photo_url, photo_path, social_links, featured, claim_status, profile_id,
       profile:profiles!authors_profile_id_fkey(id, name, photo_url, photo_path, social_links)`
  const baseQuery = () =>
    publicSupabase
      .from('authors')
      .select(selectFields)
      .order('created_at', { ascending: false })
      .limit(10)

  let result = await baseQuery().eq('featured', true)
  if (result.error) {
    if (result.error?.code === '42703' || /featured/i.test(result.error?.message ?? '')) {
      result = await baseQuery()
    } else {
      throw result.error
    }
  }

  return ((result.data ?? []) as FeaturedAuthor[])
    .map(mergeAuthorProfile)
    .map((author) => ({
      ...author,
      photo_url: resolveAuthorPhotoUrl(author),
    }))
}

const fetchLatestPosts = async (language: 'pt' | 'en') => {
  const { data, error } = await publicSupabase
    .from('posts')
    .select(
      `
      id,
      title,
      slug,
      featured_image_url,
      published_at,
      created_at,
      categories:post_categories_map(category:post_categories(name, slug, name_en, slug_en))
    `,
    )
    .eq('status', 'published')
    .eq('language', language)
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(4)
  if (error) throw error
  return (data ?? []) as NewsPost[]
}

export const Route = createFileRoute('/')({
  loader: async () => {
    const language: 'pt' | 'en' = 'pt'
    const [heroSlides, featuredBooks, featuredAuthors, newsPosts] = await Promise.all([
      fetchHeroSlides(),
      fetchFeaturedBooks(),
      fetchFeaturedAuthors(),
      fetchLatestPosts(language),
    ])
    return { heroSlides, featuredBooks, featuredAuthors, newsPosts, newsLanguage: language }
  },
  head: () =>
    buildSeo({
      title: SEO_DEFAULTS.title,
      description: SEO_DEFAULTS.description,
      image: SEO_DEFAULTS.image,
      path: '/',
      type: 'website',
    }),
  component: Home,
})

function Home() {
  const { heroSlides, featuredBooks, featuredAuthors, newsPosts, newsLanguage } =
    Route.useLoaderData()

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      {heroSlides.length > 0 && <Hero slides={heroSlides} />}
      <main>
        <AboutSection />
        <NewsSection initialPosts={newsPosts} initialLanguage={newsLanguage} />
        <FeaturedBooksSection books={featuredBooks} />
        <FeaturedAuthorsSection authors={featuredAuthors} />
        <PartnersSection />
      </main>
      <NewsletterSection />
      <Footer />
      <NewsletterModal />
    </div>
  )
}
