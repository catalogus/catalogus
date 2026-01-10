import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import Header from '../../components/Header'
import { AuthorCard } from '../../components/author/AuthorCard'
import { supabase } from '../../lib/supabaseClient'
import {
  Globe,
  Linkedin,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  MapPin,
} from 'lucide-react'
import type { SocialLinks } from '../../types/author'

export const Route = createFileRoute('/autores/')({
  component: AutoresListingPage,
})

type AuthorData = {
  id: string
  wp_slug: string | null
  name: string
  author_type: string | null
  bio?: string | null
  photo_url: string | null
  photo_path: string | null
  social_links?: SocialLinks | null
  residence_city?: string | null
  province?: string | null
  claim_status?: 'unclaimed' | 'pending' | 'approved' | 'rejected'
  profile_id?: string | null
  profile?: {
    id: string
    name: string
    photo_url?: string | null
    photo_path?: string | null
    bio?: string | null
    social_links?: SocialLinks | null
  } | null
}

// Helper function to merge profile data when claim is approved
const getMergedAuthorData = (author: AuthorData): AuthorData => {
  if (author.claim_status === 'approved' && author.profile) {
    return {
      ...author,
      name: author.profile.name || author.name,
      photo_url: author.profile.photo_url || author.photo_url,
      photo_path: author.profile.photo_path || author.photo_path,
      bio: author.profile.bio || author.bio,
      social_links: author.profile.social_links || author.social_links,
    }
  }
  return author
}

// Helper function to resolve author photo URL
const resolvePhotoUrl = (
  photoUrl?: string | null,
  photoPath?: string | null,
) => {
  if (photoUrl) return photoUrl
  if (photoPath) {
    return supabase.storage.from('author-photos').getPublicUrl(photoPath).data
      .publicUrl
  }
  return null
}

// Helper function to get social links with icons
const getSocialLinks = (author: AuthorData) => {
  const links = author.social_links ?? {}
  return [
    { key: 'website', href: links.website, icon: Globe, label: 'Website' },
    {
      key: 'linkedin',
      href: links.linkedin,
      icon: Linkedin,
      label: 'LinkedIn',
    },
    {
      key: 'facebook',
      href: links.facebook,
      icon: Facebook,
      label: 'Facebook',
    },
    {
      key: 'instagram',
      href: links.instagram,
      icon: Instagram,
      label: 'Instagram',
    },
    { key: 'twitter', href: links.twitter, icon: Twitter, label: 'Twitter' },
    { key: 'youtube', href: links.youtube, icon: Youtube, label: 'YouTube' },
  ].filter((item) => item.href)
}

function AutoresListingPage() {
  // Query for featured author (hero spotlight)
  const featuredAuthorQuery = useQuery({
    queryKey: ['authors', 'featured-spotlight'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('authors')
        .select(
          `id, wp_slug, name, author_type, bio, photo_url, photo_path, social_links, residence_city, province, claim_status, profile_id,
          profile:profiles!authors_profile_id_fkey(id, name, photo_url, photo_path, bio, social_links)`,
        )
        .eq('featured', true)

      if (error) throw error
      if (!data || data.length === 0) return null

      // Randomly select one featured author for spotlight
      const randomIndex = Math.floor(Math.random() * data.length)
      const author = data[randomIndex] as AuthorData
      return getMergedAuthorData(author)
    },
    staleTime: 60_000,
  })

  // Query for authors grid (with pagination)
  const authorsQuery = useInfiniteQuery({
    queryKey: ['authors', 'listing', featuredAuthorQuery.data?.id],
    queryFn: async ({ pageParam = 1 }) => {
      let query = supabase
        .from('authors')
        .select(
          `id, wp_slug, name, author_type, photo_url, photo_path, social_links, residence_city, province, claim_status, profile_id,
          profile:profiles!authors_profile_id_fkey(id, name, photo_url, photo_path, bio, social_links)`,
        )
        .order('name', { ascending: true })

      // Exclude hero author to avoid duplication
      if (featuredAuthorQuery.data?.id) {
        query = query.neq('id', featuredAuthorQuery.data.id)
      }

      // Pagination: 12 authors per page
      const from = (pageParam - 1) * 12
      const to = from + 11
      const { data, error } = await query.range(from, to)

      if (error) throw error

      return {
        authors: ((data ?? []) as AuthorData[]).map(getMergedAuthorData),
        hasMore: data?.length === 12,
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined
    },
    initialPageParam: 1,
    staleTime: 60_000,
    enabled: featuredAuthorQuery.isSuccess, // Wait for featured query
  })

  const featuredAuthor = featuredAuthorQuery.data
  const heroPhoto = featuredAuthor
    ? resolvePhotoUrl(featuredAuthor.photo_url, featuredAuthor.photo_path)
    : null
  const heroSocialLinks = featuredAuthor ? getSocialLinks(featuredAuthor) : []
  const allAuthors = authorsQuery.data?.pages.flatMap((page) => page.authors) ?? []

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#1c1b1a] text-white">
        {/* Background Photo */}
        {featuredAuthor && heroPhoto && (
          <img
            src={heroPhoto}
            alt={featuredAuthor.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/20" />

        {/* Content */}
        <div className="relative z-10">
          <div className="container mx-auto px-4 py-24 lg:px-15">
            <div className="max-w-3xl space-y-5">
              {/* Label */}
              <p className="text-xs uppercase tracking-[0.4em] text-white/70">
                {featuredAuthor ? 'Autor em destaque' : 'Nossos Autores'}
              </p>

              {/* Name */}
              <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
                {featuredAuthor ? featuredAuthor.name : 'Autores'}
              </h1>

              {/* Author Type */}
              {featuredAuthor?.author_type && (
                <p className="text-base uppercase tracking-[0.3em] text-white/70">
                  {featuredAuthor.author_type}
                </p>
              )}

              {/* Bio Excerpt (if exists and > 50 chars) */}
              {featuredAuthor?.bio && featuredAuthor.bio.length > 50 && (
                <p className="line-clamp-3 text-base leading-relaxed text-white/90">
                  {featuredAuthor.bio.slice(0, 200)}...
                </p>
              )}

              {/* Location Info */}
              {featuredAuthor &&
                (featuredAuthor.residence_city || featuredAuthor.province) && (
                  <div className="flex flex-wrap gap-4 text-sm text-white/80">
                    {featuredAuthor.residence_city && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{featuredAuthor.residence_city}</span>
                      </div>
                    )}
                    {featuredAuthor.province && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{featuredAuthor.province}</span>
                      </div>
                    )}
                  </div>
                )}

              {/* Social Icons */}
              {featuredAuthor && heroSocialLinks.length > 0 && (
                <div className="flex gap-3">
                  {heroSocialLinks.map((item) => {
                    const Icon = item.icon
                    return (
                      <a
                        key={item.key}
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-10 w-10 items-center justify-center border border-white/20 bg-white/10 text-white transition hover:bg-white hover:text-gray-900"
                        aria-label={item.label}
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    )
                  })}
                </div>
              )}

              {/* CTA Button */}
              {featuredAuthor && (
                <a
                  href={`/autor/${featuredAuthor.wp_slug || featuredAuthor.id}`}
                  className="inline-flex items-center gap-2 bg-[color:var(--brand)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#a25a2c]"
                >
                  Ver perfil completo
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="bg-[#f8f4ef] py-20">
        <div className="container mx-auto px-4 lg:px-15">
          {/* Loading State */}
          {authorsQuery.isLoading && (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={`skeleton-${index}`} className="space-y-3">
                  <div className="aspect-[4/5] w-full animate-pulse bg-gray-100" />
                  <div className="h-5 w-2/3 animate-pulse bg-gray-200" />
                  <div className="h-4 w-1/3 animate-pulse bg-gray-100" />
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {authorsQuery.isError && (
            <div className="rounded-none border border-gray-200 bg-white p-6 text-sm text-gray-600">
              Falha ao carregar autores. Tente novamente.
            </div>
          )}

          {/* Empty State */}
          {!authorsQuery.isLoading &&
            !authorsQuery.isError &&
            allAuthors.length === 0 && (
              <div className="rounded-none border border-gray-200 bg-white p-6 text-sm text-gray-600">
                Nenhum autor encontrado.
              </div>
            )}

          {/* Authors Grid */}
          {!authorsQuery.isLoading &&
            !authorsQuery.isError &&
            allAuthors.length > 0 && (
              <>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {allAuthors.map((author) => (
                    <AuthorCard key={author.id} author={author} />
                  ))}
                </div>

                {/* Load More Button */}
                {authorsQuery.hasNextPage && (
                  <div className="mt-12 flex justify-center">
                    <button
                      type="button"
                      onClick={() => authorsQuery.fetchNextPage()}
                      disabled={authorsQuery.isFetchingNextPage}
                      className="rounded-none bg-[color:var(--brand)] px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#a25a2c] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {authorsQuery.isFetchingNextPage
                        ? 'Carregando...'
                        : 'Carregar mais autores'}
                    </button>
                  </div>
                )}

                {/* Loading More Indicator */}
                {authorsQuery.isFetchingNextPage && (
                  <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 12 }).map((_, index) => (
                      <div key={`loading-more-${index}`} className="space-y-3">
                        <div className="aspect-[4/5] w-full animate-pulse bg-gray-100" />
                        <div className="h-5 w-2/3 animate-pulse bg-gray-200" />
                        <div className="h-4 w-1/3 animate-pulse bg-gray-100" />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
        </div>
      </main>
    </div>
  )
}
