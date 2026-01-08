import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { H as Header } from "./Header-B0XvW395.mjs";
import { s as supabase } from "./router-BiReTygo.mjs";
import { M as MapPin } from "./map-pin.mjs";
import { G as Globe, L as Linkedin, F as Facebook, I as Instagram, T as Twitter, Y as Youtube } from "./youtube.mjs";
import "@tanstack/react-router";
import "react";
import "./x.mjs";
import "sonner";
import "@supabase/supabase-js";
import "./server.mjs";
import "node:async_hooks";
import "@tanstack/react-router/ssr/server";
const resolvePhotoUrl = (photoUrl, photoPath) => {
  if (photoUrl) return photoUrl;
  if (photoPath) {
    return supabase.storage.from("author-photos").getPublicUrl(photoPath).data.publicUrl;
  }
  return null;
};
const getSocialLinks = (author) => {
  const links = author.social_links ?? {};
  return [{
    key: "website",
    href: links.website,
    icon: Globe,
    label: "Website"
  }, {
    key: "linkedin",
    href: links.linkedin,
    icon: Linkedin,
    label: "LinkedIn"
  }, {
    key: "facebook",
    href: links.facebook,
    icon: Facebook,
    label: "Facebook"
  }, {
    key: "instagram",
    href: links.instagram,
    icon: Instagram,
    label: "Instagram"
  }, {
    key: "twitter",
    href: links.twitter,
    icon: Twitter,
    label: "Twitter"
  }, {
    key: "youtube",
    href: links.youtube,
    icon: Youtube,
    label: "YouTube"
  }].filter((item) => item.href);
};
const AuthorCard = ({
  author
}) => {
  const photoUrl = resolvePhotoUrl(author.photo_url, author.photo_path);
  const socialLinks = getSocialLinks(author);
  const authorHref = `/autor/${author.wp_slug || author.id}`;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "group relative aspect-[4/5] w-full overflow-hidden border border-gray-200 bg-[#f4f1ec] transition-all hover:border-gray-400", children: [
      photoUrl ? /* @__PURE__ */ jsx("img", { src: photoUrl, alt: author.name, className: "h-full w-full object-cover", loading: "lazy" }) : /* @__PURE__ */ jsx("div", { className: "flex h-full w-full items-center justify-center text-5xl font-semibold text-gray-300", children: author.name.charAt(0).toUpperCase() }),
      socialLinks.length > 0 && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100", children: socialLinks.map((item) => {
        const Icon = item.icon;
        return /* @__PURE__ */ jsx("a", { href: item.href, target: "_blank", rel: "noreferrer", className: "flex h-10 w-10 items-center justify-center bg-white text-gray-900 transition-transform hover:scale-105", "aria-label": item.label, onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }) }, item.key);
      }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-gray-900", children: /* @__PURE__ */ jsx("a", { href: authorHref, className: "hover:underline", children: author.name }) }),
      author.author_type && /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: author.author_type }),
      (author.residence_city || author.province) && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-500", children: [
        /* @__PURE__ */ jsx(MapPin, { className: "h-3.5 w-3.5" }),
        /* @__PURE__ */ jsx("span", { children: [author.residence_city, author.province].filter(Boolean).join(", ") })
      ] })
    ] })
  ] });
};
function AutoresListingPage() {
  const featuredAuthorQuery = useQuery({
    queryKey: ["authors", "featured-spotlight"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("authors").select("id, wp_slug, name, author_type, bio, photo_url, photo_path, social_links, residence_city, province").eq("featured", true);
      if (error) throw error;
      if (!data || data.length === 0) return null;
      const randomIndex = Math.floor(Math.random() * data.length);
      return data[randomIndex];
    },
    staleTime: 6e4
  });
  const authorsQuery = useInfiniteQuery({
    queryKey: ["authors", "listing", featuredAuthorQuery.data?.id],
    queryFn: async ({
      pageParam = 1
    }) => {
      let query = supabase.from("authors").select("id, wp_slug, name, author_type, photo_url, photo_path, social_links, residence_city, province").order("name", {
        ascending: true
      });
      if (featuredAuthorQuery.data?.id) {
        query = query.neq("id", featuredAuthorQuery.data.id);
      }
      const from = (pageParam - 1) * 12;
      const to = from + 11;
      const {
        data,
        error
      } = await query.range(from, to);
      if (error) throw error;
      return {
        authors: data ?? [],
        hasMore: data?.length === 12
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : void 0;
    },
    initialPageParam: 1,
    staleTime: 6e4,
    enabled: featuredAuthorQuery.isSuccess
    // Wait for featured query
  });
  const featuredAuthor = featuredAuthorQuery.data;
  const heroPhoto = featuredAuthor ? resolvePhotoUrl(featuredAuthor.photo_url, featuredAuthor.photo_path) : null;
  const heroSocialLinks = featuredAuthor ? getSocialLinks(featuredAuthor) : [];
  const allAuthors = authorsQuery.data?.pages.flatMap((page) => page.authors) ?? [];
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-white text-gray-900", children: [
    /* @__PURE__ */ jsx(Header, {}),
    /* @__PURE__ */ jsxs("section", { className: "relative overflow-hidden bg-[#1c1b1a] text-white", children: [
      featuredAuthor && heroPhoto && /* @__PURE__ */ jsx("img", { src: heroPhoto, alt: featuredAuthor.name, className: "absolute inset-0 h-full w-full object-cover" }),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/20" }),
      /* @__PURE__ */ jsx("div", { className: "relative z-10", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 py-24 lg:px-15", children: /* @__PURE__ */ jsxs("div", { className: "max-w-3xl space-y-5", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-[0.4em] text-white/70", children: featuredAuthor ? "Autor em destaque" : "Nossos Autores" }),
        /* @__PURE__ */ jsx("h1", { className: "text-4xl font-semibold leading-tight md:text-6xl", children: featuredAuthor ? featuredAuthor.name : "Autores" }),
        featuredAuthor?.author_type && /* @__PURE__ */ jsx("p", { className: "text-base uppercase tracking-[0.3em] text-white/70", children: featuredAuthor.author_type }),
        featuredAuthor?.bio && featuredAuthor.bio.length > 50 && /* @__PURE__ */ jsxs("p", { className: "line-clamp-3 text-base leading-relaxed text-white/90", children: [
          featuredAuthor.bio.slice(0, 200),
          "..."
        ] }),
        featuredAuthor && (featuredAuthor.residence_city || featuredAuthor.province) && /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-4 text-sm text-white/80", children: [
          featuredAuthor.residence_city && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsx("span", { children: featuredAuthor.residence_city })
          ] }),
          featuredAuthor.province && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsx("span", { children: featuredAuthor.province })
          ] })
        ] }),
        featuredAuthor && heroSocialLinks.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex gap-3", children: heroSocialLinks.map((item) => {
          const Icon = item.icon;
          return /* @__PURE__ */ jsx("a", { href: item.href, target: "_blank", rel: "noreferrer", className: "flex h-10 w-10 items-center justify-center border border-white/20 bg-white/10 text-white transition hover:bg-white hover:text-gray-900", "aria-label": item.label, children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }) }, item.key);
        }) }),
        featuredAuthor && /* @__PURE__ */ jsx("a", { href: `/autor/${featuredAuthor.wp_slug || featuredAuthor.id}`, className: "inline-flex items-center gap-2 bg-[color:var(--brand)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#a25a2c]", children: "Ver perfil completo" })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsx("main", { className: "bg-[#f8f4ef] py-20", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 lg:px-15", children: [
      authorsQuery.isLoading && /* @__PURE__ */ jsx("div", { className: "grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", children: Array.from({
        length: 12
      }).map((_, index) => /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsx("div", { className: "aspect-[4/5] w-full animate-pulse bg-gray-100" }),
        /* @__PURE__ */ jsx("div", { className: "h-5 w-2/3 animate-pulse bg-gray-200" }),
        /* @__PURE__ */ jsx("div", { className: "h-4 w-1/3 animate-pulse bg-gray-100" })
      ] }, `skeleton-${index}`)) }),
      authorsQuery.isError && /* @__PURE__ */ jsx("div", { className: "rounded-none border border-gray-200 bg-white p-6 text-sm text-gray-600", children: "Falha ao carregar autores. Tente novamente." }),
      !authorsQuery.isLoading && !authorsQuery.isError && allAuthors.length === 0 && /* @__PURE__ */ jsx("div", { className: "rounded-none border border-gray-200 bg-white p-6 text-sm text-gray-600", children: "Nenhum autor encontrado." }),
      !authorsQuery.isLoading && !authorsQuery.isError && allAuthors.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { className: "grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", children: allAuthors.map((author) => /* @__PURE__ */ jsx(AuthorCard, { author }, author.id)) }),
        authorsQuery.hasNextPage && /* @__PURE__ */ jsx("div", { className: "mt-12 flex justify-center", children: /* @__PURE__ */ jsx("button", { type: "button", onClick: () => authorsQuery.fetchNextPage(), disabled: authorsQuery.isFetchingNextPage, className: "rounded-none bg-[color:var(--brand)] px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#a25a2c] disabled:cursor-not-allowed disabled:opacity-50", children: authorsQuery.isFetchingNextPage ? "Carregando..." : "Carregar mais autores" }) }),
        authorsQuery.isFetchingNextPage && /* @__PURE__ */ jsx("div", { className: "mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", children: Array.from({
          length: 12
        }).map((_, index) => /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsx("div", { className: "aspect-[4/5] w-full animate-pulse bg-gray-100" }),
          /* @__PURE__ */ jsx("div", { className: "h-5 w-2/3 animate-pulse bg-gray-200" }),
          /* @__PURE__ */ jsx("div", { className: "h-4 w-1/3 animate-pulse bg-gray-100" })
        ] }, `loading-more-${index}`)) })
      ] })
    ] }) })
  ] });
}
export {
  AutoresListingPage as component
};
