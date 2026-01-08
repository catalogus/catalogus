import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { A as AdminGuard, D as DashboardLayout } from "./AdminGuard-DAXk2vKF.mjs";
import { B as Button, I as Input } from "./button-BUSE9ux3.mjs";
import { u as useAuth, s as supabase } from "./router-BiReTygo.mjs";
import { D as DropdownMenu, a as DropdownMenuTrigger, E as Ellipsis, b as DropdownMenuContent, c as DropdownMenuLabel, d as DropdownMenuSeparator, e as DropdownMenuSub, f as DropdownMenuSubTrigger, g as DropdownMenuSubContent, h as DropdownMenuRadioGroup, i as DropdownMenuRadioItem, S as Sheet, j as SheetContent, k as SheetHeader, l as SheetTitle, m as SheetDescription } from "./sheet-B6u_Vcab.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell, f as TableCaption } from "./table-nB_ewZar.mjs";
import { toast } from "sonner";
import { S as StatusBadge } from "./StatusBadge-R_r7lo3n.mjs";
import { S as Search } from "./search.mjs";
import "@tanstack/react-router";
import "./x.mjs";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@supabase/supabase-js";
import "./server.mjs";
import "node:async_hooks";
import "@tanstack/react-router/ssr/server";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-dialog";
import "./chevron-right.mjs";
const emptyUserValues = {
  name: "",
  email: "",
  password: "",
  role: "author",
  status: "pending"
};
function AdminUsersPage() {
  const {
    profile,
    session,
    signOut
  } = useAuth();
  const userName = profile?.name ?? session?.user.email ?? "Admin";
  const userEmail = session?.user.email ?? "";
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formValues, setFormValues] = useState(emptyUserValues);
  const [filters, setFilters] = useState({
    search: "",
    role: "all",
    status: "all"
  });
  const usersQuery = useQuery({
    queryKey: ["admin", "users", filters],
    queryFn: async () => {
      let query = supabase.from("profiles").select("id, name, email, role, status, created_at").order("created_at", {
        ascending: false
      });
      if (filters.role !== "all") {
        query = query.eq("role", filters.role);
      }
      if (filters.status !== "all") {
        query = query.eq("status", filters.status);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }
      const {
        data,
        error
      } = await query;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 3e4
  });
  const adminCountQuery = useQuery({
    queryKey: ["admin", "users", "admin-count"],
    queryFn: async () => {
      const {
        count,
        error
      } = await supabase.from("profiles").select("id", {
        count: "exact",
        head: true
      }).eq("role", "admin");
      if (error) throw error;
      return count ?? 0;
    },
    staleTime: 3e4
  });
  const adminCount = adminCountQuery.data ?? 0;
  const createUser = useMutation({
    mutationFn: async (values) => {
      const email = values.email.toLowerCase().trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Please enter a valid email address");
      }
      if (values.password.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }
      const {
        data: authData,
        error: authError
      } = await supabase.auth.signUp({
        email,
        password: values.password,
        options: {
          data: {
            name: values.name
          },
          emailRedirectTo: void 0
        }
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create user");
      const userId = authData.user.id;
      const role = values.role;
      const status = role === "author" ? values.status ?? "pending" : null;
      const {
        data: existingProfile
      } = await supabase.from("profiles").select("id").eq("id", userId).maybeSingle();
      if (existingProfile) {
        const {
          error
        } = await supabase.from("profiles").update({
          name: values.name,
          email,
          role,
          status
        }).eq("id", userId);
        if (error) throw error;
      } else {
        const {
          error
        } = await supabase.from("profiles").insert({
          id: userId,
          name: values.name,
          email,
          role,
          status
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "users"]
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "users", "admin-count"]
      });
      setShowForm(false);
      setFormValues(emptyUserValues);
      toast.success("User created");
    },
    onError: (err) => toast.error(err.message ?? "Failed to create user")
  });
  const updateUser = useMutation({
    mutationFn: async (payload) => {
      const {
        error
      } = await supabase.from("profiles").update({
        role: payload.role,
        status: payload.status
      }).eq("id", payload.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "users"]
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "users", "admin-count"]
      });
      toast.success("User updated");
    },
    onError: (err) => toast.error(err.message ?? "Failed to update user")
  });
  const roles = useMemo(() => ["admin", "author", "customer"], []);
  const statuses = useMemo(() => ["pending", "approved", "rejected"], []);
  const handleRoleChange = (user, nextRole) => {
    if (user.role === "admin" && nextRole !== "admin" && adminCount <= 1) {
      toast.error("You cannot remove the last admin");
      return;
    }
    const nextStatus = nextRole === "author" ? user.status ?? "pending" : null;
    updateUser.mutate({
      id: user.id,
      role: nextRole,
      status: nextStatus
    });
  };
  const handleStatusChange = (user, nextStatus) => {
    if (user.role !== "author") return;
    updateUser.mutate({
      id: user.id,
      role: user.role,
      status: nextStatus
    });
  };
  return /* @__PURE__ */ jsx(AdminGuard, { children: /* @__PURE__ */ jsxs(DashboardLayout, { userRole: profile?.role ?? "admin", userName, userEmail, onSignOut: signOut, children: [
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm uppercase text-gray-500", children: "Community" }),
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-gray-900", children: "Users" })
        ] }),
        /* @__PURE__ */ jsx(Button, { onClick: () => {
          setFormValues(emptyUserValues);
          setShowForm(true);
        }, children: "Add user" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-gray-200 p-4 bg-white", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative flex-1 min-w-[220px]", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" }),
          /* @__PURE__ */ jsx(Input, { placeholder: "Search users...", value: filters.search, onChange: (e) => setFilters((prev) => ({
            ...prev,
            search: e.target.value
          })), className: "pl-9" })
        ] }),
        /* @__PURE__ */ jsxs("select", { value: filters.role, onChange: (e) => setFilters((prev) => ({
          ...prev,
          role: e.target.value
        })), className: "w-full sm:w-44 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900", children: [
          /* @__PURE__ */ jsx("option", { value: "all", children: "All Roles" }),
          roles.map((role) => /* @__PURE__ */ jsx("option", { value: role, children: role }, role))
        ] }),
        /* @__PURE__ */ jsxs("select", { value: filters.status, onChange: (e) => setFilters((prev) => ({
          ...prev,
          status: e.target.value
        })), className: "w-full sm:w-44 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900", children: [
          /* @__PURE__ */ jsx("option", { value: "all", children: "All Status" }),
          statuses.map((status) => /* @__PURE__ */ jsx("option", { value: status, children: status }, status))
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-gray-200 bg-white overflow-hidden", children: usersQuery.isLoading ? /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 p-4", children: "Loading users..." }) : usersQuery.isError ? /* @__PURE__ */ jsx("p", { className: "text-sm text-rose-600 p-4", children: "Failed to load users. Check connection or permissions." }) : /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableHead, { children: "Name" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Email" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Role" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Status" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Date" }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx(TableBody, { children: usersQuery.data?.map((user) => /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { className: "font-medium text-gray-900", children: user.name }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-gray-600", children: user.email ?? "—" }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(StatusBadge, { label: user.role ?? "customer", variant: user.role === "admin" ? "info" : user.role === "author" ? "warning" : "muted" }) }),
          /* @__PURE__ */ jsx(TableCell, { children: user.role === "author" ? /* @__PURE__ */ jsx(StatusBadge, { label: user.status ?? "pending", variant: user.status === "approved" ? "success" : user.status === "rejected" ? "danger" : "warning" }) : /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-500", children: "—" }) }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-gray-600 text-sm", children: new Date(user.created_at).toLocaleDateString() }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxs(DropdownMenu, { children: [
            /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", children: /* @__PURE__ */ jsx(Ellipsis, { className: "h-4 w-4" }) }) }),
            /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", className: "w-48", children: [
              /* @__PURE__ */ jsx(DropdownMenuLabel, { children: "Actions" }),
              /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
              /* @__PURE__ */ jsxs(DropdownMenuSub, { children: [
                /* @__PURE__ */ jsx(DropdownMenuSubTrigger, { children: "Set role" }),
                /* @__PURE__ */ jsx(DropdownMenuSubContent, { children: /* @__PURE__ */ jsx(DropdownMenuRadioGroup, { value: user.role ?? "customer", onValueChange: (value) => handleRoleChange(user, value), children: roles.map((role) => /* @__PURE__ */ jsx(DropdownMenuRadioItem, { value: role, disabled: user.role === "admin" && adminCount <= 1 && role !== "admin", children: role }, role)) }) })
              ] }),
              /* @__PURE__ */ jsxs(DropdownMenuSub, { children: [
                /* @__PURE__ */ jsx(DropdownMenuSubTrigger, { disabled: user.role !== "author", children: "Set status" }),
                /* @__PURE__ */ jsx(DropdownMenuSubContent, { children: /* @__PURE__ */ jsx(DropdownMenuRadioGroup, { value: user.status ?? "pending", onValueChange: (value) => handleStatusChange(user, value), children: statuses.map((status) => /* @__PURE__ */ jsx(DropdownMenuRadioItem, { value: status, children: status }, status)) }) })
              ] })
            ] })
          ] }) })
        ] }, user.id)) }),
        usersQuery.data?.length === 0 && /* @__PURE__ */ jsx(TableCaption, { children: "No users found." })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(Sheet, { open: showForm, onOpenChange: setShowForm, children: /* @__PURE__ */ jsxs(SheetContent, { className: "w-full sm:max-w-lg px-4", children: [
      /* @__PURE__ */ jsxs(SheetHeader, { children: [
        /* @__PURE__ */ jsx(SheetTitle, { children: "New User" }),
        /* @__PURE__ */ jsx(SheetDescription, { children: "Create an admin, author, or customer account." })
      ] }),
      /* @__PURE__ */ jsxs("form", { className: "space-y-4 pt-4", onSubmit: (e) => {
        e.preventDefault();
        createUser.mutate(formValues);
      }, children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-gray-700", children: "Name" }),
          /* @__PURE__ */ jsx(Input, { required: true, value: formValues.name, onChange: (e) => setFormValues((prev) => ({
            ...prev,
            name: e.target.value
          })), placeholder: "Full name" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-gray-700", children: "Email" }),
          /* @__PURE__ */ jsx(Input, { type: "email", required: true, value: formValues.email, onChange: (e) => setFormValues((prev) => ({
            ...prev,
            email: e.target.value
          })), placeholder: "name@example.com" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-gray-700", children: "Password" }),
          /* @__PURE__ */ jsx(Input, { type: "password", required: true, value: formValues.password, onChange: (e) => setFormValues((prev) => ({
            ...prev,
            password: e.target.value
          })), placeholder: "At least 8 characters" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-gray-700", children: "Role" }),
          /* @__PURE__ */ jsx("select", { value: formValues.role, onChange: (e) => {
            const nextRole = e.target.value;
            setFormValues((prev) => ({
              ...prev,
              role: nextRole,
              status: nextRole === "author" ? prev.status ?? "pending" : null
            }));
          }, className: "w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900", children: roles.map((role) => /* @__PURE__ */ jsx("option", { value: role, children: role }, role)) })
        ] }),
        formValues.role === "author" && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-gray-700", children: "Status" }),
          /* @__PURE__ */ jsx("select", { value: formValues.status ?? "pending", onChange: (e) => setFormValues((prev) => ({
            ...prev,
            status: e.target.value
          })), className: "w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900", children: statuses.map((status) => /* @__PURE__ */ jsx("option", { value: status, children: status }, status)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", onClick: () => setShowForm(false), children: "Cancel" }),
          /* @__PURE__ */ jsx(Button, { type: "submit", disabled: createUser.isPending, children: createUser.isPending ? "Creating..." : "Create User" })
        ] })
      ] })
    ] }) })
  ] }) });
}
export {
  AdminUsersPage as component
};
