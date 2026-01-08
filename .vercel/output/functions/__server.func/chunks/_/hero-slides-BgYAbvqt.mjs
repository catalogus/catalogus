import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { A as AdminGuard, D as DashboardLayout } from "./AdminGuard-DAXk2vKF.mjs";
import { B as Button, I as Input } from "./button-BUSE9ux3.mjs";
import { u as useAuth, s as supabase } from "./router-BiReTygo.mjs";
import { D as DropdownMenu, a as DropdownMenuTrigger, E as Ellipsis, b as DropdownMenuContent, c as DropdownMenuLabel, d as DropdownMenuSeparator, n as DropdownMenuItem, S as Sheet, j as SheetContent, k as SheetHeader, l as SheetTitle, m as SheetDescription } from "./sheet-B6u_Vcab.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-nB_ewZar.mjs";
import { toast } from "sonner";
import { L as Label } from "./label-CgBM-p8u.mjs";
import { E as Eye } from "./eye.mjs";
import { c as createLucideIcon } from "./x.mjs";
import "@tanstack/react-router";
import "./search.mjs";
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
import "@radix-ui/react-label";
const __iconNode = [
  [
    "path",
    {
      d: "M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",
      key: "ct8e1f"
    }
  ],
  ["path", { d: "M14.084 14.158a3 3 0 0 1-4.242-4.242", key: "151rxh" }],
  [
    "path",
    {
      d: "M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",
      key: "13bj9a"
    }
  ],
  ["path", { d: "m2 2 20 20", key: "1ooewy" }]
];
const EyeOff = createLucideIcon("eye-off", __iconNode);
const defaultValues = {
  title: "",
  subtitle: "",
  description: "",
  cta_text: "",
  cta_url: "",
  background_image_url: "",
  background_image_path: "",
  accent_color: "",
  content_type: "custom",
  content_id: null,
  order_weight: 0,
  is_active: true
};
function HeroSlideForm({
  initial,
  onSubmit,
  onCancel,
  submitting = false,
  books,
  authors,
  posts
}) {
  const maxImageSize = 5 * 1024 * 1024;
  const [values, setValues] = useState({
    ...defaultValues,
    ...initial
  });
  const [imagePreview, setImagePreview] = useState(
    initial?.background_image_url ?? null
  );
  const [file, setFile] = useState(null);
  const accentPickerValue = /^#[0-9a-fA-F]{6}$/.test(values.accent_color) ? values.accent_color : "#4b5563";
  const handleChange = (key, value) => {
    setValues((prev) => ({
      ...prev,
      [key]: value
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!values.title.trim()) {
      toast.error("Title is required");
      return;
    }
    try {
      await onSubmit(values, file);
    } catch (error) {
      console.error("Submit error:", error);
    }
  };
  const getContentOptions = () => {
    switch (values.content_type) {
      case "book":
        return books;
      case "author":
        return authors;
      case "post":
        return posts;
      default:
        return [];
    }
  };
  const getContentLabel = (item) => {
    if (values.content_type === "author") {
      return item.name;
    }
    return item.title;
  };
  useEffect(() => {
    if (values.content_type === "custom" || !values.content_id) {
      return;
    }
    let autoUrl = "";
    switch (values.content_type) {
      case "book":
        autoUrl = `/livro/${values.content_id}`;
        break;
      case "author":
        autoUrl = `/autor/${values.content_id}`;
        break;
      case "post":
        autoUrl = `/post/${values.content_id}`;
        break;
    }
    if (autoUrl && values.cta_url !== autoUrl) {
      handleChange("cta_url", autoUrl);
    }
  }, [values.content_type, values.content_id]);
  return /* @__PURE__ */ jsxs("form", { className: "space-y-6", onSubmit: handleSubmit, children: [
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx(Label, { children: "Background Image" }),
      /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(
          "label",
          {
            htmlFor: "background-image",
            className: "inline-flex cursor-pointer items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100",
            children: "Choose file"
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            id: "background-image",
            type: "file",
            accept: "image/*",
            onChange: (e) => {
              const selected = e.target.files?.[0] ?? null;
              if (selected && selected.size > maxImageSize) {
                toast.error("Background image must be 5MB or less.");
                e.currentTarget.value = "";
                return;
              }
              setFile(selected);
              if (selected) {
                setImagePreview(URL.createObjectURL(selected));
              }
            },
            className: "hidden"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col text-sm text-gray-600", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: file?.name ?? imagePreview ? "Preview loaded" : "No file chosen" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500", children: "JPG/PNG, up to 5MB" })
        ] }),
        imagePreview && /* @__PURE__ */ jsx(
          "img",
          {
            src: imagePreview,
            alt: "Background preview",
            className: "h-20 w-32 rounded-md border border-gray-200 object-cover ml-auto"
          }
        )
      ] }) }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Upload a landscape image optimized for hero display (recommended: 1920x1080)" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "title", children: "Title *" }),
      /* @__PURE__ */ jsx(
        Input,
        {
          id: "title",
          required: true,
          value: values.title,
          onChange: (e) => handleChange("title", e.target.value),
          placeholder: "Enter slide title"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "subtitle", children: "Subtitle" }),
      /* @__PURE__ */ jsx(
        Input,
        {
          id: "subtitle",
          value: values.subtitle,
          onChange: (e) => handleChange("subtitle", e.target.value),
          placeholder: "Enter subtitle (optional)"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "description", children: "Description" }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          id: "description",
          value: values.description,
          onChange: (e) => handleChange("description", e.target.value),
          className: "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          rows: 3,
          placeholder: "Brief description of the slide"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "cta_text", children: "Call-to-Action Text" }),
      /* @__PURE__ */ jsx(
        Input,
        {
          id: "cta_text",
          value: values.cta_text,
          onChange: (e) => handleChange("cta_text", e.target.value),
          placeholder: "e.g., Explorar, Ver Mais, Saber Mais"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "cta_url", children: "Call-to-Action URL" }),
      /* @__PURE__ */ jsx(
        Input,
        {
          id: "cta_url",
          value: values.cta_url,
          onChange: (e) => handleChange("cta_url", e.target.value),
          placeholder: "/livros, /autores, https://...",
          disabled: values.content_type !== "custom" && !!values.content_id
        }
      ),
      values.content_type !== "custom" && values.content_id ? /* @__PURE__ */ jsxs("p", { className: "text-xs text-blue-600", children: [
        "Auto-populated from selected ",
        values.content_type,
        '. Change content type to "Custom" to edit manually.'
      ] }) : /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Enter a relative path (/livros) or absolute URL (https://example.com)" })
    ] }),
    values.content_type === "author" && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "accent_color", children: "Accent Color" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            id: "accent_color",
            type: "color",
            value: accentPickerValue,
            onChange: (e) => handleChange("accent_color", e.target.value),
            className: "h-10 w-14 cursor-pointer rounded border border-gray-300 bg-white p-1"
          }
        ),
        /* @__PURE__ */ jsx(
          Input,
          {
            type: "text",
            value: values.accent_color,
            onChange: (e) => handleChange("accent_color", e.target.value),
            placeholder: "#4b5563"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Used as the background for Author Highlight slides." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "content_type", children: "Content Type" }),
      /* @__PURE__ */ jsxs(
        "select",
        {
          id: "content_type",
          value: values.content_type,
          onChange: (e) => {
            const newType = e.target.value;
            handleChange("content_type", newType);
            handleChange("content_id", null);
            if (newType !== "author") {
              handleChange("accent_color", "");
            }
          },
          className: "w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2",
          children: [
            /* @__PURE__ */ jsx("option", { value: "custom", children: "Custom (standalone slide)" }),
            /* @__PURE__ */ jsx("option", { value: "book", children: "Book Highlight" }),
            /* @__PURE__ */ jsx("option", { value: "author", children: "Author Highlight" }),
            /* @__PURE__ */ jsx("option", { value: "post", children: "Post Highlight" })
          ]
        }
      ),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: 'Select what this slide should highlight. Choose "Custom" for standalone slides.' })
    ] }),
    values.content_type !== "custom" && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxs(Label, { htmlFor: "content_id", children: [
        "Select ",
        values.content_type === "book" ? "Book" : values.content_type === "author" ? "Author" : "Post"
      ] }),
      /* @__PURE__ */ jsxs(
        "select",
        {
          id: "content_id",
          value: values.content_id ?? "",
          onChange: (e) => handleChange("content_id", e.target.value || null),
          className: "w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2",
          children: [
            /* @__PURE__ */ jsxs("option", { value: "", children: [
              "-- Select ",
              values.content_type,
              " --"
            ] }),
            getContentOptions().map((item) => /* @__PURE__ */ jsx("option", { value: item.id, children: getContentLabel(item) }, item.id))
          ]
        }
      ),
      getContentOptions().length === 0 && /* @__PURE__ */ jsxs("p", { className: "text-xs text-amber-600", children: [
        "No ",
        values.content_type,
        's available. Create one first or select "Custom" type.'
      ] }),
      values.content_type === "author" && /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Only featured authors appear here. Mark authors as featured in the Authors admin." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "order_weight", children: "Order Weight" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "order_weight",
            type: "number",
            value: values.order_weight,
            onChange: (e) => handleChange("order_weight", parseInt(e.target.value, 10) || 0),
            placeholder: "0"
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Lower numbers appear first in the carousel" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "is_active", children: "Status" }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-4 pt-2", children: /* @__PURE__ */ jsxs("label", { className: "inline-flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              checked: values.is_active,
              onChange: (e) => handleChange("is_active", e.target.checked),
              className: "h-4 w-4 rounded border-gray-300"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: "Active (visible on homepage)" })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 pt-4 border-t border-gray-200", children: [
      /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", onClick: onCancel, children: "Cancel" }),
      /* @__PURE__ */ jsx(Button, { type: "submit", disabled: submitting, children: submitting ? "Saving…" : "Save Slide" })
    ] })
  ] });
}
function AdminHeroSlidesPage() {
  const {
    profile,
    session,
    signOut
  } = useAuth();
  const userName = profile?.name ?? session?.user.email ?? "Admin";
  const userEmail = session?.user.email ?? "";
  const supabaseUrl = "https://kakesgsqdjhrbcdhicey.supabase.co";
  const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtha2VzZ3NxZGpocmJjZGhpY2V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NjkyODYsImV4cCI6MjA4MzA0NTI4Nn0.nuQZcCOQnfNZ7S3VLSrn0cmDz7-hkRYX-RNsI3a_1iw";
  const queryClient = useQueryClient();
  const withTimeout = async (promise, ms, label) => {
    let timeoutId = null;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`${label} timed out. Check network or Supabase policies.`));
      }, ms);
    });
    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  };
  const [showForm, setShowForm] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const slidesQuery = useQuery({
    queryKey: ["admin", "hero-slides"],
    queryFn: async () => {
      const {
        data,
        error
      } = await withTimeout(supabase.from("hero_slides").select("*").order("order_weight", {
        ascending: true
      }), 15e3, "Hero slides query");
      if (error) throw error;
      return data;
    },
    staleTime: 3e4
  });
  const booksQuery = useQuery({
    queryKey: ["admin", "books-for-hero"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("books").select("id, title, cover_url").order("title", {
        ascending: true
      });
      if (error) throw error;
      return data;
    },
    staleTime: 6e4
  });
  const authorsQuery = useQuery({
    queryKey: ["admin", "authors-for-hero"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("authors").select("id, name, photo_url").eq("featured", true).order("name", {
        ascending: true
      });
      if (error) throw error;
      return data;
    },
    staleTime: 6e4
  });
  const postsQuery = useQuery({
    queryKey: ["admin", "posts-for-hero"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("posts").select("id, title, featured_image_url").eq("status", "published").order("title", {
        ascending: true
      });
      if (error) throw error;
      return data;
    },
    staleTime: 6e4
  });
  const uploadBackgroundImage = async (file, slideId) => {
    const maxImageSize = 5 * 1024 * 1024;
    if (file.size > maxImageSize) {
      throw new Error("Background image must be 5MB or less.");
    }
    const accessToken = session?.access_token;
    if (!accessToken) {
      throw new Error("Missing auth session. Please sign in again.");
    }
    const path = `hero-backgrounds/${slideId}/${Date.now()}-${file.name}`;
    const encodedPath = path.split("/").map(encodeURIComponent).join("/");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6e4);
    try {
      const response = await fetch(`${supabaseUrl}/storage/v1/object/hero-backgrounds/${encodedPath}`, {
        method: "POST",
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": file.type || "application/octet-stream",
          "x-upsert": "true"
        },
        body: file,
        signal: controller.signal
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Image upload failed (${response.status}).`);
      }
    } finally {
      clearTimeout(timeoutId);
    }
    const {
      data
    } = supabase.storage.from("hero-backgrounds").getPublicUrl(path);
    return {
      path,
      publicUrl: data.publicUrl
    };
  };
  const insertSlideViaRest = async (slide) => {
    const accessToken = session?.access_token;
    if (!accessToken) {
      throw new Error("Missing auth session. Please sign in again.");
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15e3);
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/hero_slides`, {
        method: "POST",
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: JSON.stringify([slide]),
        signal: controller.signal
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Slide insert failed (${response.status}).`);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  };
  const updateSlideViaRest = async (id, patch) => {
    const accessToken = session?.access_token;
    if (!accessToken) {
      throw new Error("Missing auth session. Please sign in again.");
    }
    const idFilter = `id=eq.${id}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15e3);
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/hero_slides?${idFilter}`, {
        method: "PATCH",
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: JSON.stringify(patch),
        signal: controller.signal
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Slide update failed (${response.status}).`);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  };
  const deleteSlideViaRest = async (id) => {
    const accessToken = session?.access_token;
    if (!accessToken) {
      throw new Error("Missing auth session. Please sign in again.");
    }
    const idFilter = `id=eq.${id}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15e3);
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/hero_slides?${idFilter}`, {
        method: "DELETE",
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${accessToken}`,
          Prefer: "return=minimal"
        },
        signal: controller.signal
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Slide delete failed (${response.status}).`);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  };
  const upsertSlide = useMutation({
    mutationFn: async (payload) => {
      const resolvedSlideId = payload.id ?? crypto.randomUUID();
      let slideId = payload.id ?? null;
      let background_image_url = payload.background_image_url;
      let background_image_path = payload.background_image_path;
      if (payload.file) {
        const uploaded = await uploadBackgroundImage(payload.file, resolvedSlideId);
        background_image_url = uploaded.publicUrl;
        background_image_path = uploaded.path;
      }
      const base = {
        title: payload.title,
        subtitle: payload.subtitle || null,
        description: payload.description || null,
        cta_text: payload.cta_text || null,
        cta_url: payload.cta_url || null,
        background_image_url,
        background_image_path,
        accent_color: payload.accent_color || null,
        content_type: payload.content_type,
        content_id: payload.content_id,
        order_weight: payload.order_weight,
        is_active: payload.is_active
      };
      if (payload.id) {
        await updateSlideViaRest(payload.id, base);
        slideId = payload.id;
      } else {
        base.id = resolvedSlideId;
        await insertSlideViaRest(base);
        slideId = resolvedSlideId;
      }
      return slideId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "hero-slides"]
      });
      setShowForm(false);
      setEditingSlide(null);
      toast.success("Hero slide saved");
    },
    onError: (err) => {
      toast.error(err?.message ?? "Failed to save hero slide");
    }
  });
  const deleteSlide = useMutation({
    mutationFn: async (id) => {
      await deleteSlideViaRest(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "hero-slides"]
      });
      toast.success("Hero slide deleted");
    },
    onError: (err) => toast.error(err.message ?? "Failed to delete hero slide")
  });
  const toggleActive = useMutation({
    mutationFn: async (payload) => {
      await updateSlideViaRest(payload.id, {
        is_active: payload.is_active
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "hero-slides"]
      });
      toast.success("Status updated");
    },
    onError: (err) => toast.error(err.message ?? "Failed to update status")
  });
  const getContentTypeLabel = (type) => {
    switch (type) {
      case "book":
        return "Book";
      case "author":
        return "Author";
      case "post":
        return "Post";
      case "custom":
        return "Custom";
      default:
        return type;
    }
  };
  const getLinkedContentName = (slide) => {
    if (slide.content_type === "custom" || !slide.content_id) {
      return "-";
    }
    if (slide.content_type === "book") {
      const book = booksQuery.data?.find((b) => b.id === slide.content_id);
      return book?.title ?? "Unknown";
    }
    if (slide.content_type === "author") {
      const author = authorsQuery.data?.find((a) => a.id === slide.content_id);
      return author?.name ?? "Unknown";
    }
    if (slide.content_type === "post") {
      const post = postsQuery.data?.find((p) => p.id === slide.content_id);
      return post?.title ?? "Unknown";
    }
    return "-";
  };
  return /* @__PURE__ */ jsx(AdminGuard, { children: /* @__PURE__ */ jsx(DashboardLayout, { userRole: profile?.role ?? "admin", userName, userEmail, onSignOut: signOut, children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm uppercase text-gray-500", children: "Content" }),
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-gray-900", children: "Hero Slides" })
      ] }),
      /* @__PURE__ */ jsx(Button, { onClick: () => {
        setEditingSlide(null);
        setShowForm(true);
      }, children: "New Slide" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-gray-200 bg-white overflow-hidden", children: slidesQuery.isLoading ? /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 p-4", children: "Loading hero slides..." }) : slidesQuery.isError ? /* @__PURE__ */ jsx("p", { className: "text-sm text-rose-600 p-4", children: "Failed to load hero slides. Check connection or permissions." }) : (slidesQuery.data?.length ?? 0) === 0 ? /* @__PURE__ */ jsxs("div", { className: "p-8 text-center space-y-3", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "No hero slides yet" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: "Create your first hero slide to showcase content on the homepage." }),
      /* @__PURE__ */ jsx(Button, { onClick: () => {
        setEditingSlide(null);
        setShowForm(true);
      }, children: "Create First Slide" })
    ] }) : /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableHead, { className: "w-20", children: "Thumbnail" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Title" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Content Type" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Linked Content" }),
        /* @__PURE__ */ jsx(TableHead, { className: "w-24", children: "Order" }),
        /* @__PURE__ */ jsx(TableHead, { className: "w-20", children: "Active" }),
        /* @__PURE__ */ jsx(TableHead, { className: "w-16", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { children: slidesQuery.data?.map((slide) => /* @__PURE__ */ jsxs(TableRow, { className: "hover:bg-gray-50", children: [
        /* @__PURE__ */ jsx(TableCell, { children: slide.background_image_url ? /* @__PURE__ */ jsx("img", { src: slide.background_image_url, alt: slide.title, className: "h-12 w-20 object-cover rounded border border-gray-200" }) : /* @__PURE__ */ jsx("div", { className: "h-12 w-20 bg-gray-100 rounded border border-gray-200 flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-400", children: "No image" }) }) }),
        /* @__PURE__ */ jsx(TableCell, { className: "font-medium text-gray-900", children: slide.title }),
        /* @__PURE__ */ jsx(TableCell, { className: "text-gray-600", children: getContentTypeLabel(slide.content_type) }),
        /* @__PURE__ */ jsx(TableCell, { className: "text-gray-600", children: getLinkedContentName(slide) }),
        /* @__PURE__ */ jsx(TableCell, { className: "text-gray-600", children: slide.order_weight }),
        /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("button", { type: "button", onClick: () => toggleActive.mutate({
          id: slide.id,
          is_active: !slide.is_active
        }), className: "flex items-center gap-1 text-sm", children: slide.is_active ? /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4 text-green-600" }) : /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4 text-gray-400" }) }) }),
        /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs(DropdownMenu, { children: [
          /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", children: /* @__PURE__ */ jsx(Ellipsis, { className: "h-4 w-4" }) }) }),
          /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", children: [
            /* @__PURE__ */ jsx(DropdownMenuLabel, { children: "Actions" }),
            /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
            /* @__PURE__ */ jsx(DropdownMenuItem, { onClick: () => {
              setEditingSlide(slide);
              setShowForm(true);
            }, children: "Edit" }),
            /* @__PURE__ */ jsx(DropdownMenuItem, { onClick: () => toggleActive.mutate({
              id: slide.id,
              is_active: !slide.is_active
            }), children: slide.is_active ? "Deactivate" : "Activate" }),
            /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
            /* @__PURE__ */ jsx(DropdownMenuItem, { className: "text-destructive focus:text-destructive", onClick: () => {
              if (window.confirm("Are you sure you want to delete this slide?")) {
                deleteSlide.mutate(slide.id);
              }
            }, children: "Delete" })
          ] })
        ] }) })
      ] }, slide.id)) })
    ] }) }),
    /* @__PURE__ */ jsx(Sheet, { open: showForm, onOpenChange: setShowForm, children: /* @__PURE__ */ jsxs(SheetContent, { className: "w-full sm:max-w-2xl px-4 overflow-hidden", children: [
      /* @__PURE__ */ jsxs(SheetHeader, { children: [
        /* @__PURE__ */ jsx(SheetTitle, { children: editingSlide ? "Edit Hero Slide" : "New Hero Slide" }),
        /* @__PURE__ */ jsx(SheetDescription, { children: "Create and manage hero slides for the homepage carousel." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "pt-4 max-h-[85vh] overflow-y-auto pr-2", children: /* @__PURE__ */ jsx(HeroSlideForm, { initial: editingSlide ? {
        title: editingSlide.title,
        subtitle: editingSlide.subtitle ?? "",
        description: editingSlide.description ?? "",
        cta_text: editingSlide.cta_text ?? "",
        cta_url: editingSlide.cta_url ?? "",
        background_image_url: editingSlide.background_image_url ?? "",
        background_image_path: editingSlide.background_image_path ?? "",
        accent_color: editingSlide.accent_color ?? "",
        content_type: editingSlide.content_type,
        content_id: editingSlide.content_id,
        order_weight: editingSlide.order_weight,
        is_active: editingSlide.is_active
      } : void 0, submitting: upsertSlide.isPending, onSubmit: async (vals, file) => {
        await upsertSlide.mutateAsync({
          ...vals,
          id: editingSlide?.id,
          file
        });
      }, books: booksQuery.data ?? [], authors: authorsQuery.data ?? [], posts: postsQuery.data ?? [], onCancel: () => {
        setShowForm(false);
        setEditingSlide(null);
      } }) })
    ] }) })
  ] }) }) });
}
export {
  AdminHeroSlidesPage as component
};
