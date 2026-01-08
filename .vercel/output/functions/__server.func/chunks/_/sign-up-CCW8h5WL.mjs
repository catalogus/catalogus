import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { u as useAuth, p as Route$j } from "./router-BiReTygo.mjs";
import "@tanstack/react-query";
import "sonner";
import "@supabase/supabase-js";
import "./server.mjs";
import "node:async_hooks";
import "@tanstack/react-router/ssr/server";
function SignUpPage() {
  const {
    signUp,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const {
    redirect
  } = Route$j.useSearch();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    const {
      error: error2
    } = await signUp(email, password, name);
    setSubmitting(false);
    if (error2) {
      setError(error2.message);
      return;
    }
    setSuccessMessage("Account created. You can continue to the dashboard.");
    navigate({
      to: redirect ?? "/admin/dashboard"
    });
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-6", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-6 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white font-semibold", children: "C" }),
      /* @__PURE__ */ jsx("h1", { className: "mt-4 text-2xl font-semibold text-gray-900", children: "Create your account" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Sign up to start managing Catalogus content." })
    ] }),
    /* @__PURE__ */ jsxs("form", { className: "space-y-4", onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Full name" }),
        /* @__PURE__ */ jsx("input", { type: "text", required: true, value: name, onChange: (e) => setName(e.target.value), className: "w-full rounded-xl border border-gray-300 px-3 py-3 text-sm focus:border-black focus:outline-none", placeholder: "Your name" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Email" }),
        /* @__PURE__ */ jsx("input", { type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), className: "w-full rounded-xl border border-gray-300 px-3 py-3 text-sm focus:border-black focus:outline-none", placeholder: "you@example.com" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Password" }),
        /* @__PURE__ */ jsx("input", { type: "password", required: true, value: password, onChange: (e) => setPassword(e.target.value), className: "w-full rounded-xl border border-gray-300 px-3 py-3 text-sm focus:border-black focus:outline-none", placeholder: "••••••••" })
      ] }),
      error && /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700", children: error }),
      successMessage && /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700", children: successMessage }),
      /* @__PURE__ */ jsx("button", { type: "submit", disabled: loading || submitting, className: "w-full rounded-xl bg-black text-white py-3 text-sm font-semibold hover:bg-gray-900 disabled:opacity-60 disabled:cursor-not-allowed", children: submitting ? "Creating account..." : "Create account" })
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "mt-4 text-center text-sm text-gray-500", children: [
      "Already have an account?",
      " ",
      /* @__PURE__ */ jsx(Link, { to: "/auth/sign-in", className: "font-semibold text-gray-900 underline", children: "Sign in" })
    ] })
  ] }) });
}
export {
  SignUpPage as component
};
