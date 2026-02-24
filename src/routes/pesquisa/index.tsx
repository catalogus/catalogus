import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import Header from '../../components/Header'
import {
  AuthorResultCard,
  BookResultCard,
  PostResultCard,
  type SearchAuthor,
  type SearchBook,
  type SearchPost,
} from '../../components/search/SearchResultCards'
import {
  buildSearchOrFilter,
  buildTokenSearchOrFilter,
  normalizeSearchTerm,
} from '../../lib/searchHelpers'
import { publicSupabase } from '../../lib/supabasePublic'
import { buildSeo } from '../../lib/seo'

const getAuthorData = (author: any): SearchAuthor => author as SearchAuthor

type SearchResults = {
  books: SearchBook[]
  authors: SearchAuthor[]
  posts: SearchPost[]
}

const fetchSearchResults = async (
  query: string,
  language: 'pt' | 'en',
): Promise<SearchResults> => {
  if (!query) {
    return { books: [], authors: [], posts: [] }
  }

  const booksQuery = publicSupabase
    .from('books')
    .select(
      `
          id,
          title,
          slug,
          price_mzn,
          cover_url,
          cover_path,
          description,
          seo_description,
          authors:authors_books(author:authors(id, name, wp_slug))
        `,
    )
    .eq('is_active', true)
    .or(buildSearchOrFilter(['title', 'description', 'seo_description'], query))
    .order('created_at', { ascending: false })
    .limit(6)

  let authorsQuery = publicSupabase
    .from('authors')
    .select(
      `
          id,
          name,
          wp_slug,
          author_type,
          photo_url,
          photo_path,
          social_links,
          residence_city,
          province,
          claim_status,
          profile_id
        `,
    )
    .order('name', { ascending: true })
    .limit(6)

  const authorNameFilter = buildTokenSearchOrFilter('name', query)
  if (authorNameFilter) {
    authorsQuery = authorsQuery.or(authorNameFilter)
  }

  const postsQuery = publicSupabase
    .from('posts')
    .select(
      `
          id,
          title,
          slug,
          excerpt,
          featured_image_url,
          published_at,
          created_at
        `,
    )
    .eq('status', 'published')
    .eq('language', language)
    .or(buildSearchOrFilter(['title', 'excerpt'], query))
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(6)

  const [booksResult, authorsResult, postsResult] = await Promise.all([
    booksQuery,
    authorsQuery,
    postsQuery,
  ])

  if (booksResult.error) throw booksResult.error
  if (authorsResult.error) throw authorsResult.error
  if (postsResult.error) throw postsResult.error

  return {
    books: (booksResult.data ?? []) as SearchBook[],
    authors: (authorsResult.data ?? []).map(getAuthorData),
    posts: (postsResult.data ?? []) as SearchPost[],
  }
}

export const Route = createFileRoute('/pesquisa/')({
  validateSearch: (search?: Record<string, unknown>) => {
    const safeSearch = search ?? {}
    return {
      q: typeof safeSearch.q === 'string' ? safeSearch.q : undefined,
    }
  },
  loader: async ({ search }) => {
    const safeSearch = search ?? {}
    const query = normalizeSearchTerm(safeSearch.q as string | undefined)
    const language: 'pt' | 'en' = 'pt'

    if (!query) {
      return { results: { books: [], authors: [], posts: [] }, query, language }
    }

    return {
      results: await fetchSearchResults(query, language),
      query,
      language,
    }
  },
  head: () =>
    buildSeo({
      title: 'Pesquisa',
      description: 'Resultados de pesquisa na Catalogus.',
      path: '/pesquisa',
      noindex: true,
    }),
  component: SearchResultsPage,
})

function SearchResultsPage() {
  const { t, i18n } = useTranslation()
  const { q } = Route.useSearch()
  const loaderData = Route.useLoaderData()
  const query = normalizeSearchTerm(q)
  const language = i18n.language === 'en' ? 'en' : 'pt'
  const initialData = loaderData.language === language ? loaderData.results : undefined

  const resultsQuery = useQuery({
    queryKey: ['search', query, language],
    queryFn: async (): Promise<SearchResults> => fetchSearchResults(query, language),
    initialData,
    enabled: query.length > 0,
    staleTime: 60_000,
  })

  const books = resultsQuery.data?.books ?? []
  const authors = resultsQuery.data?.authors ?? []
  const posts = resultsQuery.data?.posts ?? []
  const totalResults = books.length + authors.length + posts.length
  const sections = [
    {
      key: 'books',
      title: t('searchPage.sections.books'),
      count: books.length,
      content: books.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {books.map((book) => (
            <BookResultCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600">
          {t('searchPage.sections.emptyBooks')}
        </div>
      ),
    },
    {
      key: 'authors',
      title: t('searchPage.sections.authors'),
      count: authors.length,
      content: authors.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {authors.map((author) => (
            <AuthorResultCard key={author.id} author={author} />
          ))}
        </div>
      ) : (
        <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600">
          {t('searchPage.sections.emptyAuthors')}
        </div>
      ),
    },
    {
      key: 'posts',
      title: t('searchPage.sections.posts'),
      count: posts.length,
      content: posts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {posts.map((post) => (
            <PostResultCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600">
          {t('searchPage.sections.emptyPosts')}
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />

      <section className="bg-[#1c1b1a] text-white">
        <div className="container mx-auto px-4 py-16 lg:px-15">
          <p className="text-xs uppercase tracking-[0.35em] text-white/60">
            {t('searchPage.hero.label')}
          </p>
          <h1 className="mt-3 text-3xl font-semibold md:text-5xl">
            {t('searchPage.hero.title')}
          </h1>
          <p className="mt-4 text-base text-white/70">
            {query
              ? t('searchPage.hero.resultsFor', { query })
              : t('searchPage.hero.prompt')}
          </p>
          {query && (
            <p className="mt-2 text-sm uppercase tracking-[0.3em] text-white/50">
              {t('searchPage.hero.count', { count: totalResults })}
            </p>
          )}
        </div>
      </section>

      <main className="py-12">
        <div className="container mx-auto px-4 lg:px-15 space-y-12">
          {!query && (
            <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600">
              {t('searchPage.empty')}
            </div>
          )}

          {query && resultsQuery.isLoading && (
            <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600">
              {t('searchPage.loading')}
            </div>
          )}

          {query && resultsQuery.isError && (
            <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600">
              {t('searchPage.error')}
            </div>
          )}

          {query && !resultsQuery.isLoading && !resultsQuery.isError && (
            <>
              {sections
                .slice()
                .sort((a, b) => Number(b.count > 0) - Number(a.count > 0))
                .map((section) => (
                  <section key={section.key} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-semibold text-gray-900">
                        {section.title}
                      </h2>
                      <span className="text-sm text-gray-500">
                        {t('searchPage.sections.count', { count: section.count })}
                      </span>
                    </div>
                    {section.content}
                  </section>
                ))}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
