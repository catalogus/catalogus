import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { H as Header } from "./Header-B0XvW395.mjs";
import { j as Route$p, s as supabase } from "./router-BiReTygo.mjs";
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
const SidebarCard = ({
  title,
  children
}) => /* @__PURE__ */ jsxs("div", { className: "border border-gray-200 bg-white p-6 rounded-none", children: [
  /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-gray-600", children: title }),
  /* @__PURE__ */ jsx("div", { className: "mt-4", children })
] });
function NewsPostDetailPage() {
  const {
    slug
  } = Route$p.useParams();
  const postQuery = useQuery({
    queryKey: ["news-post", slug],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("posts").select(`
          id,
          title,
          slug,
          excerpt,
          body,
          featured_image_url,
          published_at,
          created_at,
          author_id,
          view_count,
          categories:post_categories_map(category:post_categories(id, name, slug)),
          tags:post_tags_map(tag:post_tags(id, name, slug))
        `).eq("status", "published").eq("slug", slug).maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const categories = data.categories?.map((entry) => entry.category).filter(Boolean) ?? [];
      const tags = data.tags?.map((entry) => entry.tag).filter(Boolean) ?? [];
      let author = null;
      if (data.author_id) {
        const {
          data: profile,
          error: profileError
        } = await supabase.from("profiles").select("id, name, email, photo_url").eq("id", data.author_id).maybeSingle();
        if (!profileError) {
          author = profile;
        }
      }
      return {
        ...data,
        categories,
        tags,
        author
      };
    },
    staleTime: 6e4
  });
  const tagsQuery = useQuery({
    queryKey: ["post-tags", "public"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("post_tags").select("id, name, slug").eq("is_active", true).order("name", {
        ascending: true
      }).limit(12);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 6e4
  });
  const recentPostsQuery = useQuery({
    queryKey: ["news-posts", "recent"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("posts").select("id, title, slug, featured_image_url, published_at, created_at").eq("status", "published").order("published_at", {
        ascending: false,
        nullsFirst: false
      }).order("created_at", {
        ascending: false
      }).limit(4);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 6e4
  });
  const post = postQuery.data;
  const categoryIds = post?.categories?.map((category) => category.id) ?? [];
  const tagIds = post?.tags?.map((tag) => tag.id) ?? [];
  const relatedPostsQuery = useQuery({
    queryKey: ["news-post", slug, "related", categoryIds.join(","), tagIds.join(",")],
    enabled: Boolean(post && (categoryIds.length || tagIds.length)),
    queryFn: async () => {
      if (!post) return [];
      const relatedIds = /* @__PURE__ */ new Set();
      if (categoryIds.length > 0) {
        const {
          data: data2,
          error: error2
        } = await supabase.from("post_categories_map").select("post_id").in("category_id", categoryIds);
        if (error2) throw error2;
        data2?.forEach((entry) => relatedIds.add(entry.post_id));
      }
      if (tagIds.length > 0) {
        const {
          data: data2,
          error: error2
        } = await supabase.from("post_tags_map").select("post_id").in("tag_id", tagIds);
        if (error2) throw error2;
        data2?.forEach((entry) => relatedIds.add(entry.post_id));
      }
      relatedIds.delete(post.id);
      const relatedList = Array.from(relatedIds);
      if (relatedList.length === 0) return [];
      const {
        data,
        error
      } = await supabase.from("posts").select(`
          id,
          title,
          slug,
          featured_image_url,
          published_at,
          created_at,
          categories:post_categories_map(category:post_categories(name, slug))
        `).eq("status", "published").in("id", relatedList).order("published_at", {
        ascending: false,
        nullsFirst: false
      }).order("created_at", {
        ascending: false
      }).limit(3);
      if (error) throw error;
      return (data ?? []).map((entry) => ({
        ...entry,
        categories: entry.categories?.map((categoryEntry) => categoryEntry.category).filter(Boolean) ?? []
      }));
    },
    staleTime: 6e4
  });
  const primaryCategory = post?.categories?.[0];
  const featuredImage = post?.featured_image_url;
  const dateLabel = formatPostDate(post?.published_at ?? post?.created_at ?? null);
  const excerpt = post?.excerpt?.trim() || buildExcerpt(post?.body);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-white text-gray-900", children: [
    /* @__PURE__ */ jsx(Header, {}),
    postQuery.isLoading && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("section", { className: "bg-[#1c1b1a] text-white", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 py-24 lg:px-15", children: /* @__PURE__ */ jsxs("div", { className: "max-w-3xl space-y-4", children: [
        /* @__PURE__ */ jsx("div", { className: "h-4 w-32 bg-white/30 animate-pulse" }),
        /* @__PURE__ */ jsx("div", { className: "h-10 w-full bg-white/20 animate-pulse" }),
        /* @__PURE__ */ jsx("div", { className: "h-4 w-1/2 bg-white/20 animate-pulse" })
      ] }) }) }),
      /* @__PURE__ */ jsx("main", { className: "py-20", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 lg:px-15", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-12 lg:grid-cols-[1fr_320px]", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsx("div", { className: "h-4 w-1/3 bg-gray-200 animate-pulse" }),
          /* @__PURE__ */ jsx("div", { className: "h-4 w-full bg-gray-200 animate-pulse" }),
          /* @__PURE__ */ jsx("div", { className: "h-4 w-5/6 bg-gray-200 animate-pulse" }),
          /* @__PURE__ */ jsx("div", { className: "h-4 w-4/6 bg-gray-200 animate-pulse" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsx("div", { className: "h-24 bg-gray-200 animate-pulse" }),
          /* @__PURE__ */ jsx("div", { className: "h-32 bg-gray-200 animate-pulse" })
        ] })
      ] }) }) })
    ] }),
    postQuery.isError && /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 py-24 lg:px-15", children: /* @__PURE__ */ jsx("div", { className: "border border-gray-200 bg-white p-6 text-sm text-gray-600 rounded-none", children: "Falha ao carregar esta noticia. Tente novamente." }) }),
    !postQuery.isLoading && !postQuery.isError && !post && /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 py-24 lg:px-15", children: /* @__PURE__ */ jsx("div", { className: "border border-gray-200 bg-white p-6 text-sm text-gray-600 rounded-none", children: "Noticia nao encontrada." }) }),
    !postQuery.isLoading && !postQuery.isError && post && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("section", { className: "relative overflow-hidden bg-[#1c1b1a] text-white", children: [
        featuredImage ? /* @__PURE__ */ jsx("img", { src: featuredImage, alt: post.title, className: "absolute inset-0 h-full w-full object-cover" }) : /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-[#3d2f23] to-[#0f0c0a]" }),
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/10" }),
        /* @__PURE__ */ jsx("div", { className: "relative z-10", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 py-24 lg:px-15", children: /* @__PURE__ */ jsxs("div", { className: "max-w-3xl space-y-5", children: [
          primaryCategory && /* @__PURE__ */ jsx("span", { className: `${getCategoryBadgeClass(primaryCategory.slug || primaryCategory.name)} inline-flex px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] rounded-none`, children: primaryCategory.name }),
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold leading-tight md:text-4xl", children: post.title }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.3em] text-white/70", children: [
            dateLabel && /* @__PURE__ */ jsx("span", { children: dateLabel }),
            post.author?.name && /* @__PURE__ */ jsx("span", { children: post.author.name })
          ] })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsx("main", { className: "py-20", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 lg:px-15", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-12 lg:grid-cols-[1fr_320px]", children: [
        /* @__PURE__ */ jsxs("article", { className: "space-y-10", children: [
          excerpt && /* @__PURE__ */ jsx("p", { className: "text-lg leading-relaxed text-gray-700", children: excerpt }),
          post.body ? /* @__PURE__ */ jsx("div", { className: "post-content text-gray-700", dangerouslySetInnerHTML: {
            __html: post.body
          } }) : /* @__PURE__ */ jsx("div", { className: "border border-gray-200 bg-white p-6 text-sm text-gray-600 rounded-none", children: "Este post ainda nao tem conteudo publicado." }),
          (post.categories?.length || post.tags?.length) && /* @__PURE__ */ jsxs("div", { className: "space-y-4 border-t border-gray-200 pt-6", children: [
            post.categories && post.categories.length > 0 && /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-gray-500", children: "Categorias" }),
              post.categories.map((category) => /* @__PURE__ */ jsx("a", { href: `/noticias?categoria=${category.slug}`, className: "border border-gray-200 px-3 py-1 text-xs uppercase tracking-[0.2em] text-gray-700 transition-colors hover:border-gray-400 rounded-none", children: category.name }, category.id))
            ] }),
            post.tags && post.tags.length > 0 && /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-gray-500", children: "Tags" }),
              post.tags.map((tag) => /* @__PURE__ */ jsx("a", { href: `/noticias?tag=${tag.slug}`, className: "border border-gray-200 px-3 py-1 text-xs uppercase tracking-[0.2em] text-gray-700 transition-colors hover:border-gray-400 rounded-none", children: tag.name }, tag.id))
            ] })
          ] }),
          post.author && /* @__PURE__ */ jsx("div", { className: "border border-gray-200 bg-white p-6 rounded-none", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-center", children: [
            /* @__PURE__ */ jsx("div", { className: "h-16 w-16 overflow-hidden bg-[#f4f1ec]", children: post.author.photo_url ? /* @__PURE__ */ jsx("img", { src: post.author.photo_url, alt: post.author.name ?? "Autor", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsx("div", { className: "flex h-full w-full items-center justify-center text-xl font-semibold text-gray-400", children: (post.author.name ?? "A").charAt(0).toUpperCase() }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-gray-500", children: "Autor" }),
              /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold text-gray-900", children: post.author.name ?? "Equipe" }),
              post.author.email && /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: post.author.email })
            ] })
          ] }) }),
          relatedPostsQuery.isLoading && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsx("div", { className: "h-6 w-48 bg-gray-200 animate-pulse" }),
            /* @__PURE__ */ jsx("div", { className: "grid gap-6 md:grid-cols-2", children: Array.from({
              length: 2
            }).map((_, index) => /* @__PURE__ */ jsx("div", { className: "h-48 bg-gray-200 animate-pulse" }, `related-skeleton-${index}`)) })
          ] }),
          !relatedPostsQuery.isLoading && !relatedPostsQuery.isError && (relatedPostsQuery.data?.length ?? 0) > 0 && /* @__PURE__ */ jsxs("section", { className: "space-y-6", children: [
            /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold text-gray-900", children: "Posts relacionados" }) }),
            /* @__PURE__ */ jsx("div", { className: "grid gap-6 md:grid-cols-2", children: relatedPostsQuery.data?.map((related) => {
              const relatedCategory = related.categories?.[0];
              const relatedCategoryClass = relatedCategory ? getCategoryBadgeClass(relatedCategory.slug || relatedCategory.name) : "";
              const relatedDate = formatPostDate(related.published_at ?? related.created_at);
              return /* @__PURE__ */ jsxs("a", { href: `/noticias/${related.slug}`, className: "group relative flex min-h-56 flex-col justify-end overflow-hidden border border-gray-200 bg-white text-left transition-transform hover:-translate-y-1 rounded-none", children: [
                related.featured_image_url ? /* @__PURE__ */ jsx("img", { src: related.featured_image_url, alt: related.title, className: "absolute inset-0 h-full w-full object-cover", loading: "lazy" }) : /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-[#e6ddd3] to-[#cbbfb4]" }),
                /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" }),
                relatedCategory && /* @__PURE__ */ jsx("span", { className: `${relatedCategoryClass} absolute left-4 top-4 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] rounded-none`, children: relatedCategory.name }),
                /* @__PURE__ */ jsxs("div", { className: "relative z-10 space-y-3 p-6 text-white", children: [
                  /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold leading-snug md:text-xl", children: related.title }),
                  /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-[0.2em] text-white/80", children: relatedDate })
                ] })
              ] }, related.id);
            }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("aside", { className: "space-y-8", children: [
          /* @__PURE__ */ jsx(SidebarCard, { title: "Pesquisar", children: /* @__PURE__ */ jsxs("form", { action: "/noticias", method: "get", className: "flex gap-2", children: [
            /* @__PURE__ */ jsx("input", { type: "search", name: "q", placeholder: "Buscar...", className: "w-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-gray-400 focus:outline-none rounded-none" }),
            /* @__PURE__ */ jsx("button", { type: "submit", className: "bg-[color:var(--brand)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#a25a2c] rounded-none", children: "Ir" })
          ] }) }),
          /* @__PURE__ */ jsxs(SidebarCard, { title: "Noticias recentes", children: [
            recentPostsQuery.isLoading && /* @__PURE__ */ jsx("div", { className: "space-y-3", children: Array.from({
              length: 3
            }).map((_, index) => /* @__PURE__ */ jsx("div", { className: "h-10 w-full bg-gray-200 animate-pulse" }, `recent-skeleton-${index}`)) }),
            recentPostsQuery.isError && /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: "Falha ao carregar noticias." }),
            !recentPostsQuery.isLoading && !recentPostsQuery.isError && (recentPostsQuery.data ?? []).length === 0 && /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: "Sem noticias publicadas." }),
            !recentPostsQuery.isLoading && !recentPostsQuery.isError && (recentPostsQuery.data ?? []).length > 0 && /* @__PURE__ */ jsx("ul", { className: "space-y-4 text-sm text-gray-700", children: recentPostsQuery.data?.filter((entry) => entry.id !== post.id).map((entry) => /* @__PURE__ */ jsxs("li", { className: "space-y-1", children: [
              /* @__PURE__ */ jsx("a", { href: `/noticias/${entry.slug}`, className: "font-semibold text-gray-900 hover:text-[color:var(--brand)]", children: entry.title }),
              /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-[0.2em] text-gray-500", children: formatPostDate(entry.published_at ?? entry.created_at) })
            ] }, entry.id)) })
          ] }),
          /* @__PURE__ */ jsxs(SidebarCard, { title: "Tags", children: [
            tagsQuery.isLoading && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: Array.from({
              length: 6
            }).map((_, index) => /* @__PURE__ */ jsx("div", { className: "h-7 w-16 bg-gray-200 animate-pulse" }, `tag-skeleton-${index}`)) }),
            tagsQuery.isError && /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: "Falha ao carregar tags." }),
            !tagsQuery.isLoading && !tagsQuery.isError && (tagsQuery.data ?? []).length === 0 && /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: "Sem tags disponiveis." }),
            !tagsQuery.isLoading && !tagsQuery.isError && (tagsQuery.data ?? []).length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: tagsQuery.data?.map((tag) => /* @__PURE__ */ jsx("a", { href: `/noticias?tag=${tag.slug}`, className: "border border-gray-200 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-700 transition-colors hover:border-gray-400 rounded-none", children: tag.name }, tag.id)) })
          ] })
        ] })
      ] }) }) })
    ] })
  ] });
}
export {
  NewsPostDetailPage as component
};
