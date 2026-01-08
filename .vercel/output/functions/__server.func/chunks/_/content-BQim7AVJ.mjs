import { jsx, jsxs } from "react/jsx-runtime";
import { A as AdminGuard, D as DashboardLayout } from "./AdminGuard-DAXk2vKF.mjs";
import { u as useAuth } from "./router-BiReTygo.mjs";
import "react";
import "@tanstack/react-router";
import "./button-BUSE9ux3.mjs";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "./x.mjs";
import "./search.mjs";
import "@tanstack/react-query";
import "sonner";
import "@supabase/supabase-js";
import "./server.mjs";
import "node:async_hooks";
import "@tanstack/react-router/ssr/server";
function AdminContentPage() {
  const {
    profile,
    session,
    signOut
  } = useAuth();
  const userName = profile?.name ?? session?.user.email ?? "Admin";
  const userEmail = session?.user.email ?? "";
  return /* @__PURE__ */ jsx(AdminGuard, { children: /* @__PURE__ */ jsx(DashboardLayout, { userRole: profile?.role ?? "admin", userName, userEmail, onSignOut: signOut, children: /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm uppercase text-gray-500", children: "Content" }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-gray-900", children: "Content hub" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Posts, partners, services, and projects share this layout." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-dashed border-gray-300 p-6 text-gray-500 text-sm", children: "Select a section from the sidebar to manage specific content types." })
  ] }) }) });
}
export {
  AdminContentPage as component
};
