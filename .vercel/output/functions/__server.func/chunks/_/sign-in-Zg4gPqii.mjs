import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { u as useAuth } from "./router-BiReTygo.mjs";
import { I as Input, B as Button } from "./button-BUSE9ux3.mjs";
import { L as Label } from "./label-CgBM-p8u.mjs";
import { toast } from "sonner";
import "@tanstack/react-query";
import "@supabase/supabase-js";
import "./server.mjs";
import "node:async_hooks";
import "@tanstack/react-router/ssr/server";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
function AuthorSignInPage() {
  const {
    signIn,
    profile,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const {
        error
      } = await signIn(formData.email, formData.password);
      if (error) {
        toast.error(error.message || "Failed to sign in");
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (err) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };
  if (!loading && profile) {
    if (profile.role === "author") {
      if (profile.status === "pending") {
        toast.info("Your account is pending admin approval");
      } else if (profile.status === "rejected") {
        toast.error("Your account has been rejected. Please contact admin.");
      }
      navigate({
        to: "/author/profile"
      });
    } else if (profile.role === "admin") {
      navigate({
        to: "/admin/dashboard"
      });
    } else {
      navigate({
        to: "/"
      });
    }
  }
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Author Sign In" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600", children: "Sign in to manage your author profile" })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs(Label, { htmlFor: "email", children: [
          "Email ",
          /* @__PURE__ */ jsx("span", { className: "text-red-500", children: "*" })
        ] }),
        /* @__PURE__ */ jsx(Input, { id: "email", type: "email", value: formData.email, onChange: (e) => handleChange("email", e.target.value), required: true, placeholder: "author@example.com" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs(Label, { htmlFor: "password", children: [
          "Password ",
          /* @__PURE__ */ jsx("span", { className: "text-red-500", children: "*" })
        ] }),
        /* @__PURE__ */ jsx(Input, { id: "password", type: "password", value: formData.password, onChange: (e) => handleChange("password", e.target.value), required: true, placeholder: "Enter your password" })
      ] }),
      /* @__PURE__ */ jsx(Button, { type: "submit", disabled: submitting || loading, className: "w-full", children: submitting || loading ? "Signing In..." : "Sign In" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 text-center text-sm text-gray-600", children: [
      "Don't have an account?",
      " ",
      /* @__PURE__ */ jsx("a", { href: "/author/sign-up", className: "font-semibold text-gray-900 hover:underline", children: "Sign up" })
    ] })
  ] }) });
}
export {
  AuthorSignInPage as component
};
