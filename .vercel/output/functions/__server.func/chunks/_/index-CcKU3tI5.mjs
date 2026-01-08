import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { H as Header } from "./Header-B0XvW395.mjs";
import { Q as QuantitySelector } from "./QuantitySelector-Ca2RuOYa.mjs";
import { c as useCart, e as getMaxQuantity, f as formatPrice } from "./router-BiReTygo.mjs";
import { T as Trash2 } from "./trash-2.mjs";
import "react";
import "./x.mjs";
import "@tanstack/react-query";
import "sonner";
import "@supabase/supabase-js";
import "./server.mjs";
import "node:async_hooks";
import "@tanstack/react-router/ssr/server";
function CartPage() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    total,
    isLoading
  } = useCart();
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#f8f4ef] text-gray-900", children: [
    /* @__PURE__ */ jsx(Header, {}),
    /* @__PURE__ */ jsxs("main", { className: "container mx-auto px-4 py-16 lg:px-15", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-semibold md:text-5xl", children: "Carrinho" }),
      isLoading && /* @__PURE__ */ jsx("div", { className: "mt-8 space-y-4", children: Array.from({
        length: 3
      }).map((_, index) => /* @__PURE__ */ jsx("div", { className: "h-24 animate-pulse rounded-none border border-gray-200 bg-gray-100" }, `cart-skeleton-${index}`)) }),
      !isLoading && items.length === 0 && /* @__PURE__ */ jsxs("div", { className: "mt-8 border border-gray-200 bg-white p-8 text-center", children: [
        /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold text-gray-900", children: "O seu carrinho esta vazio" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600", children: "Explore a loja para adicionar livros." }),
        /* @__PURE__ */ jsx(Link, { to: "/loja", className: "mt-6 inline-flex items-center justify-center bg-[color:var(--brand)] px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-white hover:bg-[#a25a2c]", children: "Continuar a comprar" })
      ] }),
      !isLoading && items.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-8 grid gap-8 lg:grid-cols-[1fr_320px]", children: [
        /* @__PURE__ */ jsx("div", { className: "space-y-4", children: items.map((item) => {
          const maxQuantity = getMaxQuantity(item.stock);
          return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 border border-gray-200 bg-white p-4 sm:flex-row sm:items-center", children: [
            /* @__PURE__ */ jsx("div", { className: "h-28 w-20 flex-shrink-0 bg-gray-100", children: item.cover_url ? /* @__PURE__ */ jsx("img", { src: item.cover_url, alt: item.title, className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsx("div", { className: "flex h-full w-full items-center justify-center text-lg font-semibold text-gray-300", children: item.title.charAt(0).toUpperCase() }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("a", { href: `/livro/${item.slug}`, className: "text-lg font-semibold text-gray-900 hover:text-gray-700", children: item.title }),
                /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-600", children: formatPrice(item.price) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
                /* @__PURE__ */ jsx(QuantitySelector, { value: item.quantity, onChange: (value) => updateQuantity(item.id, value), min: 1, max: maxQuantity || 1 }),
                /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => removeFromCart(item.id), className: "inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-600", children: [
                  /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }),
                  "Remover"
                ] })
              ] })
            ] })
          ] }, item.id);
        }) }),
        /* @__PURE__ */ jsxs("div", { className: "h-fit border border-gray-200 bg-white p-6", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Resumo" }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center justify-between text-sm text-gray-600", children: [
            /* @__PURE__ */ jsx("span", { children: "Subtotal" }),
            /* @__PURE__ */ jsx("span", { className: "font-semibold text-gray-900", children: formatPrice(total) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-6 space-y-3", children: [
            /* @__PURE__ */ jsx(Link, { to: "/checkout", className: "flex w-full items-center justify-center bg-[color:var(--brand)] px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-white hover:bg-[#a25a2c]", children: "Finalizar compra" }),
            /* @__PURE__ */ jsx(Link, { to: "/loja", className: "flex w-full items-center justify-center border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-gray-700 hover:border-gray-400", children: "Continuar comprando" })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  CartPage as component
};
