import { jsxs, jsx } from "react/jsx-runtime";
import { toast } from "sonner";
import { c as useCart, t as truncateText, l as isInStock, s as supabase } from "./router-BiReTygo.mjs";
import { S as ShoppingCart } from "./x.mjs";
import { L as Link2 } from "./link-2.mjs";
const MAX_DESCRIPTION_LENGTH = 350;
const MAX_DESCRIPTION_LENGTH_COMPACT = 160;
const formatPrice = (value) => {
  if (value === null || value === void 0 || Number.isNaN(value)) return "";
  return new Intl.NumberFormat("pt-MZ", {
    style: "currency",
    currency: "MZN",
    maximumFractionDigits: 0
  }).format(value);
};
const coverUrlFor = (book) => {
  if (book.cover_url) return book.cover_url;
  if (book.cover_path) {
    return supabase.storage.from("covers").getPublicUrl(book.cover_path).data.publicUrl;
  }
  return null;
};
const bookLinkFor = (book) => `/livro/${book.slug ?? book.id}`;
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
function ProductCard({ book, compact = false }) {
  const { addToCart } = useCart();
  const coverUrl = coverUrlFor(book);
  const priceLabel = formatPrice(book.price_mzn);
  const description = book.description || book.seo_description || "";
  const summary = description ? truncateText(
    description,
    compact ? MAX_DESCRIPTION_LENGTH_COMPACT : MAX_DESCRIPTION_LENGTH
  ) : "Descricao indisponivel.";
  const inStock = isInStock(book.stock ?? 0);
  const handleAddToCart = () => {
    if (!inStock) {
      toast.error("Este livro esta esgotado");
      return;
    }
    addToCart({
      id: book.id,
      title: book.title,
      slug: book.slug ?? book.id,
      price_mzn: book.price_mzn ?? 0,
      stock: book.stock ?? 0,
      cover_url: coverUrl
    });
    toast.success("Adicionado ao carrinho");
  };
  const copyBookLink = async () => {
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
  return /* @__PURE__ */ jsxs("div", { className: `group ${compact ? "space-y-3" : "space-y-4"}`, children: [
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
            onClick: handleAddToCart,
            className: "flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--brand)] text-white transition-transform hover:scale-105",
            "aria-label": "Adicionar ao carrinho",
            children: /* @__PURE__ */ jsx(ShoppingCart, { className: "h-5 w-5" })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: copyBookLink,
            className: "flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--brand)] text-white transition-transform hover:scale-105",
            "aria-label": "Copiar link do livro",
            children: /* @__PURE__ */ jsx(Link2, { className: "h-5 w-5" })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: compact ? "space-y-2" : "space-y-3", children: [
      /* @__PURE__ */ jsx(
        "a",
        {
          href: bookLinkFor(book),
          className: `block font-semibold text-gray-900 transition-colors hover:text-gray-700 ${compact ? "text-lg" : "text-xl"}`,
          children: book.title
        }
      ),
      !compact && /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed text-gray-600", children: summary }),
      compact && summary && /* @__PURE__ */ jsx("p", { className: "text-xs leading-relaxed text-gray-600", children: summary }),
      priceLabel && /* @__PURE__ */ jsx("p", { className: `${compact ? "text-base" : "text-lg"} font-semibold text-[color:var(--brand)]`, children: priceLabel })
    ] })
  ] });
}
export {
  ProductCard as P
};
