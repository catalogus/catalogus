import { jsx, jsxs } from "react/jsx-runtime";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { A as AdminGuard, D as DashboardLayout } from "./AdminGuard-DAXk2vKF.mjs";
import { S as StatusBadge } from "./StatusBadge-R_r7lo3n.mjs";
import { u as useAuth, s as supabase } from "./router-BiReTygo.mjs";
import "react";
import "@tanstack/react-router";
import "./button-BUSE9ux3.mjs";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "./x.mjs";
import "./search.mjs";
import "sonner";
import "@supabase/supabase-js";
import "./server.mjs";
import "node:async_hooks";
import "@tanstack/react-router/ssr/server";
function AdminOrdersPage() {
  const {
    profile,
    session,
    signOut
  } = useAuth();
  const userName = profile?.name ?? session?.user.email ?? "Admin";
  const userEmail = session?.user.email ?? "";
  const queryClient = useQueryClient();
  const ordersQuery = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("orders").select("id, order_number, customer_name, customer_email, total, status, created_at").order("created_at", {
        ascending: false
      }).limit(50);
      if (error) throw error;
      return data;
    },
    staleTime: 1e4
  });
  const updateStatus = useMutation({
    mutationFn: async (payload) => {
      const {
        error
      } = await supabase.from("orders").update({
        status: payload.status
      }).eq("id", payload.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "orders"]
      });
    }
  });
  const formatPrice = (value) => new Intl.NumberFormat("pt-MZ", {
    style: "currency",
    currency: "MZN",
    maximumFractionDigits: 0
  }).format(value);
  const statusVariant = (status) => {
    switch (status) {
      case "paid":
        return "success";
      case "processing":
        return "info";
      case "failed":
      case "cancelled":
        return "danger";
      default:
        return "muted";
    }
  };
  return /* @__PURE__ */ jsx(AdminGuard, { children: /* @__PURE__ */ jsx(DashboardLayout, { userRole: profile?.role ?? "admin", userName, userEmail, onSignOut: signOut, children: /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm uppercase text-gray-500", children: "Commerce" }),
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-gray-900", children: "Orders" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-gray-500", children: [
        /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-green-500" }),
        "M-Pesa status feed will surface here."
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-gray-200 p-4 bg-white", children: ordersQuery.isLoading ? /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Loading orders…" }) : ordersQuery.isError ? /* @__PURE__ */ jsx("p", { className: "text-sm text-rose-600", children: "Failed to load orders. Check connection or permissions." }) : /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full text-sm", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "text-left text-gray-500 border-b", children: [
        /* @__PURE__ */ jsx("th", { className: "py-2 pr-3", children: "Order" }),
        /* @__PURE__ */ jsx("th", { className: "py-2 pr-3", children: "Customer" }),
        /* @__PURE__ */ jsx("th", { className: "py-2 pr-3", children: "Total" }),
        /* @__PURE__ */ jsx("th", { className: "py-2 pr-3", children: "Status" }),
        /* @__PURE__ */ jsx("th", { className: "py-2 pr-3", children: "Created" }),
        /* @__PURE__ */ jsx("th", { className: "py-2 pr-3", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y", children: ordersQuery.data?.map((order) => /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("td", { className: "py-3 pr-3 font-medium text-gray-900", children: order.order_number }),
        /* @__PURE__ */ jsxs("td", { className: "py-3 pr-3 text-gray-700", children: [
          /* @__PURE__ */ jsx("div", { children: order.customer_name }),
          /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500", children: order.customer_email })
        ] }),
        /* @__PURE__ */ jsx("td", { className: "py-3 pr-3 text-gray-900", children: formatPrice(order.total) }),
        /* @__PURE__ */ jsx("td", { className: "py-3 pr-3", children: /* @__PURE__ */ jsx(StatusBadge, { label: order.status, variant: statusVariant(order.status) }) }),
        /* @__PURE__ */ jsx("td", { className: "py-3 pr-3 text-gray-600", children: new Date(order.created_at).toLocaleDateString() }),
        /* @__PURE__ */ jsx("td", { className: "py-3 pr-3 text-sm", children: /* @__PURE__ */ jsxs("select", { defaultValue: order.status, onChange: (e) => updateStatus.mutate({
          id: order.id,
          status: e.target.value
        }), className: "rounded-lg border border-gray-300 px-2 py-1", children: [
          /* @__PURE__ */ jsx("option", { value: "pending", children: "Pending" }),
          /* @__PURE__ */ jsx("option", { value: "processing", children: "Processing" }),
          /* @__PURE__ */ jsx("option", { value: "paid", children: "Paid" }),
          /* @__PURE__ */ jsx("option", { value: "failed", children: "Failed" }),
          /* @__PURE__ */ jsx("option", { value: "cancelled", children: "Cancelled" })
        ] }) })
      ] }, order.id)) })
    ] }) }) })
  ] }) }) });
}
export {
  AdminOrdersPage as component
};
