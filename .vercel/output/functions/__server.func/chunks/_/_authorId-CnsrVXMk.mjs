import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { H as Header } from "./Header-B0XvW395.mjs";
import { o as Route$n, s as supabase } from "./router-BiReTygo.mjs";
import { M as MapPin } from "./map-pin.mjs";
import { C as Calendar } from "./calendar.mjs";
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
const resolveGalleryUrl = (image) => {
  if (image.url) return image.url;
  if (image.path) {
    return supabase.storage.from("author-photos").getPublicUrl(image.path).data.publicUrl;
  }
  return "";
};
const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
};
const extractVideoUrl = (value) => {
  if (!value) return null;
  const trimmed = value.trim();
  const iframeMatch = trimmed.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  if (iframeMatch?.[1]) return iframeMatch[1];
  const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  if (srcMatch?.[1]) return srcMatch[1];
  if (trimmed.startsWith("<")) return null;
  return trimmed;
};
const buildEmbedUrl = (value) => {
  const rawUrl = extractVideoUrl(value);
  if (!rawUrl) return null;
  const normalized = rawUrl.startsWith("//") ? `https:${rawUrl}` : rawUrl;
  let parsed;
  try {
    parsed = new URL(normalized);
  } catch {
    return null;
  }
  const hostname = parsed.hostname.replace(/^www\./, "");
  if (hostname === "youtu.be") {
    const id = parsed.pathname.slice(1);
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }
  if (hostname.endsWith("youtube.com") || hostname.endsWith("youtube-nocookie.com")) {
    const pathParts = parsed.pathname.split("/").filter(Boolean);
    const pathId = pathParts[0] === "embed" || pathParts[0] === "shorts" ? pathParts[1] : null;
    const id = parsed.searchParams.get("v") || pathId;
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }
  if (hostname === "player.vimeo.com" || hostname.endsWith("vimeo.com")) {
    const parts = parsed.pathname.split("/").filter(Boolean);
    const id = parts[parts.length - 1];
    return id ? `https://player.vimeo.com/video/${id}` : null;
  }
  return null;
};
const getSocialLinks = (author) => {
  const links = author?.social_links ?? {};
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
function AuthorPublicPage() {
  const {
    authorId
  } = Route$n.useParams();
  const authorQuery = useQuery({
    queryKey: ["author", authorId],
    queryFn: async () => {
      const selectFields = "id, wp_slug, name, author_type, bio, photo_url, photo_path, social_links, birth_date, residence_city, province, published_works, author_gallery, featured_video";
      const {
        data: bySlug,
        error: slugError
      } = await supabase.from("authors").select(selectFields).eq("wp_slug", authorId).maybeSingle();
      if (slugError) throw slugError;
      if (bySlug) return bySlug;
      const {
        data: byId,
        error: idError
      } = await supabase.from("authors").select(selectFields).eq("id", authorId).maybeSingle();
      if (idError) throw idError;
      return byId ?? null;
    },
    staleTime: 6e4
  });
  const author = authorQuery.data ?? null;
  const heroPhoto = resolvePhotoUrl(author?.photo_url, author?.photo_path);
  const socialLinks = getSocialLinks(author);
  const birthDateLabel = formatDate(author?.birth_date);
  const embedUrl = buildEmbedUrl(author?.featured_video);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-white text-gray-900", children: [
    /* @__PURE__ */ jsx(Header, {}),
    authorQuery.isLoading && /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 py-24 lg:px-15", children: /* @__PURE__ */ jsx("div", { className: "h-72 rounded-none border border-gray-200 bg-gray-100 animate-pulse" }) }),
    authorQuery.isError && /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 py-24 lg:px-15", children: /* @__PURE__ */ jsx("div", { className: "border border-gray-200 bg-white p-6 text-sm text-gray-600 rounded-none", children: "Falha ao carregar o autor. Tente novamente." }) }),
    !authorQuery.isLoading && !authorQuery.isError && !author && /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 py-24 lg:px-15", children: /* @__PURE__ */ jsx("div", { className: "border border-gray-200 bg-white p-6 text-sm text-gray-600 rounded-none", children: "Autor não encontrado." }) }),
    !authorQuery.isLoading && !authorQuery.isError && author && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("section", { className: "relative overflow-hidden bg-[#1c1b1a] text-white", children: [
        heroPhoto && /* @__PURE__ */ jsx("img", { src: heroPhoto, alt: author.name, className: "absolute inset-0 h-full w-full object-cover" }),
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/20" }),
        /* @__PURE__ */ jsx("div", { className: "relative z-10", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 py-24 lg:px-15", children: /* @__PURE__ */ jsxs("div", { className: "max-w-3xl space-y-5", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-[0.4em] text-white/70", children: "Autor em destaque" }),
          /* @__PURE__ */ jsx("h1", { className: "text-4xl font-semibold leading-tight md:text-6xl", children: author.name }),
          author.author_type && /* @__PURE__ */ jsx("p", { className: "text-base uppercase tracking-[0.3em] text-white/70", children: author.author_type }),
          /* @__PURE__ */ jsxs("div", { className: "text-xs uppercase tracking-[0.3em] text-white/60", children: [
            /* @__PURE__ */ jsx("a", { href: "/", className: "hover:text-white", children: "Home" }),
            " ",
            "/",
            " ",
            /* @__PURE__ */ jsx("a", { href: "/autores", className: "hover:text-white", children: "Autores" }),
            " ",
            "/ ",
            author.name
          ] })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsx("main", { className: "py-20", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 lg:px-15", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-12 lg:grid-cols-[320px_1fr]", children: [
        /* @__PURE__ */ jsxs("aside", { className: "space-y-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "border border-gray-200 bg-white p-6 rounded-none", children: [
            /* @__PURE__ */ jsx("div", { className: "aspect-[4/5] w-full overflow-hidden bg-[#f4f1ec]", children: heroPhoto ? /* @__PURE__ */ jsx("img", { src: heroPhoto, alt: author.name, className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsx("div", { className: "flex h-full w-full items-center justify-center text-5xl font-semibold text-gray-300", children: author.name.charAt(0).toUpperCase() }) }),
            /* @__PURE__ */ jsxs("div", { className: "mt-6 space-y-3 text-sm text-gray-600", children: [
              author.residence_city && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4 text-gray-500" }),
                /* @__PURE__ */ jsx("span", { children: author.residence_city })
              ] }),
              author.province && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4 text-gray-500" }),
                /* @__PURE__ */ jsx("span", { children: author.province })
              ] }),
              birthDateLabel && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4 text-gray-500" }),
                /* @__PURE__ */ jsx("span", { children: birthDateLabel })
              ] })
            ] })
          ] }),
          socialLinks.length > 0 && /* @__PURE__ */ jsxs("div", { className: "border border-gray-200 bg-white p-6 rounded-none", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-[0.3em] text-gray-500", children: "Redes sociais" }),
            /* @__PURE__ */ jsx("div", { className: "mt-4 flex flex-wrap gap-3", children: socialLinks.map((item) => {
              const Icon = item.icon;
              return /* @__PURE__ */ jsx("a", { href: item.href, target: "_blank", rel: "noreferrer", className: "flex h-10 w-10 items-center justify-center border border-gray-200 text-gray-700 transition hover:border-gray-900 hover:text-gray-900", "aria-label": item.label, children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }) }, item.key);
            }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "space-y-10", children: [
          author.bio && /* @__PURE__ */ jsxs("div", { className: "border border-gray-200 bg-white p-8 rounded-none", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-[0.3em] text-gray-500", children: "Biografia" }),
            /* @__PURE__ */ jsx("h2", { className: "mt-4 text-2xl font-semibold text-gray-900", children: "Conheça o autor" }),
            /* @__PURE__ */ jsx("p", { className: "mt-4 text-base leading-relaxed text-gray-700", children: author.bio })
          ] }),
          Array.isArray(author.published_works) && author.published_works.length > 0 && /* @__PURE__ */ jsxs("div", { className: "border border-gray-200 bg-white p-8 rounded-none", children: [
            /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-2 md:flex-row md:items-end md:justify-between", children: /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-[0.3em] text-gray-500", children: "Obras publicadas" }),
              /* @__PURE__ */ jsx("h2", { className: "mt-2 text-2xl font-semibold text-gray-900", children: "Bibliografia selecionada" })
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "mt-8 grid gap-6 md:grid-cols-2", children: author.published_works.map((work, index) => /* @__PURE__ */ jsx("article", { className: "border border-gray-200 bg-[#fdfbf7] p-5 rounded-none", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
              work.cover_url ? /* @__PURE__ */ jsx("img", { src: work.cover_url, alt: work.title, className: "h-24 w-16 object-cover", loading: "lazy" }) : /* @__PURE__ */ jsx("div", { className: "h-24 w-16 bg-gray-200" }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-2", children: [
                /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900", children: work.title }),
                /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-gray-500", children: work.genre }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: work.synopsis }),
                work.link && /* @__PURE__ */ jsx("a", { href: work.link, target: "_blank", rel: "noreferrer", className: "text-xs uppercase tracking-[0.2em] text-gray-900 hover:underline", children: "Ver obra" })
              ] })
            ] }) }, `${work.title}-${index}`)) })
          ] }),
          Array.isArray(author.author_gallery) && author.author_gallery.length > 0 && /* @__PURE__ */ jsxs("div", { className: "border border-gray-200 bg-white p-8 rounded-none", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-[0.3em] text-gray-500", children: "Galeria do autor" }),
            /* @__PURE__ */ jsx("h2", { className: "mt-2 text-2xl font-semibold text-gray-900", children: "Momentos e bastidores" }),
            /* @__PURE__ */ jsx("div", { className: "mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: author.author_gallery.map((image, index) => {
              const imageUrl = resolveGalleryUrl(image);
              if (!imageUrl) return null;
              return /* @__PURE__ */ jsxs("figure", { className: "group overflow-hidden bg-[#f4efe9]", children: [
                /* @__PURE__ */ jsx("img", { src: imageUrl, alt: image.caption || author.name, className: "h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105", loading: "lazy" }),
                image.caption && /* @__PURE__ */ jsx("figcaption", { className: "px-3 py-2 text-xs text-gray-600", children: image.caption })
              ] }, `${imageUrl}-${index}`);
            }) })
          ] }),
          author.featured_video && /* @__PURE__ */ jsxs("div", { className: "border border-gray-200 bg-white p-8 rounded-none", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-[0.3em] text-gray-500", children: "Video em destaque" }),
            /* @__PURE__ */ jsx("h2", { className: "mt-2 text-2xl font-semibold text-gray-900", children: "Conversa com o autor" }),
            /* @__PURE__ */ jsx("div", { className: "mt-6", children: embedUrl ? /* @__PURE__ */ jsx("div", { className: "relative aspect-video w-full overflow-hidden bg-black", children: /* @__PURE__ */ jsx("iframe", { src: embedUrl, title: `Video de ${author.name}`, className: "absolute inset-0 h-full w-full", allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture", allowFullScreen: true }) }) : /* @__PURE__ */ jsx("a", { href: author.featured_video, target: "_blank", rel: "noreferrer", className: "text-sm font-semibold text-gray-900 hover:underline", children: "Assistir video" }) })
          ] })
        ] })
      ] }) }) })
    ] })
  ] });
}
export {
  AuthorPublicPage as component
};
