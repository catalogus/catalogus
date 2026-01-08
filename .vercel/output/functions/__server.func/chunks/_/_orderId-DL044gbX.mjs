import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { H as Header } from "./Header-B0XvW395.mjs";
import { h as Route$q, s as supabase, a as getOrderStatusLabel, g as getOrderStatusColor, f as formatPrice } from "./router-BiReTygo.mjs";
import "react";
import "./x.mjs";
import "sonner";
import "@supabase/supabase-js";
import "./server.mjs";
import "node:async_hooks";
import "@tanstack/react-router/ssr/server";
async function initiateMpesaPayment(order) {
  return {
    success: true,
    instructions: `Envie ${order.total} MZN para o numero M-Pesa: +258 84 XXX XXXX`,
    reference: order.order_number
  };
}
const resolveCoverUrl = (item) => {
  if (item.book?.cover_url) return item.book.cover_url;
  if (item.book?.cover_path) {
    return supabase.storage.from("covers").getPublicUrl(item.book.cover_path).data.publicUrl;
  }
  return null;
};
function OrderConfirmationPage() {
  const {
    orderId
  } = Route$q.useParams();
  const orderQuery = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("orders").select(`
          id,
          order_number,
          customer_name,
          customer_email,
          customer_phone,
          total,
          status,
          created_at,
          items:order_items(
            id,
            quantity,
            price,
            book:books(id, title, cover_url, cover_path)
          )
        `).eq("id", orderId).maybeSingle();
      if (error) throw error;
      return data ?? null;
    },
    staleTime: 6e4
  });
  const order = orderQuery.data;
  const orderNumber = order?.order_number ?? "";
  const statusLabel = order ? getOrderStatusLabel(order.status) : "";
  const statusColor = order ? getOrderStatusColor(order.status) : "";
  const mpesaQuery = useQuery({
    queryKey: ["mpesa", order?.order_number],
    queryFn: async () => {
      if (!order) return null;
      return initiateMpesaPayment({
        order_number: order.order_number,
        total: Number(order.total)
      });
    },
    enabled: !!order
  });
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#f8f4ef] text-gray-900", children: [
    /* @__PURE__ */ jsx(Header, {}),
    orderQuery.isLoading && /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 py-24 lg:px-15", children: /* @__PURE__ */ jsx("div", { className: "h-64 animate-pulse border border-gray-200 bg-gray-100" }) }),
    orderQuery.isError && /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 py-24 lg:px-15", children: /* @__PURE__ */ jsx("div", { className: "border border-gray-200 bg-white p-6 text-sm text-gray-600", children: "Falha ao carregar o pedido. Tente novamente." }) }),
    !orderQuery.isLoading && !orderQuery.isError && !order && /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 py-24 lg:px-15", children: /* @__PURE__ */ jsx("div", { className: "border border-gray-200 bg-white p-6 text-sm text-gray-600", children: "Pedido nao encontrado." }) }),
    !orderQuery.isLoading && !orderQuery.isError && order && /* @__PURE__ */ jsx("main", { className: "container mx-auto px-4 py-16 lg:px-15", children: /* @__PURE__ */ jsxs("div", { className: "space-y-6 border border-gray-200 bg-white p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-wider text-gray-500", children: "Pedido confirmado" }),
          /* @__PURE__ */ jsx("h1", { className: "mt-2 text-2xl font-semibold md:text-3xl", children: orderNumber })
        ] }),
        /* @__PURE__ */ jsx("span", { className: `inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusColor}`, children: statusLabel })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 text-sm text-gray-700 md:grid-cols-2", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "block text-xs uppercase tracking-wider text-gray-500", children: "Cliente" }),
          /* @__PURE__ */ jsx("span", { children: order.customer_name })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "block text-xs uppercase tracking-wider text-gray-500", children: "Contacto" }),
          /* @__PURE__ */ jsxs("span", { children: [
            order.customer_email,
            " | ",
            order.customer_phone
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "border-t border-gray-200 pt-4", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Itens" }),
        /* @__PURE__ */ jsx("div", { className: "mt-4 space-y-4", children: (order.items ?? []).map((item) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "h-16 w-12 flex-shrink-0 bg-gray-100", children: resolveCoverUrl(item) ? /* @__PURE__ */ jsx("img", { src: resolveCoverUrl(item) ?? "", alt: item.book?.title ?? "Livro", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsx("div", { className: "flex h-full w-full items-center justify-center text-xs font-semibold text-gray-300", children: item.book?.title?.charAt(0).toUpperCase() ?? "L" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-gray-900", children: item.book?.title ?? "Livro" }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-600", children: [
              item.quantity,
              " x ",
              formatPrice(item.price)
            ] })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-gray-900", children: formatPrice(item.price * item.quantity) })
        ] }, item.id)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-t border-gray-200 pt-4 text-sm text-gray-700", children: [
        /* @__PURE__ */ jsx("span", { children: "Total" }),
        /* @__PURE__ */ jsx("span", { className: "text-lg font-semibold text-gray-900", children: formatPrice(order.total) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "border-t border-gray-200 pt-4 text-sm text-gray-700", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-xs uppercase tracking-wider text-gray-500", children: "Pagamento M-Pesa" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2", children: mpesaQuery.data?.instructions ?? "As instrucoes de pagamento estarao disponiveis em breve." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3 border-t border-gray-200 pt-4", children: [
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => window.print(), className: "border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-700 hover:border-gray-400", children: "Imprimir pedido" }),
        /* @__PURE__ */ jsx(Link, { to: "/loja", className: "bg-[color:var(--brand)] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#a25a2c]", children: "Voltar a loja" })
      ] })
    ] }) })
  ] });
}
export {
  OrderConfirmationPage as component
};
