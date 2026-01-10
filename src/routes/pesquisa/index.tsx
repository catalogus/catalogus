import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import Header from '../../components/Header'
import {
  AuthorResultCard,
  BookResultCard,
  PostResultCard,
  type SearchAuthor,
  type SearchBook,
  type SearchPost,
} from '../../components/search/SearchResultCards'
import { buildSearchOrFilter, normalizeSearchTerm } from '../../lib/searchHelpers'
import { supabase } from '../../lib/supabaseClient'

export const Route = createFileRoute('/pesquisa/')({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === 'string' ? search.q : undefined,
  }),
  component: SearchResultsPage,
})

type SearchResults = {
  books: SearchBook[]
  authors: SearchAuthor[]
  posts: SearchPost[]
}

function SearchResultsPage() {
  const { q } = Route.useSearch()
  const query = normalizeSearchTerm(q)
  const authorTokens = query.split(/\s+/).filter(Boolean)

  const resultsQuery = useQuery({
    queryKey: ['search', query],
    queryFn: async (): Promise<SearchResults> => {
      if (!query) {
        return { books: [], authors: [], posts: [] }
      }

      const booksQuery = supabase
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

      let authorsQuery = supabase
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
          province
        `,
        )
        .order('name', { ascending: true })
        .limit(6)

      if (authorTokens.length > 0) {
        authorTokens.forEach((token) => {
          const trimmedToken =
            token.length >= 4 ? token.slice(0, token.length - 1) : token
          authorsQuery = authorsQuery.ilike('name', `%${trimmedToken}%`)
        })
      }

      const postsQuery = supabase
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
        authors: (authorsResult.data ?? []) as SearchAuthor[],
        posts: (postsResult.data ?? []) as SearchPost[],
      }
    },
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
      title: 'Livros',
      count: books.length,
      content: books.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {books.map((book) => (
            <BookResultCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600">
          Nenhum livro encontrado.
        </div>
      ),
    },
    {
      key: 'authors',
      title: 'Autores',
      count: authors.length,
      content: authors.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {authors.map((author) => (
            <AuthorResultCard key={author.id} author={author} />
          ))}
        </div>
      ) : (
        <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600">
          Nenhum autor encontrado.
        </div>
      ),
    },
    {
      key: 'posts',
      title: 'Noticias',
      count: posts.length,
      content: posts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {posts.map((post) => (
            <PostResultCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600">
          Nenhum post encontrado.
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
            Pesquisa
          </p>
          <h1 className="mt-3 text-3xl font-semibold md:text-5xl">
            Resultados da pesquisa
          </h1>
          <p className="mt-4 text-base text-white/70">
            {query ? `Resultados para "${query}"` : 'Digite um termo para pesquisar.'}
          </p>
          {query && (
            <p className="mt-2 text-sm uppercase tracking-[0.3em] text-white/50">
              {totalResults} resultados encontrados
            </p>
          )}
        </div>
      </section>

      <main className="py-12">
        <div className="container mx-auto px-4 lg:px-15 space-y-12">
          {!query && (
            <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600">
              Use o botao de pesquisa para procurar livros, autores e noticias.
            </div>
          )}

          {query && resultsQuery.isLoading && (
            <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600">
              A procurar resultados...
            </div>
          )}

          {query && resultsQuery.isError && (
            <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600">
              Nao foi possivel carregar os resultados. Tente novamente.
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
                        {section.count} resultados
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
