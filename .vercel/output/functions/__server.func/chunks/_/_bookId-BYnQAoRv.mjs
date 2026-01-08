import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { H as Header } from "./Header-B0XvW395.mjs";
import { P as ProductCard } from "./ProductCard-pvIWnZKE.mjs";
import { Q as QuantitySelector } from "./QuantitySelector-Ca2RuOYa.mjs";
import { k as Route$o, c as useCart, s as supabase, e as getMaxQuantity, l as isInStock, f as formatPrice, m as getStockStatusLabel, n as getStockStatusColor, t as truncateText } from "./router-BiReTygo.mjs";
import { S as ShoppingCart } from "./x.mjs";
import "@tanstack/react-router";
import "./link-2.mjs";
import "@supabase/supabase-js";
import "./server.mjs";
import "node:async_hooks";
import "@tanstack/react-router/ssr/server";
const resolveCoverUrl = (book) => {
  if (book.cover_url) return book.cover_url;
  if (book.cover_path) {
    return supabase.storage.from("covers").getPublicUrl(book.cover_path).data.publicUrl;
  }
  return null;
};
function BookDetailPage() {
  const {
    bookId
  } = Route$o.useParams();
  const {
    addToCart
  } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const bookQuery = useQuery({
    queryKey: ["book", bookId],
    queryFn: async () => {
      const selectFields = "id, title, slug, price_mzn, stock, description, seo_description, cover_url, cover_path, isbn, publisher, category, language, authors:authors_books(author:authors(id, name, wp_slug))";
      const {
        data: bySlug,
        error: slugError
      } = await supabase.from("books").select(selectFields).eq("slug", bookId).eq("is_active", true).maybeSingle();
      if (slugError) throw slugError;
      if (bySlug) return bySlug;
      const {
        data: byId,
        error: idError
      } = await supabase.from("books").select(selectFields).eq("id", bookId).eq("is_active", true).maybeSingle();
      if (idError) throw idError;
      return byId ?? null;
    },
    staleTime: 6e4
  });
  const book = bookQuery.data ?? null;
  const coverUrl = book ? resolveCoverUrl(book) : null;
  const stock = book?.stock ?? 0;
  const maxQuantity = getMaxQuantity(stock);
  const inStock = isInStock(stock);
  const stockLabel = getStockStatusLabel(stock);
  const stockColor = getStockStatusColor(stock);
  useEffect(() => {
    if (!book) return;
    if (!inStock) {
      setQuantity(1);
      return;
    }
    setQuantity((prev) => Math.min(Math.max(prev, 1), maxQuantity || 1));
  }, [book, inStock, maxQuantity]);
  const relatedBooksQuery = useQuery({
    queryKey: ["related-books", book?.id, book?.category],
    queryFn: async () => {
      if (!book?.category) return [];
      const {
        data,
        error
      } = await supabase.from("books").select(`
          id,
          title,
          slug,
          price_mzn,
          stock,
          description,
          seo_description,
          cover_url,
          cover_path,
          category,
          language,
          authors:authors_books(author:authors(id, name, wp_slug))
        `).eq("is_active", true).eq("category", book.category).neq("id", book.id).limit(4);
      if (error) throw error;
      return data?.map((entry) => ({
        ...entry,
        authors: entry.authors?.map((a) => ({
          author: a.author
        })) ?? []
      })) ?? [];
    },
    enabled: !!book,
    staleTime: 6e4
  });
  const authorLinks = book?.authors?.map((item) => {
    if (!item.author) return null;
    const slug = item.author.wp_slug || item.author.id;
    return {
      id: item.author.id,
      name: item.author.name,
      href: `/autor/${slug}`
    };
  }).filter(Boolean) ?? [];
  const handleAddToCart = () => {
    if (!book) return;
    if (!inStock) {
      toast.error("Este livro esta esgotado");
      return;
    }
    addToCart({
      id: book.id,
      title: book.title,
      slug: book.slug ?? book.id,
      price_mzn: book.price_mzn ?? 0,
      stock,
      cover_url: coverUrl
    }, quantity);
    toast.success(`"${truncateText(book.title, 40)}" adicionado ao carrinho`);
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-white text-gray-900", children: [
    /* @__PURE__ */ jsx(Header, {}),
    bookQuery.isLoading && /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 py-24 lg:px-15", children: /* @__PURE__ */ jsx("div", { className: "h-72 rounded-none border border-gray-200 bg-gray-100 animate-pulse" }) }),
    bookQuery.isError && /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 py-24 lg:px-15", children: /* @__PURE__ */ jsx("div", { className: "border border-gray-200 bg-white p-6 text-sm text-gray-600 rounded-none", children: "Falha ao carregar o livro. Tente novamente." }) }),
    !bookQuery.isLoading && !bookQuery.isError && !book && /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 py-24 lg:px-15", children: /* @__PURE__ */ jsx("div", { className: "border border-gray-200 bg-white p-6 text-sm text-gray-600 rounded-none", children: "Livro nao encontrado." }) }),
    !bookQuery.isLoading && !bookQuery.isError && book && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("section", { className: "relative overflow-hidden bg-[#1c1b1a] text-white", style: coverUrl ? {
        backgroundImage: `url(${coverUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      } : void 0, children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/60" }),
        /* @__PURE__ */ jsx("div", { className: "relative z-10", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 py-20 lg:px-15", children: /* @__PURE__ */ jsxs("div", { className: "max-w-3xl space-y-4", children: [
          /* @__PURE__ */ jsx("h1", { className: "text-4xl font-semibold md:text-6xl", children: book.title }),
          /* @__PURE__ */ jsxs("div", { className: "text-xs uppercase tracking-[0.3em] text-white/70", children: [
            /* @__PURE__ */ jsx("a", { href: "/", className: "hover:text-white", children: "Home" }),
            " ",
            "/",
            " ",
            /* @__PURE__ */ jsx("a", { href: "/loja", className: "hover:text-white", children: "Loja" }),
            " ",
            "/ ",
            book.title
          ] })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxs("main", { className: "container mx-auto px-4 py-16 lg:px-15", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-10 lg:grid-cols-[minmax(0,420px)_1fr]", children: [
          /* @__PURE__ */ jsx("div", { className: "bg-[#f2eee9] p-10 shadow-sm", children: /* @__PURE__ */ jsx("div", { className: "aspect-[3/4] w-full overflow-hidden bg-white", children: coverUrl ? /* @__PURE__ */ jsx("img", { src: coverUrl, alt: book.title, className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsx("div", { className: "flex h-full w-full items-center justify-center text-4xl font-semibold text-gray-300", children: book.title.charAt(0).toUpperCase() }) }) }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "text-3xl font-semibold md:text-4xl", children: book.title }),
              authorLinks.length > 0 && /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600", children: authorLinks.map((author, index) => /* @__PURE__ */ jsxs("span", { children: [
                /* @__PURE__ */ jsx("a", { href: author.href, className: "hover:text-gray-900", children: author.name }),
                index < authorLinks.length - 1 ? ", " : ""
              ] }, author.id)) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-[color:var(--brand)]", children: formatPrice(book.price_mzn ?? 0) }),
              /* @__PURE__ */ jsx("p", { className: `text-sm font-medium ${stockColor}`, children: stockLabel })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "space-y-4 text-sm text-gray-700", children: /* @__PURE__ */ jsx("p", { children: book.description || book.seo_description || "Descricao indisponivel." }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-4", children: [
              /* @__PURE__ */ jsx(QuantitySelector, { value: quantity, onChange: setQuantity, min: 1, max: maxQuantity || 1, disabled: !inStock }),
              /* @__PURE__ */ jsxs("button", { type: "button", onClick: handleAddToCart, disabled: !inStock, className: "flex items-center gap-2 bg-[color:var(--brand)] px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#a25a2c] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500", children: [
                /* @__PURE__ */ jsx(ShoppingCart, { className: "h-4 w-4" }),
                inStock ? "Adicionar ao carrinho" : "Esgotado"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-xs uppercase tracking-wider text-gray-500", children: [
              /* @__PURE__ */ jsxs("p", { children: [
                "Categoria:",
                " ",
                /* @__PURE__ */ jsx("span", { className: "text-gray-700 normal-case", children: book.category || "Nao informado" })
              ] }),
              /* @__PURE__ */ jsxs("p", { children: [
                "Idioma:",
                " ",
                /* @__PURE__ */ jsx("span", { className: "text-gray-700 normal-case", children: book.language?.toUpperCase() || "Nao informado" })
              ] }),
              /* @__PURE__ */ jsxs("p", { children: [
                "ISBN:",
                " ",
                /* @__PURE__ */ jsx("span", { className: "text-gray-700 normal-case", children: book.isbn || "Nao informado" })
              ] }),
              /* @__PURE__ */ jsxs("p", { children: [
                "ID:",
                " ",
                /* @__PURE__ */ jsx("span", { className: "text-gray-700 normal-case", children: book.id })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "mt-12", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3", children: [
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setActiveTab("description"), className: `px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${activeTab === "description" ? "bg-[color:var(--brand)] text-white" : "bg-white text-gray-600 hover:text-gray-900"}`, children: "Descricao" }),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setActiveTab("reviews"), className: `px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${activeTab === "reviews" ? "bg-[color:var(--brand)] text-white" : "bg-white text-gray-600 hover:text-gray-900"}`, children: "Reviews (0)" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-4 border border-gray-200 bg-white p-6 text-sm text-gray-700", children: activeTab === "description" ? /* @__PURE__ */ jsx("p", { children: book.description || book.seo_description || "Descricao indisponivel." }) : /* @__PURE__ */ jsx("p", { children: "Sem reviews ainda." }) })
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "mt-16", children: [
          /* @__PURE__ */ jsx("div", { className: "mb-8 flex items-center justify-between", children: /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold md:text-3xl", children: "Livros relacionados" }) }),
          relatedBooksQuery.isLoading && /* @__PURE__ */ jsx("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-4", children: Array.from({
            length: 4
          }).map((_, index) => /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsx("div", { className: "aspect-[3/4] w-full animate-pulse bg-gray-200" }),
            /* @__PURE__ */ jsx("div", { className: "h-5 w-3/4 animate-pulse bg-gray-200" })
          ] }, `related-skeleton-${index}`)) }),
          relatedBooksQuery.isError && /* @__PURE__ */ jsx("div", { className: "border border-gray-200 bg-white p-6 text-sm text-gray-600", children: "Falha ao carregar livros relacionados." }),
          !relatedBooksQuery.isLoading && !relatedBooksQuery.isError && (relatedBooksQuery.data?.length ?? 0) === 0 && /* @__PURE__ */ jsx("div", { className: "border border-gray-200 bg-white p-6 text-sm text-gray-600", children: "Sem livros relacionados no momento." }),
          !relatedBooksQuery.isLoading && !relatedBooksQuery.isError && (relatedBooksQuery.data?.length ?? 0) > 0 && /* @__PURE__ */ jsx("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-4", children: (relatedBooksQuery.data ?? []).map((related) => /* @__PURE__ */ jsx(ProductCard, { book: related, compact: true }, related.id)) })
        ] })
      ] })
    ] })
  ] });
}
export {
  BookDetailPage as component
};
