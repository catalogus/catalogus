import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { H as Header } from "./Header-B0XvW395.mjs";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { s as supabase } from "./router-BiReTygo.mjs";
import { C as ChevronLeft } from "./chevron-left.mjs";
import { C as ChevronRight } from "./chevron-right.mjs";
import { c as createLucideIcon, S as ShoppingCart } from "./x.mjs";
import { L as Link2 } from "./link-2.mjs";
import { G as Globe, L as Linkedin, F as Facebook, I as Instagram, T as Twitter, Y as Youtube } from "./youtube.mjs";
import "@tanstack/react-router";
import "@supabase/supabase-js";
import "./server.mjs";
import "node:async_hooks";
import "@tanstack/react-router/ssr/server";
const __iconNode = [
  ["path", { d: "M7 7h10v10", key: "1tivn9" }],
  ["path", { d: "M7 17 17 7", key: "1vkiza" }]
];
const ArrowUpRight = createLucideIcon("arrow-up-right", __iconNode);
function Hero({ slides }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const interval = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => window.clearInterval(interval);
  }, [isPaused, slides.length]);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  const handlePrevious = () => {
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };
  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
  };
  const getContentTypeLabel = (type) => {
    switch (type) {
      case "book":
        return "Livro em destaque";
      case "author":
        return "Autor em destaque";
      case "post":
        return "Post em destaque";
      case "custom":
        return "Destaque";
      default:
        return "Destaque";
    }
  };
  if (slides.length === 0) {
    return null;
  }
  return /* @__PURE__ */ jsxs(
    "section",
    {
      className: "relative w-full overflow-hidden",
      style: { height: "calc(100vh - var(--header-height, 72px))" },
      onMouseEnter: () => setIsPaused(true),
      onMouseLeave: () => setIsPaused(false),
      children: [
        slides.map((slide, index) => {
          const isActive = index === activeIndex;
          const isAuthorSlide = slide.content_type === "author";
          const accentColor = slide.accent_color || "#5b6168";
          const authorImageUrl = slide.linked_content?.photo_url || null;
          const authorName = slide.linked_content?.name || slide.title;
          return /* @__PURE__ */ jsxs(
            "div",
            {
              className: `absolute inset-0 transition-opacity duration-700 ${isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`,
              "aria-hidden": !isActive,
              children: [
                /* @__PURE__ */ jsx("div", { className: "absolute inset-0", children: isAuthorSlide ? /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "absolute inset-0",
                    style: { backgroundColor: accentColor }
                  }
                ) : /* @__PURE__ */ jsxs(Fragment, { children: [
                  slide.background_image_url && /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: slide.background_image_url,
                      alt: slide.title,
                      className: "h-full w-full object-cover"
                    }
                  ),
                  /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/60" })
                ] }) }),
                /* @__PURE__ */ jsx("div", { className: "relative z-10 flex h-full items-center", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 lg:px-[60px]", children: /* @__PURE__ */ jsxs(
                  "div",
                  {
                    className: `flex flex-col gap-10 lg:flex-row lg:items-center ${isAuthorSlide ? "lg:justify-between" : ""}`,
                    children: [
                      /* @__PURE__ */ jsxs(
                        "div",
                        {
                          className: `space-y-6 text-white ${isAuthorSlide ? "max-w-xl" : "max-w-2xl"}`,
                          children: [
                            /* @__PURE__ */ jsx("span", { className: "inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 text-xs font-semibold uppercase tracking-wider", children: getContentTypeLabel(slide.content_type) }),
                            /* @__PURE__ */ jsx("h1", { className: "text-4xl font-bold leading-tight md:text-5xl lg:text-6xl", children: slide.title }),
                            slide.subtitle && /* @__PURE__ */ jsx("p", { className: "text-xl font-medium text-white/90 md:text-2xl", children: slide.subtitle }),
                            slide.description && /* @__PURE__ */ jsx("p", { className: "text-base text-white/80 md:text-lg max-w-xl", children: slide.description }),
                            slide.cta_text && slide.cta_url && /* @__PURE__ */ jsx("div", { className: "pt-2", children: /* @__PURE__ */ jsx(
                              "a",
                              {
                                href: slide.cta_url,
                                className: "inline-flex items-center bg-white text-gray-900 px-6 py-3 text-sm font-semibold uppercase tracking-wider transition hover:bg-gray-100 hover:-translate-y-0.5",
                                children: slide.cta_text
                              }
                            ) })
                          ]
                        }
                      ),
                      isAuthorSlide && /* @__PURE__ */ jsx("div", { className: "flex-1 flex justify-center lg:justify-end", children: /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-md", children: [
                        /* @__PURE__ */ jsx("div", { className: "absolute -inset-4 border border-white/20" }),
                        /* @__PURE__ */ jsx("div", { className: "relative aspect-[4/5] w-full overflow-hidden border border-white/20 bg-white/10", children: authorImageUrl ? /* @__PURE__ */ jsx(
                          "img",
                          {
                            src: authorImageUrl,
                            alt: authorName,
                            className: "h-full w-full object-cover",
                            loading: "lazy"
                          }
                        ) : /* @__PURE__ */ jsx("div", { className: "flex h-full w-full items-center justify-center text-5xl font-semibold text-white/70", children: (authorName || "A").charAt(0).toUpperCase() }) })
                      ] }) })
                    ]
                  }
                ) }) })
              ]
            },
            slide.id
          );
        }),
        slides.length > 1 && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("div", { className: "absolute left-4 right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-between z-20 pointer-events-none lg:left-[60px] lg:right-[60px]", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: handlePrevious,
                className: "pointer-events-auto flex h-10 w-10 items-center justify-center border border-white/50 bg-white/10 backdrop-blur-sm text-white transition hover:bg-white/20 hover:-translate-x-1",
                "aria-label": "Slide anterior",
                children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-5 w-5" })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: handleNext,
                className: "pointer-events-auto flex h-10 w-10 items-center justify-center border border-white/50 bg-white/10 backdrop-blur-sm text-white transition hover:bg-white/20 hover:translate-x-1",
                "aria-label": "Próximo slide",
                children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-5 w-5" })
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20", children: slides.map((_, index) => /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setActiveIndex(index),
              className: `h-2 transition-all ${index === activeIndex ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/75"}`,
              "aria-label": `Ir para o slide ${index + 1}`
            },
            `dot-${index}`
          )) })
        ] }),
        isPaused && slides.length > 1 && /* @__PURE__ */ jsx("div", { className: "absolute top-4 right-4 z-20 border border-white/20 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5", children: "Pausado" })
      ]
    }
  );
}
const aboutText = "Há 5 anos, a paixão pelos livros, a irreverência e a colaboração movem a equipa da Catalogus. Posicionamo-nos como um dos principais actores do sistema literário e cultural de Moçambique, actuando no campo editorial, na comunicação cultural e na criação e implementação de projectos literários que fortalecem o sector e ampliam o número de leitores. Produzimos eventos e desenvolvemos produtos culturais que aproximam pessoas, ideias e histórias, movidas pelo sonho e pelo desejo de transformação.";
const aboutWords = aboutText.split(" ");
function AboutSection() {
  const [aboutVisible, setAboutVisible] = useState(false);
  const aboutRef = useRef(null);
  useEffect(() => {
    if (!aboutRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAboutVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(aboutRef.current);
    return () => observer.disconnect();
  }, []);
  return /* @__PURE__ */ jsx("section", { className: "bg-[#f4efe9]", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 py-32 lg:px-15", children: /* @__PURE__ */ jsxs(
    "div",
    {
      ref: aboutRef,
      className: `max-w-7xl space-y-6 ${aboutVisible ? "about-reveal-active" : "about-reveal"}`,
      children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-[0.35em] text-gray-600", children: "Sobre" }),
        /* @__PURE__ */ jsx("p", { className: "text-2xl leading-tight text-gray-900 md:text-4xl", children: aboutWords.map((word, index) => /* @__PURE__ */ jsxs(
          "span",
          {
            className: "reveal-word",
            style: { animationDelay: `${index * 18}ms` },
            children: [
              word,
              index < aboutWords.length - 1 ? " " : ""
            ]
          },
          `${word}-${index}`
        )) }),
        /* @__PURE__ */ jsxs("a", { href: "/sobre", className: "about-link", children: [
          "Ler mais",
          /* @__PURE__ */ jsx("span", { className: "about-link-arrow", "aria-hidden": "true", children: "→" })
        ] })
      ]
    }
  ) }) });
}
const MAX_DESCRIPTION_LENGTH = 350;
const formatPrice = (value) => {
  if (value === null || Number.isNaN(value)) return "";
  return new Intl.NumberFormat("pt-MZ", {
    style: "currency",
    currency: "MZN",
    maximumFractionDigits: 0
  }).format(value);
};
const truncateText = (value, maxLength) => {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trimEnd()}...`;
};
const coverUrlFor = (book) => {
  if (book.cover_url) return book.cover_url;
  if (book.cover_path) {
    return supabase.storage.from("covers").getPublicUrl(book.cover_path).data.publicUrl;
  }
  return null;
};
const bookLinkFor = (book) => `/livro/${book.id}`;
const addToCart = (book) => {
  if (typeof window === "undefined") return;
  try {
    const key = "catalogus-cart";
    const raw = window.localStorage.getItem(key);
    const items = raw ? JSON.parse(raw) : [];
    const existing = items.find((item) => item.id === book.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      items.push({ id: book.id, quantity: 1 });
    }
    window.localStorage.setItem(key, JSON.stringify(items));
  } catch {
  }
  toast.success("Adicionado ao carrinho");
};
const copyText = async (value) => {
  if (typeof window !== "undefined" && window.isSecureContext && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
    }
  }
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-1000px";
  textarea.style.left = "-1000px";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);
  const success = document.execCommand("copy");
  document.body.removeChild(textarea);
  return success;
};
const copyBookLink = async (book) => {
  if (typeof window === "undefined") return;
  const href = new URL(bookLinkFor(book), window.location.origin).toString();
  try {
    const copied = await copyText(href);
    if (!copied) {
      toast.error("Nao foi possivel copiar o link");
      return;
    }
    toast.success("Link copiado");
  } catch {
    toast.error("Nao foi possivel copiar o link");
  }
};
function FeaturedBooksSection() {
  const booksQuery = useQuery({
    queryKey: ["home", "featured-books"],
    queryFn: async () => {
      const { data, error } = await supabase.from("books").select(
        "id, title, slug, price_mzn, description, seo_description, cover_url, cover_path, featured, is_active"
      ).eq("featured", true).eq("is_active", true).limit(4);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 6e4
  });
  return /* @__PURE__ */ jsx("section", { className: "bg-white text-gray-900", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 py-24 lg:px-15", children: [
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-[0.35em] text-gray-500", children: "Loja" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-semibold tracking-tight md:text-5xl", children: "Livros em destaque" }),
        /* @__PURE__ */ jsx("div", { className: "mt-3 h-1 w-12 bg-[color:var(--brand)]" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-4", children: [
      booksQuery.isLoading && Array.from({ length: 4 }).map((_, index) => /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
        /* @__PURE__ */ jsx("div", { className: "bg-[#e6e0db] p-10 rounded-none", children: /* @__PURE__ */ jsx("div", { className: "aspect-[3/4] w-full bg-white/60 animate-pulse" }) }),
        /* @__PURE__ */ jsx("div", { className: "h-5 w-3/4 bg-gray-200 animate-pulse" }),
        /* @__PURE__ */ jsx("div", { className: "h-12 w-full bg-gray-100 animate-pulse" }),
        /* @__PURE__ */ jsx("div", { className: "h-5 w-1/3 bg-gray-200 animate-pulse" })
      ] }, `featured-book-skeleton-${index}`)),
      booksQuery.isError && /* @__PURE__ */ jsx("div", { className: "border border-gray-200 bg-white p-6 text-sm text-gray-600 rounded-none", children: "Falha ao carregar os livros em destaque." }),
      !booksQuery.isLoading && !booksQuery.isError && (booksQuery.data ?? []).map((book) => {
        const coverUrl = coverUrlFor(book);
        const description = book.description || book.seo_description || "";
        const summary = description ? truncateText(description, MAX_DESCRIPTION_LENGTH) : "Descricao indisponivel.";
        const priceLabel = formatPrice(book.price_mzn);
        return /* @__PURE__ */ jsxs("div", { className: "group space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative bg-[#e6e0db] p-10 rounded-none", children: [
            /* @__PURE__ */ jsx("div", { className: "aspect-[3/4] w-full overflow-hidden bg-white/60 rounded-none", children: coverUrl ? /* @__PURE__ */ jsx(
              "img",
              {
                src: coverUrl,
                alt: book.title,
                className: "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
                loading: "lazy"
              }
            ) : /* @__PURE__ */ jsx("div", { className: "flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.3em] text-gray-400", children: "Sem capa" }) }),
            /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 flex items-center justify-center gap-3 bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => addToCart(book),
                  className: "flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--brand)] text-white transition-transform hover:scale-105",
                  "aria-label": "Adicionar ao carrinho",
                  children: /* @__PURE__ */ jsx(ShoppingCart, { className: "h-5 w-5" })
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => copyBookLink(book),
                  className: "flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--brand)] text-white transition-transform hover:scale-105",
                  "aria-label": "Copiar link do livro",
                  children: /* @__PURE__ */ jsx(Link2, { className: "h-5 w-5" })
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsx(
              "a",
              {
                href: bookLinkFor(book),
                className: "block text-xl font-semibold text-gray-900 transition-colors hover:text-gray-700",
                children: book.title
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed text-gray-600", children: summary }),
            priceLabel && /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold text-[color:var(--brand)]", children: priceLabel })
          ] })
        ] }, book.id);
      }),
      !booksQuery.isLoading && !booksQuery.isError && (booksQuery.data?.length ?? 0) === 0 && /* @__PURE__ */ jsx("div", { className: "border border-gray-200 bg-white p-6 text-sm text-gray-600 rounded-none", children: "Sem livros em destaque." })
    ] })
  ] }) });
}
const photoUrlFor = (author) => {
  if (author.photo_url) return author.photo_url;
  if (author.photo_path) {
    return supabase.storage.from("author-photos").getPublicUrl(author.photo_path).data.publicUrl;
  }
  return null;
};
const fetchAuthors = async (useFeatured) => {
  const selectFields = useFeatured ? "id, wp_slug, name, author_type, photo_url, photo_path, social_links, featured" : "id, wp_slug, name, author_type, photo_url, photo_path, social_links";
  let query = supabase.from("authors").select(selectFields).order("created_at", { ascending: false }).limit(10);
  if (useFeatured) {
    query = query.eq("featured", true);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
};
const getSocialLinks = (author) => {
  const links = author.social_links ?? {};
  return [
    { key: "website", href: links.website, icon: Globe, label: "Website" },
    { key: "linkedin", href: links.linkedin, icon: Linkedin, label: "LinkedIn" },
    { key: "facebook", href: links.facebook, icon: Facebook, label: "Facebook" },
    { key: "instagram", href: links.instagram, icon: Instagram, label: "Instagram" },
    { key: "twitter", href: links.twitter, icon: Twitter, label: "Twitter" },
    { key: "youtube", href: links.youtube, icon: Youtube, label: "YouTube" }
  ].filter((item) => item.href);
};
function FeaturedAuthorsSection() {
  const authorsQuery = useQuery({
    queryKey: ["home", "featured-authors"],
    queryFn: async () => {
      try {
        return await fetchAuthors(true);
      } catch (error) {
        if (error?.code === "42703" || /featured/i.test(error?.message ?? "")) {
          return await fetchAuthors(false);
        }
        throw error;
      }
    },
    staleTime: 6e4
  });
  return /* @__PURE__ */ jsx("section", { className: "bg-[#f4efe9] text-gray-900", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 py-24 lg:px-15", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6 md:flex-row md:items-end md:justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-[0.35em] text-gray-500", children: "Autores" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-3xl font-semibold tracking-tight md:text-5xl", children: "Autores em destaque" }),
          /* @__PURE__ */ jsx("div", { className: "mt-3 h-1 w-12 bg-[color:var(--brand)]" })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/autores",
          className: "inline-flex items-center gap-3 border border-gray-900/60 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-gray-900 transition-colors hover:border-gray-900 hover:text-gray-900 rounded-none",
          children: "Ver mais autores"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5", children: [
      authorsQuery.isLoading && Array.from({ length: 10 }).map((_, index) => /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx("div", { className: "aspect-[4/5] w-full bg-gray-100 animate-pulse" }),
        /* @__PURE__ */ jsx("div", { className: "h-5 w-2/3 bg-gray-200 animate-pulse" }),
        /* @__PURE__ */ jsx("div", { className: "h-4 w-1/3 bg-gray-100 animate-pulse" })
      ] }, `featured-author-skeleton-${index}`)),
      authorsQuery.isError && /* @__PURE__ */ jsx("div", { className: "border border-gray-200 bg-white p-6 text-sm text-gray-600 rounded-none", children: "Falha ao carregar autores em destaque." }),
      !authorsQuery.isLoading && !authorsQuery.isError && (authorsQuery.data ?? []).map((author) => {
        const photoUrl = photoUrlFor(author);
        const typeLabel = author.author_type || "Autor";
        const socialLinks = getSocialLinks(author);
        const authorHref = `/autor/${author.wp_slug || author.id}`;
        return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "group relative aspect-[4/5] w-full overflow-hidden bg-[#f4f1ec] rounded-none", children: [
            photoUrl ? /* @__PURE__ */ jsx(
              "img",
              {
                src: photoUrl,
                alt: author.name,
                className: "h-full w-full object-cover",
                loading: "lazy"
              }
            ) : /* @__PURE__ */ jsx("div", { className: "flex h-full w-full items-center justify-center text-5xl font-semibold text-gray-300", children: author.name.charAt(0).toUpperCase() }),
            socialLinks.length > 0 && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100", children: socialLinks.map((item) => {
              const Icon = item.icon;
              return /* @__PURE__ */ jsx(
                "a",
                {
                  href: item.href,
                  target: "_blank",
                  rel: "noreferrer",
                  className: "flex h-10 w-10 items-center justify-center bg-white text-gray-900 transition-transform hover:scale-105",
                  "aria-label": item.label,
                  children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" })
                },
                item.key
              );
            }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-gray-900", children: /* @__PURE__ */ jsx(
              "a",
              {
                href: authorHref,
                className: "hover:underline",
                "aria-label": `Ver autor ${author.name}`,
                children: author.name
              }
            ) }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: typeLabel })
          ] })
        ] }, author.id);
      }),
      !authorsQuery.isLoading && !authorsQuery.isError && (authorsQuery.data?.length ?? 0) === 0 && /* @__PURE__ */ jsx("div", { className: "border border-gray-200 bg-white p-6 text-sm text-gray-600 rounded-none", children: "Sem autores em destaque." })
    ] })
  ] }) });
}
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
function NewsSection() {
  const postsQuery = useQuery({
    queryKey: ["home", "latest-posts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("posts").select(
        `
          id,
          title,
          slug,
          featured_image_url,
          published_at,
          created_at,
          categories:post_categories_map(category:post_categories(name, slug))
        `
      ).eq("status", "published").order("published_at", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false }).limit(4);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 6e4
  });
  return /* @__PURE__ */ jsx("section", { className: "bg-[#050505] text-white", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 py-32 lg:px-15", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6 md:flex-row md:items-end md:justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-[0.35em] text-white/60", children: "Fique a par" }),
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-semibold tracking-tight md:text-5xl", children: "Últimas Notícias" })
      ] }),
      /* @__PURE__ */ jsxs(
        "a",
        {
          href: "/noticias",
          className: "inline-flex items-center gap-3 border border-white/60 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:border-white hover:text-white rounded-none",
          children: [
            "Ver todas as atualizações",
            /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-4 w-4" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4", children: [
      postsQuery.isLoading && /* @__PURE__ */ jsx(Fragment, { children: Array.from({ length: 4 }).map((_, index) => /* @__PURE__ */ jsx(
        "div",
        {
          className: "h-[420px] bg-white/5 border border-white/10 rounded-none animate-pulse"
        },
        `news-skeleton-${index}`
      )) }),
      postsQuery.isError && /* @__PURE__ */ jsx("div", { className: "border border-white/10 bg-white/5 p-6 text-sm text-white/70 rounded-none", children: "Falha ao carregar as notícias." }),
      !postsQuery.isLoading && !postsQuery.isError && (postsQuery.data ?? []).map((post) => {
        const href = post.slug ? `/noticias/${post.slug}` : "/noticias";
        const dateLabel = formatPostDate(
          post.published_at ?? post.created_at
        );
        const category = post.categories?.[0]?.category;
        const categoryLabel = category?.name;
        const categoryClass = category?.slug ? getCategoryBadgeClass(category.slug) : categoryLabel ? getCategoryBadgeClass(categoryLabel) : "";
        return /* @__PURE__ */ jsxs(
          "a",
          {
            href,
            className: "group relative flex min-h-105 flex-col justify-end overflow-hidden border border-white/10 bg-white/5 text-left transition-transform hover:-translate-y-1 rounded-none",
            children: [
              post.featured_image_url ? /* @__PURE__ */ jsx(
                "img",
                {
                  src: post.featured_image_url,
                  alt: post.title,
                  className: "absolute inset-0 h-full w-full object-cover object-center",
                  loading: "lazy"
                }
              ) : /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-neutral-700 to-neutral-900" }),
              /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" }),
              categoryLabel && /* @__PURE__ */ jsx(
                "span",
                {
                  className: `${categoryClass} absolute left-4 top-4 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] rounded-none`,
                  children: categoryLabel
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "relative z-10 space-y-4 p-6", children: [
                /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold leading-snug text-white md:text-2xl", children: post.title }),
                /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/80", children: /* @__PURE__ */ jsx("span", { children: dateLabel }) })
              ] })
            ]
          },
          post.id
        );
      }),
      !postsQuery.isLoading && !postsQuery.isError && (postsQuery.data?.length ?? 0) === 0 && /* @__PURE__ */ jsx("div", { className: "border border-white/10 bg-white/5 p-6 text-sm text-white/70 rounded-none", children: "Sem noticias publicadas." })
    ] })
  ] }) });
}
const partners = [
  { name: "Camões", logo: "/partners/camoes.png", className: "scale-125" },
  { name: "Carlos Morgado", logo: "/partners/carlos_morgado.png" },
  {
    name: "Embaixada de Espanha",
    logo: "/partners/embaixada-espanha.svg",
    className: "scale-110"
  },
  { name: "IGR Maputo", logo: "/partners/igr_maputo.jpg", className: "scale-140" }
];
function PartnersSection() {
  return /* @__PURE__ */ jsx("section", { className: "bg-[#f7f4ef] text-gray-900", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 py-24 lg:px-15", children: [
    /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-[0.35em] text-gray-500", children: "Reconhecimento" }),
      /* @__PURE__ */ jsx("h2", { className: "max-w-4xl text-3xl font-semibold leading-tight text-gray-900 md:text-5xl", children: "Desde 2020 trabalhamos com parceiros que impulsionam a cultura, educação e leitura." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4", children: partners.map((partner) => /* @__PURE__ */ jsx(
      "div",
      {
        className: "flex min-h-[140px] items-center justify-center rounded-[32px] bg-white/80 p-8 shadow-sm",
        children: /* @__PURE__ */ jsx(
          "img",
          {
            src: partner.logo,
            alt: partner.name,
            className: `h-12 w-[180px] object-contain opacity-70 grayscale md:h-14 md:w-[200px] ${partner.className ?? ""}`,
            loading: "lazy"
          }
        )
      },
      partner.name
    )) })
  ] }) });
}
function Home() {
  const heroSlidesQuery = useQuery({
    queryKey: ["hero-slides"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("hero_slides").select("*").eq("is_active", true).order("order_weight", {
        ascending: true
      });
      if (error) throw error;
      const slides = data ?? [];
      const authorIds = Array.from(new Set(slides.filter((slide) => slide.content_type === "author" && slide.content_id).map((slide) => slide.content_id)));
      if (authorIds.length === 0) {
        return slides;
      }
      const {
        data: authors,
        error: authorsError
      } = await supabase.from("authors").select("id, name, photo_url, photo_path").in("id", authorIds);
      if (authorsError) throw authorsError;
      const authorMap = new Map((authors ?? []).map((author) => {
        const resolvedPhotoUrl = author.photo_url || (author.photo_path ? supabase.storage.from("author-photos").getPublicUrl(author.photo_path).data.publicUrl : null);
        return [author.id, {
          ...author,
          photo_url: resolvedPhotoUrl
        }];
      }));
      return slides.map((slide) => {
        if (slide.content_type !== "author" || !slide.content_id) {
          return slide;
        }
        return {
          ...slide,
          linked_content: authorMap.get(slide.content_id) ?? null
        };
      });
    },
    staleTime: 6e4
  });
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-white text-gray-900", children: [
    /* @__PURE__ */ jsx(Header, {}),
    heroSlidesQuery.data && heroSlidesQuery.data.length > 0 && /* @__PURE__ */ jsx(Hero, { slides: heroSlidesQuery.data }),
    /* @__PURE__ */ jsxs("main", { className: "pb-16", children: [
      /* @__PURE__ */ jsx(AboutSection, {}),
      /* @__PURE__ */ jsx(NewsSection, {}),
      /* @__PURE__ */ jsx(FeaturedBooksSection, {}),
      /* @__PURE__ */ jsx(FeaturedAuthorsSection, {}),
      /* @__PURE__ */ jsx(PartnersSection, {})
    ] })
  ] });
}
export {
  Home as component
};
