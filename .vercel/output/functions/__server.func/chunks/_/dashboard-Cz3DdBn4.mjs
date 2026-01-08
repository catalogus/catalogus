import { jsx, jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { A as AdminGuard, D as DashboardLayout } from "./AdminGuard-DAXk2vKF.mjs";
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
function AdminDashboardPage() {
  const {
    profile,
    session,
    signOut
  } = useAuth();
  const userName = profile?.name ?? session?.user.email ?? "Admin";
  const userEmail = session?.user.email ?? "";
  const metricsQuery = useQuery({
    queryKey: ["admin", "metrics"],
    queryFn: async () => {
      const startOfDay = /* @__PURE__ */ new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const [ordersToday, activeBooks, authorsCount] = await Promise.all([supabase.from("orders").select("id", {
        count: "exact",
        head: true
      }).gte("created_at", startOfDay.toISOString()), supabase.from("books").select("id", {
        count: "exact",
        head: true
      }).eq("is_active", true), supabase.from("authors").select("id", {
        count: "exact",
        head: true
      })]);
      if (ordersToday.error) throw ordersToday.error;
      if (activeBooks.error) throw activeBooks.error;
      if (authorsCount.error) throw authorsCount.error;
      return {
        ordersToday: ordersToday.count ?? 0,
        activeBooks: activeBooks.count ?? 0,
        authorsCount: authorsCount.count ?? 0
      };
    },
    staleTime: 3e4
  });
  return /* @__PURE__ */ jsx(AdminGuard, { children: /* @__PURE__ */ jsx(DashboardLayout, { userRole: profile?.role ?? "admin", userName, userEmail, onSignOut: signOut, children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm uppercase text-gray-500", children: "Overview" }),
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-gray-900", children: "Catalogus dashboard" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Quick snapshot of orders, books, and authors." })
      ] }),
      metricsQuery.isFetching && /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500", children: "Updating…" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [{
      label: "Orders today",
      value: metricsQuery.data?.ordersToday?.toString() ?? (metricsQuery.isLoading ? "…" : "0")
    }, {
      label: "Active books",
      value: metricsQuery.data?.activeBooks?.toString() ?? (metricsQuery.isLoading ? "…" : "0")
    }, {
      label: "Authors",
      value: metricsQuery.data?.authorsCount?.toString() ?? (metricsQuery.isLoading ? "…" : "0")
    }].map((item) => /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-gray-200 p-4 bg-gray-50", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-wide text-gray-500", children: item.label }),
      /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold text-gray-900", children: item.value })
    ] }, item.label)) })
  ] }) }) });
}
export {
  AdminDashboardPage as component
};
