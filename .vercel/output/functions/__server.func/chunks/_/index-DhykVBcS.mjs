import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { H as Header } from "./Header-B0XvW395.mjs";
import { R as Route$x, s as supabase } from "./router-BiReTygo.mjs";
import "@tanstack/react-router";
import "react";
import "./x.mjs";
import "sonner";
import "@supabase/supabase-js";
import "./server.mjs";
import "node:async_hooks";
import "@tanstack/react-router/ssr/server";
const formatPostDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
};
const stripHtml = (value) => {
  if (!value) return "";
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
};
const buildExcerpt = (value) => {
  const text = stripHtml(value);
  if (!text) return "";
  if (text.length <= 220) return text;
  return `${text.slice(0, 220).trim()}...`;
};
const normalizeCategoryKey = (value) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const categoryBadgeClasses = {
  noticias: "bg-[#c6f36d] text-black",
  eventos: "bg-[#ffd166] text-black",
  cultura: "bg-[#5de2ff] text-black",
  literatura: "bg-[#ff8fab] text-black",
  opiniao: "bg-[#bdb2ff] text-black",
  entrevistas: "bg-[#a6ff8f] text-black",
  lancamentos: "bg-[#ffc6ff] text-black"
};
const getCategoryBadgeClass = (value) => {
  const key = normalizeCategoryKey(value);
  return categoryBadgeClasses[key] ?? "bg-[#c6f36d] text-black";
};
function NewsListingPage() {
  const {
    q,
    categoria,
    tag
  } = Route$x.useSearch();
  const featuredPostQuery = useQuery({
    queryKey: ["news-posts", "featured-spotlight"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("posts").select(`
          id,
          title,
          slug,
          featured_image_url,
          categories:post_categories_map(category:post_categories(name, slug))
        `).eq("status", "published").eq("featured", true);
      if (error) throw error;
      if (!data || data.length === 0) return null;
      const randomIndex = Math.floor(Math.random() * data.length);
      const post = data[randomIndex];
      return {
        ...post,
        categories: post.categories?.map((c) => ({
          category: c.category
        })) ?? []
      };
    },
    staleTime: 6e4
  });
  const postsQuery = useInfiniteQuery({
    queryKey: ["news-posts", "listing", q, categoria, tag, featuredPostQuery.data?.id],
    queryFn: async ({
      pageParam = 1
    }) => {
      let query = supabase.from("posts").select(`
          id,
          title,
          slug,
          excerpt,
          body,
          featured_image_url,
          published_at,
          created_at,
          categories:post_categories_map(category:post_categories(name, slug))
        `).eq("status", "published").order("published_at", {
        ascending: false,
        nullsFirst: false
      }).order("created_at", {
        ascending: false
      });
      if (featuredPostQuery.data?.id) {
        query = query.neq("id", featuredPostQuery.data.id);
      }
      if (q) {
        query = query.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`);
      }
      if (categoria) {
        const {
          data: categoryData
        } = await supabase.from("post_categories").select("id").eq("slug", categoria).maybeSingle();
        if (categoryData) {
          const {
            data: postIds
          } = await supabase.from("post_categories_map").select("post_id").eq("category_id", categoryData.id);
          const ids = postIds?.map((p) => p.post_id) ?? [];
          if (ids.length > 0) {
            query = query.in("id", ids);
          } else {
            return {
              posts: [],
              hasMore: false
            };
          }
        } else {
          return {
            posts: [],
            hasMore: false
          };
        }
      }
      if (tag) {
        const {
          data: tagData
        } = await supabase.from("post_tags").select("id").eq("slug", tag).maybeSingle();
        if (tagData) {
          const {
            data: postIds
          } = await supabase.from("post_tags_map").select("post_id").eq("tag_id", tagData.id);
          const ids = postIds?.map((p) => p.post_id) ?? [];
          if (ids.length > 0) {
            query = query.in("id", ids);
          } else {
            return {
              posts: [],
              hasMore: false
            };
          }
        } else {
          return {
            posts: [],
            hasMore: false
          };
        }
      }
      const from = (pageParam - 1) * 6;
      const to = from + 5;
      const {
        data,
        error
      } = await query.range(from, to);
      if (error) throw error;
      const posts = data?.map((entry) => ({
        ...entry,
        categories: entry.categories?.map((c) => ({
          category: c.category
        })) ?? []
      })) ?? [];
      return {
        posts,
        hasMore: posts.length === 6
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : void 0;
    },
    initialPageParam: 1,
    staleTime: 6e4,
    enabled: featuredPostQuery.isSuccess
    // Wait for featured query
  });
  const allPosts = postsQuery.data?.pages.flatMap((page) => page.posts) ?? [];
  const featuredPost = featuredPostQuery.data;
  const featuredCategory = featuredPost?.categories?.[0]?.category;
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-white text-gray-900", children: [
    /* @__PURE__ */ jsx(Header, {}),
    /* @__PURE__ */ jsxs("section", { className: "relative overflow-hidden bg-[#1c1b1a] text-white", children: [
      featuredPost && featuredPost.featured_image_url && /* @__PURE__ */ jsx("img", { src: featuredPost.featured_image_url, alt: featuredPost.title, className: "absolute inset-0 h-full w-full object-cover" }),
      (!featuredPost || !featuredPost.featured_image_url) && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-[#3d2f23] to-[#0f0c0a]" }),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/10" }),
      /* @__PURE__ */ jsx("div", { className: "relative z-10", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 py-24 lg:px-15", children: /* @__PURE__ */ jsxs("div", { className: "max-w-3xl space-y-5", children: [
        featuredPost && featuredCategory ? /* @__PURE__ */ jsx("span", { className: `${getCategoryBadgeClass(featuredCategory.slug || featuredCategory.name || "")} inline-flex px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] rounded-none`, children: featuredCategory.name }) : /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-[0.4em] text-white/70", children: "Notícias" }),
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold leading-tight md:text-4xl", children: featuredPost ? featuredPost.title : "Notícias" }),
        featuredPost && /* @__PURE__ */ jsx("a", { href: `/noticias/${featuredPost.slug}`, className: "inline-flex items-center gap-2 bg-[color:var(--brand)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#a25a2c]", children: "Ler artigo completo" }),
        (q || categoria || tag) && /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 text-xs uppercase tracking-[0.3em] text-white/70", children: [
          q && /* @__PURE__ */ jsxs("span", { children: [
            'Pesquisa: "',
            q,
            '"'
          ] }),
          categoria && /* @__PURE__ */ jsxs("span", { children: [
            "Categoria: ",
            categoria
          ] }),
          tag && /* @__PURE__ */ jsxs("span", { children: [
            "Tag: ",
            tag
          ] })
        ] })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsx("main", { className: "py-20", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 lg:px-15", children: [
      postsQuery.isLoading && /* @__PURE__ */ jsx("div", { className: "grid gap-6 md:grid-cols-2 xl:grid-cols-3", children: Array.from({
        length: 6
      }).map((_, index) => /* @__PURE__ */ jsx("div", { className: "h-[420px] animate-pulse rounded-none border border-white/10 bg-white/5" }, `skeleton-${index}`)) }),
      postsQuery.isError && /* @__PURE__ */ jsx("div", { className: "rounded-none border border-white/10 bg-white/5 p-6 text-sm text-white/70", children: "Falha ao carregar as notícias. Tente novamente." }),
      !postsQuery.isLoading && !postsQuery.isError && allPosts.length === 0 && /* @__PURE__ */ jsx("div", { className: "rounded-none border border-white/10 bg-white/5 p-6 text-sm text-white/70", children: "Nenhuma notícia encontrada." }),
      !postsQuery.isLoading && !postsQuery.isError && allPosts.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { className: "grid gap-6 md:grid-cols-2 xl:grid-cols-3", children: allPosts.map((post) => {
          const category = post.categories?.[0]?.category;
          const dateLabel = formatPostDate(post.published_at ?? post.created_at);
          const excerpt = post.excerpt?.trim() || buildExcerpt(post.body);
          const categoryClass = category?.slug ? getCategoryBadgeClass(category.slug) : category?.name ? getCategoryBadgeClass(category.name) : "";
          return /* @__PURE__ */ jsxs("a", { href: `/noticias/${post.slug}`, className: "group relative flex min-h-105 flex-col justify-end overflow-hidden rounded-none border border-white/10 bg-white/5 text-left transition-transform hover:-translate-y-1", children: [
            post.featured_image_url ? /* @__PURE__ */ jsx("img", { src: post.featured_image_url, alt: post.title, className: "absolute inset-0 h-full w-full object-cover", loading: "lazy" }) : /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-neutral-700 to-neutral-900" }),
            /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" }),
            category && /* @__PURE__ */ jsx("span", { className: `${categoryClass} absolute left-4 top-4 rounded-none px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]`, children: category.name }),
            /* @__PURE__ */ jsxs("div", { className: "relative z-10 space-y-3 p-6 text-white", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold leading-snug md:text-2xl", children: post.title }),
              excerpt && /* @__PURE__ */ jsx("p", { className: "line-clamp-2 text-sm leading-relaxed text-white/90", children: excerpt }),
              /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-[0.2em] text-white/80", children: dateLabel })
            ] })
          ] }, post.id);
        }) }),
        postsQuery.hasNextPage && /* @__PURE__ */ jsx("div", { className: "mt-12 flex justify-center", children: /* @__PURE__ */ jsx("button", { type: "button", onClick: () => postsQuery.fetchNextPage(), disabled: postsQuery.isFetchingNextPage, className: "rounded-none bg-[color:var(--brand)] px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#a25a2c] disabled:cursor-not-allowed disabled:opacity-50", children: postsQuery.isFetchingNextPage ? "Carregando..." : "Carregar mais" }) }),
        postsQuery.isFetchingNextPage && /* @__PURE__ */ jsx("div", { className: "mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3", children: Array.from({
          length: 6
        }).map((_, index) => /* @__PURE__ */ jsx("div", { className: "h-[420px] animate-pulse rounded-none border border-white/10 bg-white/5" }, `loading-more-${index}`)) })
      ] })
    ] }) })
  ] });
}
export {
  NewsListingPage as component
};
