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
function AuthorSignUpPage() {
  const {
    signUpAuthor
  } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    bio: ""
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value
    }));
  };
  const handleFileChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    setPhotoFile(file);
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setSubmitting(true);
    try {
      const {
        error
      } = await signUpAuthor(formData.email, formData.password, formData.name, formData.phone, formData.bio, photoFile);
      if (error) {
        toast.error(error.message || "Failed to sign up");
        return;
      }
      toast.success("Account created successfully! Awaiting admin approval. You can now sign in.");
      navigate({
        to: "/author/sign-in"
      });
    } catch (err) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Author Sign Up" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600", children: "Create your author account to start publishing" })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs(Label, { htmlFor: "name", children: [
          "Full Name ",
          /* @__PURE__ */ jsx("span", { className: "text-red-500", children: "*" })
        ] }),
        /* @__PURE__ */ jsx(Input, { id: "name", type: "text", value: formData.name, onChange: (e) => handleChange("name", e.target.value), required: true, minLength: 2, maxLength: 100, placeholder: "John Doe" })
      ] }),
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
        /* @__PURE__ */ jsx(Input, { id: "password", type: "password", value: formData.password, onChange: (e) => handleChange("password", e.target.value), required: true, minLength: 8, placeholder: "Minimum 8 characters" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs(Label, { htmlFor: "confirmPassword", children: [
          "Confirm Password ",
          /* @__PURE__ */ jsx("span", { className: "text-red-500", children: "*" })
        ] }),
        /* @__PURE__ */ jsx(Input, { id: "confirmPassword", type: "password", value: formData.confirmPassword, onChange: (e) => handleChange("confirmPassword", e.target.value), required: true, minLength: 8, placeholder: "Re-enter password" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "phone", children: "Phone (optional)" }),
        /* @__PURE__ */ jsx(Input, { id: "phone", type: "tel", value: formData.phone, onChange: (e) => handleChange("phone", e.target.value), placeholder: "+258 84 123 4567" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "bio", children: "Bio (optional)" }),
        /* @__PURE__ */ jsx("textarea", { id: "bio", value: formData.bio, onChange: (e) => handleChange("bio", e.target.value), maxLength: 500, rows: 3, placeholder: "Tell us about yourself (max 500 characters)", className: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500", children: [
          formData.bio.length,
          "/500 characters"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "photo", children: "Profile Photo (optional)" }),
        photoPreview && /* @__PURE__ */ jsx("div", { className: "mb-2", children: /* @__PURE__ */ jsx("img", { src: photoPreview, alt: "Preview", className: "h-24 w-24 rounded-lg object-cover border border-gray-200" }) }),
        /* @__PURE__ */ jsx(Input, { id: "photo", type: "file", accept: "image/jpeg,image/png,image/webp,image/gif", onChange: handleFileChange }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Max 5MB. Supported formats: JPG, PNG, WEBP, GIF" })
      ] }),
      /* @__PURE__ */ jsx(Button, { type: "submit", disabled: submitting, className: "w-full", children: submitting ? "Creating Account..." : "Sign Up" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 text-center text-sm text-gray-600", children: [
      "Already have an account?",
      " ",
      /* @__PURE__ */ jsx("a", { href: "/author/sign-in", className: "font-semibold text-gray-900 hover:underline", children: "Sign in" })
    ] })
  ] }) });
}
export {
  AuthorSignUpPage as component
};
