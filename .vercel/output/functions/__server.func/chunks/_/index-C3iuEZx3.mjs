import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { H as Header } from "./Header-B0XvW395.mjs";
import { u as useAuth, s as supabase, g as getOrderStatusColor, a as getOrderStatusLabel, f as formatPrice } from "./router-BiReTygo.mjs";
import "./x.mjs";
import "sonner";
import "@supabase/supabase-js";
import "./server.mjs";
import "node:async_hooks";
import "@tanstack/react-router/ssr/server";
function OrdersHistoryPage() {
  const {
    session,
    profile
  } = useAuth();
  const [statusFilter, setStatusFilter] = useState("all");
  const email = profile?.email ?? session?.user?.email ?? null;
  const ordersQuery = useQuery({
    queryKey: ["my-orders", email],
    queryFn: async () => {
      if (!email) return [];
      const {
        data,
        error
      } = await supabase.from("orders").select(`
          id,
          order_number,
          total,
          status,
          created_at,
          items:order_items(
            id,
            quantity,
            price,
            book:books(title, cover_url, cover_path)
          )
        `).eq("customer_email", email).order("created_at", {
        ascending: false
      });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!email,
    staleTime: 6e4
  });
  const filteredOrders = useMemo(() => {
    const orders = ordersQuery.data ?? [];
    if (statusFilter === "all") return orders;
    return orders.filter((order) => order.status === statusFilter);
  }, [ordersQuery.data, statusFilter]);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#f8f4ef] text-gray-900", children: [
    /* @__PURE__ */ jsx(Header, {}),
    /* @__PURE__ */ jsxs("main", { className: "container mx-auto px-4 py-16 lg:px-15", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-semibold md:text-5xl", children: "Meus pedidos" }),
      !email && /* @__PURE__ */ jsxs("div", { className: "mt-8 border border-gray-200 bg-white p-8 text-center", children: [
        /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold text-gray-900", children: "Faça login para ver os seus pedidos" }),
        /* @__PURE__ */ jsx(Link, { to: "/auth/sign-in", className: "mt-6 inline-flex items-center justify-center bg-[color:var(--brand)] px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-white hover:bg-[#a25a2c]", children: "Entrar" })
      ] }),
      email && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "mt-8 flex flex-wrap items-center gap-3", children: [
          /* @__PURE__ */ jsx("label", { className: "text-sm text-gray-600", htmlFor: "order-status", children: "Filtrar status" }),
          /* @__PURE__ */ jsxs("select", { id: "order-status", value: statusFilter, onChange: (event) => setStatusFilter(event.target.value), className: "border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[color:var(--brand)] focus:outline-none", children: [
            /* @__PURE__ */ jsx("option", { value: "all", children: "Todos" }),
            /* @__PURE__ */ jsx("option", { value: "pending", children: "Pendente" }),
            /* @__PURE__ */ jsx("option", { value: "paid", children: "Pago" }),
            /* @__PURE__ */ jsx("option", { value: "cancelled", children: "Cancelado" })
          ] })
        ] }),
        ordersQuery.isLoading && /* @__PURE__ */ jsx("div", { className: "mt-6 space-y-4", children: Array.from({
          length: 3
        }).map((_, index) => /* @__PURE__ */ jsx("div", { className: "h-24 animate-pulse border border-gray-200 bg-gray-100" }, `orders-skeleton-${index}`)) }),
        ordersQuery.isError && /* @__PURE__ */ jsx("div", { className: "mt-6 border border-gray-200 bg-white p-6 text-sm text-gray-600", children: "Falha ao carregar pedidos. Tente novamente." }),
        !ordersQuery.isLoading && !ordersQuery.isError && filteredOrders.length === 0 && /* @__PURE__ */ jsx("div", { className: "mt-6 border border-gray-200 bg-white p-6 text-sm text-gray-600", children: "Nenhum pedido encontrado." }),
        !ordersQuery.isLoading && !ordersQuery.isError && filteredOrders.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-6 space-y-4", children: filteredOrders.map((order) => {
          const statusColor = getOrderStatusColor(order.status);
          const statusLabel = getOrderStatusLabel(order.status);
          const createdAt = new Date(order.created_at);
          const dateLabel = createdAt.toLocaleDateString("pt-PT", {
            day: "2-digit",
            month: "short",
            year: "numeric"
          });
          return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 border border-gray-200 bg-white p-5 md:flex-row md:items-center md:justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
                /* @__PURE__ */ jsx("p", { className: "text-base font-semibold text-gray-900", children: order.order_number }),
                /* @__PURE__ */ jsx("span", { className: `inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor}`, children: statusLabel })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-wider text-gray-500", children: dateLabel }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: formatPrice(order.total) })
            ] }),
            /* @__PURE__ */ jsx(Link, { to: `/pedido/${order.id}`, className: "inline-flex items-center justify-center border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-700 hover:border-gray-400", children: "Ver detalhes" })
          ] }, order.id);
        }) })
      ] })
    ] })
  ] });
}
export {
  OrdersHistoryPage as component
};
