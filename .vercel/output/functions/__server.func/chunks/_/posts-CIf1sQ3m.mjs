import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useCallback, useEffect } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { A as AdminGuard, D as DashboardLayout, I as Image$1 } from "./AdminGuard-DAXk2vKF.mjs";
import { B as Button, I as Input } from "./button-BUSE9ux3.mjs";
import { u as useAuth, s as supabase } from "./router-BiReTygo.mjs";
import { D as DropdownMenu, a as DropdownMenuTrigger, E as Ellipsis, b as DropdownMenuContent, c as DropdownMenuLabel, d as DropdownMenuSeparator, n as DropdownMenuItem, S as Sheet, j as SheetContent, k as SheetHeader, l as SheetTitle, m as SheetDescription } from "./sheet-B6u_Vcab.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-nB_ewZar.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle } from "./dialog-DxttVJL3.mjs";
import { L as Label } from "./label-CgBM-p8u.mjs";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link$1 from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { toast } from "sonner";
import { S as Search } from "./search.mjs";
import { c as createLucideIcon, U as User } from "./x.mjs";
import { T as Trash2 } from "./trash-2.mjs";
import { C as ChevronLeft } from "./chevron-left.mjs";
import { C as ChevronRight } from "./chevron-right.mjs";
import { C as Calendar } from "./calendar.mjs";
import { E as Eye } from "./eye.mjs";
import "@tanstack/react-router";
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
import "@radix-ui/react-label";
const __iconNode$c = [
  [
    "path",
    { d: "M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8", key: "mg9rjx" }
  ]
];
const Bold = createLucideIcon("bold", __iconNode$c);
const __iconNode$b = [
  [
    "path",
    {
      d: "m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2",
      key: "usdka0"
    }
  ]
];
const FolderOpen = createLucideIcon("folder-open", __iconNode$b);
const __iconNode$a = [
  ["path", { d: "M4 12h8", key: "17cfdx" }],
  ["path", { d: "M4 18V6", key: "1rz3zl" }],
  ["path", { d: "M12 18V6", key: "zqpxq5" }],
  ["path", { d: "m17 12 3-2v8", key: "1hhhft" }]
];
const Heading1 = createLucideIcon("heading-1", __iconNode$a);
const __iconNode$9 = [
  ["path", { d: "M4 12h8", key: "17cfdx" }],
  ["path", { d: "M4 18V6", key: "1rz3zl" }],
  ["path", { d: "M12 18V6", key: "zqpxq5" }],
  ["path", { d: "M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1", key: "9jr5yi" }]
];
const Heading2 = createLucideIcon("heading-2", __iconNode$9);
const __iconNode$8 = [
  ["line", { x1: "19", x2: "10", y1: "4", y2: "4", key: "15jd3p" }],
  ["line", { x1: "14", x2: "5", y1: "20", y2: "20", key: "bu0au3" }],
  ["line", { x1: "15", x2: "9", y1: "4", y2: "20", key: "uljnxc" }]
];
const Italic = createLucideIcon("italic", __iconNode$8);
const __iconNode$7 = [
  ["path", { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71", key: "1cjeqo" }],
  ["path", { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71", key: "19qd67" }]
];
const Link = createLucideIcon("link", __iconNode$7);
const __iconNode$6 = [
  ["path", { d: "M11 5h10", key: "1cz7ny" }],
  ["path", { d: "M11 12h10", key: "1438ji" }],
  ["path", { d: "M11 19h10", key: "11t30w" }],
  ["path", { d: "M4 4h1v5", key: "10yrso" }],
  ["path", { d: "M4 9h2", key: "r1h2o0" }],
  ["path", { d: "M6.5 20H3.4c0-1 2.6-1.925 2.6-3.5a1.5 1.5 0 0 0-2.6-1.02", key: "xtkcd5" }]
];
const ListOrdered = createLucideIcon("list-ordered", __iconNode$6);
const __iconNode$5 = [
  ["path", { d: "M3 5h.01", key: "18ugdj" }],
  ["path", { d: "M3 12h.01", key: "nlz23k" }],
  ["path", { d: "M3 19h.01", key: "noohij" }],
  ["path", { d: "M8 5h13", key: "1pao27" }],
  ["path", { d: "M8 12h13", key: "1za7za" }],
  ["path", { d: "M8 19h13", key: "m83p4d" }]
];
const List = createLucideIcon("list", __iconNode$5);
const __iconNode$4 = [
  [
    "path",
    { d: "M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344", key: "2acyp4" }
  ],
  ["path", { d: "m9 11 3 3L22 4", key: "1pflzl" }]
];
const SquareCheckBig = createLucideIcon("square-check-big", __iconNode$4);
const __iconNode$3 = [
  [
    "path",
    {
      d: "M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z",
      key: "vktsd0"
    }
  ],
  ["circle", { cx: "7.5", cy: "7.5", r: ".5", fill: "currentColor", key: "kqv944" }]
];
const Tag = createLucideIcon("tag", __iconNode$3);
const __iconNode$2 = [
  ["path", { d: "M21 5H3", key: "1fi0y6" }],
  ["path", { d: "M17 12H7", key: "16if0g" }],
  ["path", { d: "M19 19H5", key: "vjpgq2" }]
];
const TextAlignCenter = createLucideIcon("text-align-center", __iconNode$2);
const __iconNode$1 = [
  ["path", { d: "M21 5H3", key: "1fi0y6" }],
  ["path", { d: "M21 12H9", key: "dn1m92" }],
  ["path", { d: "M21 19H7", key: "4cu937" }]
];
const TextAlignEnd = createLucideIcon("text-align-end", __iconNode$1);
const __iconNode = [
  ["path", { d: "M21 5H3", key: "1fi0y6" }],
  ["path", { d: "M15 12H3", key: "6jk70r" }],
  ["path", { d: "M17 19H3", key: "z6ezky" }]
];
const TextAlignStart = createLucideIcon("text-align-start", __iconNode);
function TipTapEditor({
  content,
  onUpdate,
  placeholder = "Start writing..."
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg"
        }
      }),
      Link$1.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 hover:text-blue-700 underline"
        }
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"]
      }),
      Placeholder.configure({
        placeholder
      })
    ],
    content,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[300px] p-4"
      }
    },
    onUpdate: ({ editor: editor2 }) => {
      const html = editor2.getHTML();
      onUpdate(html);
    }
  });
  const uploadImage = async (file) => {
    try {
      const path = `post-images/temp/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("post-images").upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("post-images").getPublicUrl(path);
      return data.publicUrl;
    } catch (error) {
      console.error("Image upload error:", error);
      throw error;
    }
  };
  const addImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const url = await uploadImage(file);
        editor?.chain().focus().setImage({ src: url }).run();
        toast.success("Image uploaded");
      } catch (err) {
        toast.error("Failed to upload image");
      }
    };
    input.click();
  };
  const setLink = () => {
    const url = window.prompt("Enter URL:");
    if (!url) return;
    editor?.chain().focus().setLink({ href: url }).run();
  };
  if (!editor) return null;
  return /* @__PURE__ */ jsxs("div", { className: "border border-gray-300 rounded-lg overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50", children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "button",
          size: "sm",
          variant: editor.isActive("bold") ? "default" : "ghost",
          onClick: () => editor.chain().focus().toggleBold().run(),
          title: "Bold",
          children: /* @__PURE__ */ jsx(Bold, { className: "h-4 w-4" })
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "button",
          size: "sm",
          variant: editor.isActive("italic") ? "default" : "ghost",
          onClick: () => editor.chain().focus().toggleItalic().run(),
          title: "Italic",
          children: /* @__PURE__ */ jsx(Italic, { className: "h-4 w-4" })
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "w-px h-6 bg-gray-300 mx-1" }),
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "button",
          size: "sm",
          variant: editor.isActive("heading", { level: 1 }) ? "default" : "ghost",
          onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
          title: "Heading 1",
          children: /* @__PURE__ */ jsx(Heading1, { className: "h-4 w-4" })
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "button",
          size: "sm",
          variant: editor.isActive("heading", { level: 2 }) ? "default" : "ghost",
          onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
          title: "Heading 2",
          children: /* @__PURE__ */ jsx(Heading2, { className: "h-4 w-4" })
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "w-px h-6 bg-gray-300 mx-1" }),
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "button",
          size: "sm",
          variant: editor.isActive("bulletList") ? "default" : "ghost",
          onClick: () => editor.chain().focus().toggleBulletList().run(),
          title: "Bullet List",
          children: /* @__PURE__ */ jsx(List, { className: "h-4 w-4" })
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "button",
          size: "sm",
          variant: editor.isActive("orderedList") ? "default" : "ghost",
          onClick: () => editor.chain().focus().toggleOrderedList().run(),
          title: "Ordered List",
          children: /* @__PURE__ */ jsx(ListOrdered, { className: "h-4 w-4" })
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "w-px h-6 bg-gray-300 mx-1" }),
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "button",
          size: "sm",
          variant: editor.isActive({ textAlign: "left" }) ? "default" : "ghost",
          onClick: () => editor.chain().focus().setTextAlign("left").run(),
          title: "Align Left",
          children: /* @__PURE__ */ jsx(TextAlignStart, { className: "h-4 w-4" })
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "button",
          size: "sm",
          variant: editor.isActive({ textAlign: "center" }) ? "default" : "ghost",
          onClick: () => editor.chain().focus().setTextAlign("center").run(),
          title: "Align Center",
          children: /* @__PURE__ */ jsx(TextAlignCenter, { className: "h-4 w-4" })
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "button",
          size: "sm",
          variant: editor.isActive({ textAlign: "right" }) ? "default" : "ghost",
          onClick: () => editor.chain().focus().setTextAlign("right").run(),
          title: "Align Right",
          children: /* @__PURE__ */ jsx(TextAlignEnd, { className: "h-4 w-4" })
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "w-px h-6 bg-gray-300 mx-1" }),
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "button",
          size: "sm",
          variant: "ghost",
          onClick: addImage,
          title: "Add Image",
          children: /* @__PURE__ */ jsx(Image$1, { className: "h-4 w-4" })
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "button",
          size: "sm",
          variant: editor.isActive("link") ? "default" : "ghost",
          onClick: setLink,
          title: "Add Link",
          children: /* @__PURE__ */ jsx(Link, { className: "h-4 w-4" })
        }
      )
    ] }),
    /* @__PURE__ */ jsx(EditorContent, { editor })
  ] });
}
const defaultValues = {
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  featured_image_url: "",
  featured_image_path: "",
  author_id: "",
  status: "draft",
  published_at: null,
  featured: false,
  language: "pt",
  category_ids: [],
  tag_ids: [],
  new_tags: []
};
function PostForm({
  initial,
  onSubmit,
  onCancel,
  submitting = false,
  categories,
  tags,
  onCreateTag,
  currentUserId = ""
}) {
  const maxFeaturedImageSize = 5 * 1024 * 1024;
  const [values, setValues] = useState({
    ...defaultValues,
    ...initial,
    author_id: initial?.author_id ?? currentUserId,
    category_ids: initial?.category_ids ?? defaultValues.category_ids,
    tag_ids: initial?.tag_ids ?? defaultValues.tag_ids,
    new_tags: initial?.new_tags ?? defaultValues.new_tags
  });
  const [imagePreview, setImagePreview] = useState(
    initial?.featured_image_url ?? null
  );
  const [file, setFile] = useState(null);
  const [localTags, setLocalTags] = useState(tags);
  const [newTagName, setNewTagName] = useState("");
  const [addingTag, setAddingTag] = useState(false);
  useEffect(() => {
    setLocalTags(tags);
  }, [tags]);
  const handleChange = (key, value) => {
    setValues((prev) => ({
      ...prev,
      [key]: value
    }));
  };
  const handleEditorUpdate = (html) => {
    setValues((prev) => ({
      ...prev,
      body: html
    }));
  };
  const handleSubmit = async (e, saveAs) => {
    e.preventDefault();
    e.stopPropagation();
    const slug = values.slug || values.title.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
    const finalValues = {
      ...values,
      slug,
      status: saveAs ?? values.status,
      published_at: saveAs === "published" ? (/* @__PURE__ */ new Date()).toISOString() : values.published_at
    };
    try {
      await onSubmit(finalValues, file);
    } catch (error) {
      console.error("Submit error:", error);
    }
  };
  const addTag = async () => {
    if (!onCreateTag) return;
    const name = newTagName.trim();
    if (!name) return;
    setAddingTag(true);
    try {
      const created = await onCreateTag(name);
      setLocalTags((prev) => [...prev, created]);
      handleChange("tag_ids", [...values.tag_ids, created.id]);
      setNewTagName("");
    } finally {
      setAddingTag(false);
    }
  };
  const buildCategoryTree = (categories2, parentId = null, depth = 0) => {
    const children = categories2.filter((cat) => cat.parent_id === parentId);
    const result = [];
    children.forEach((cat) => {
      result.push({ ...cat, depth });
      result.push(...buildCategoryTree(categories2, cat.id, depth + 1));
    });
    return result;
  };
  const categoriesTree = buildCategoryTree(categories);
  return /* @__PURE__ */ jsxs("form", { className: "space-y-6", onSubmit: (e) => handleSubmit(e), children: [
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "title", children: "Title" }),
      /* @__PURE__ */ jsx(
        Input,
        {
          id: "title",
          required: true,
          value: values.title,
          onChange: (e) => handleChange("title", e.target.value),
          placeholder: "Enter post title"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "slug", children: "Slug" }),
      /* @__PURE__ */ jsx(
        Input,
        {
          id: "slug",
          value: values.slug,
          onChange: (e) => handleChange("slug", e.target.value),
          placeholder: "Auto-generated from title"
        }
      ),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Leave blank to auto-generate from title" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx(Label, { children: "Content" }),
      /* @__PURE__ */ jsx(
        TipTapEditor,
        {
          content: values.body,
          onUpdate: handleEditorUpdate,
          placeholder: "Write your post content here..."
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "excerpt", children: "Excerpt" }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          id: "excerpt",
          value: values.excerpt,
          onChange: (e) => handleChange("excerpt", e.target.value),
          className: "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          rows: 3,
          placeholder: "Brief summary of the post"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx(Label, { children: "Featured Image" }),
      /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(
          "label",
          {
            htmlFor: "featured-image",
            className: "inline-flex cursor-pointer items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100",
            children: "Choose file"
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            id: "featured-image",
            type: "file",
            accept: "image/*",
            onChange: (e) => {
              const selected = e.target.files?.[0] ?? null;
              if (selected && selected.size > maxFeaturedImageSize) {
                toast.error("Featured image must be 5MB or less.");
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
            alt: "Featured image preview",
            className: "h-20 w-32 rounded-md border border-gray-200 object-cover ml-auto"
          }
        )
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx(Label, { children: "Categories" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Select one or more categories for this post." }),
      /* @__PURE__ */ jsxs("div", { className: "max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white p-3 space-y-1", children: [
        categoriesTree.map((category) => {
          const checked = values.category_ids.includes(category.id);
          return /* @__PURE__ */ jsxs(
            "label",
            {
              className: "flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 text-sm",
              style: { paddingLeft: `${category.depth * 1.5 + 0.5}rem` },
              children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "checkbox",
                    checked,
                    onChange: (e) => {
                      const next = e.target.checked ? [...values.category_ids, category.id] : values.category_ids.filter((id) => id !== category.id);
                      handleChange("category_ids", next);
                    },
                    className: "h-4 w-4 rounded border-gray-300"
                  }
                ),
                /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: category.name })
              ]
            },
            category.id
          );
        }),
        categoriesTree.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 px-2 py-1", children: "No categories available." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx(Label, { children: "Tags" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Select existing tags or create new ones." }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-2", children: [
        localTags.map((tag) => {
          const checked = values.tag_ids.includes(tag.id);
          return /* @__PURE__ */ jsxs(
            "label",
            {
              className: "flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50",
              children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "checkbox",
                    checked,
                    onChange: (e) => {
                      const next = e.target.checked ? [...values.tag_ids, tag.id] : values.tag_ids.filter((id) => id !== tag.id);
                      handleChange("tag_ids", next);
                    },
                    className: "h-4 w-4 rounded border-gray-300"
                  }
                ),
                /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: tag.name })
              ]
            },
            tag.id
          );
        }),
        localTags.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 col-span-full", children: "No tags yet." })
      ] }),
      onCreateTag && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 pt-2", children: [
        /* @__PURE__ */ jsx(
          Input,
          {
            placeholder: "New tag name",
            value: newTagName,
            onChange: (e) => setNewTagName(e.target.value),
            onKeyDown: (e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }
          }
        ),
        /* @__PURE__ */ jsx(Button, { type: "button", onClick: addTag, disabled: addingTag, children: addingTag ? "Adding…" : "Add Tag" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "status", children: "Status" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            id: "status",
            value: values.status,
            onChange: (e) => handleChange("status", e.target.value),
            className: "w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2",
            children: [
              /* @__PURE__ */ jsx("option", { value: "draft", children: "Draft" }),
              /* @__PURE__ */ jsx("option", { value: "published", children: "Published" }),
              /* @__PURE__ */ jsx("option", { value: "scheduled", children: "Scheduled" }),
              /* @__PURE__ */ jsx("option", { value: "pending", children: "Pending Review" }),
              /* @__PURE__ */ jsx("option", { value: "trash", children: "Trash" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "language", children: "Language" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            id: "language",
            value: values.language,
            onChange: (e) => handleChange("language", e.target.value),
            className: "w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2",
            children: [
              /* @__PURE__ */ jsx("option", { value: "pt", children: "Português" }),
              /* @__PURE__ */ jsx("option", { value: "en", children: "English" })
            ]
          }
        )
      ] })
    ] }),
    values.status === "scheduled" && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "published_at", children: "Publish Date & Time" }),
      /* @__PURE__ */ jsx(
        Input,
        {
          id: "published_at",
          type: "datetime-local",
          value: values.published_at ? new Date(values.published_at).toISOString().slice(0, 16) : "",
          onChange: (e) => handleChange("published_at", e.target.value ? new Date(e.target.value).toISOString() : null)
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex items-center gap-4", children: /* @__PURE__ */ jsxs("label", { className: "inline-flex items-center gap-2 text-sm", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "checkbox",
          checked: values.featured,
          onChange: (e) => handleChange("featured", e.target.checked),
          className: "h-4 w-4 rounded border-gray-300"
        }
      ),
      /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: "Featured Post" })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 pt-4 border-t border-gray-200", children: [
      /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", onClick: onCancel, children: "Cancel" }),
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "button",
          variant: "outline",
          onClick: (e) => handleSubmit(e, "draft"),
          disabled: submitting,
          children: "Save as Draft"
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "button",
          onClick: (e) => handleSubmit(e, "published"),
          disabled: submitting,
          children: submitting ? "Publishing…" : "Publish"
        }
      )
    ] })
  ] });
}
const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  published: "bg-green-100 text-green-800",
  scheduled: "bg-blue-100 text-blue-800",
  pending: "bg-yellow-100 text-yellow-800",
  trash: "bg-red-100 text-red-800"
};
const formatDate = (dateStr) => {
  if (!dateStr) return "Not set";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};
function PostDetail({ post }) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    post.featured_image_url && /* @__PURE__ */ jsx("div", { className: "w-full", children: /* @__PURE__ */ jsx(
      "img",
      {
        src: post.featured_image_url,
        alt: post.title,
        className: "w-full h-auto max-h-96 object-cover rounded-lg border border-gray-200"
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900", children: post.title }),
        /* @__PURE__ */ jsx(
          "span",
          {
            className: `inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusColors[post.status] ?? "bg-gray-100 text-gray-800"}`,
            children: post.status.charAt(0).toUpperCase() + post.status.slice(1)
          }
        )
      ] }),
      post.featured && /* @__PURE__ */ jsx("span", { className: "inline-flex items-center rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-xs font-medium", children: "⭐ Featured" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsx(User, { className: "h-4 w-4 text-gray-500" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Author" }),
          /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-900", children: post.author?.name ?? "Unknown" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4 text-gray-500" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Published" }),
          /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-900", children: formatDate(post.published_at) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4 text-gray-500" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Views" }),
          /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-900", children: post.view_count.toLocaleString() })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4 text-gray-500" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Last Updated" }),
          /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-900", children: formatDate(post.updated_at) })
        ] })
      ] })
    ] }),
    post.excerpt && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-gray-700", children: "Excerpt" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm italic text-gray-600 bg-gray-50 p-3 rounded-lg", children: post.excerpt })
    ] }),
    post.categories && post.categories.length > 0 && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(FolderOpen, { className: "h-4 w-4 text-gray-500" }),
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-gray-700", children: "Categories" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: post.categories.map((category) => /* @__PURE__ */ jsx(
        "span",
        {
          className: "inline-flex items-center rounded-md bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 border border-blue-200",
          children: category.name
        },
        category.id
      )) })
    ] }),
    post.tags && post.tags.length > 0 && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Tag, { className: "h-4 w-4 text-gray-500" }),
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-gray-700", children: "Tags" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: post.tags.map((tag) => /* @__PURE__ */ jsxs(
        "span",
        {
          className: "inline-flex items-center rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 border border-gray-200",
          children: [
            "#",
            tag.name
          ]
        },
        tag.id
      )) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-gray-700", children: "Content" }),
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "prose prose-sm max-w-none border-t border-gray-200 pt-4",
          dangerouslySetInnerHTML: { __html: post.body ?? "<p>No content</p>" }
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "border-t border-gray-200 pt-4 text-xs text-gray-500 space-y-1", children: [
      /* @__PURE__ */ jsxs("p", { children: [
        /* @__PURE__ */ jsx("strong", { children: "Slug:" }),
        " ",
        post.slug
      ] }),
      /* @__PURE__ */ jsxs("p", { children: [
        /* @__PURE__ */ jsx("strong", { children: "Language:" }),
        " ",
        post.language === "pt" ? "Português" : "English"
      ] }),
      /* @__PURE__ */ jsxs("p", { children: [
        /* @__PURE__ */ jsx("strong", { children: "Post Type:" }),
        " ",
        post.post_type
      ] }),
      /* @__PURE__ */ jsxs("p", { children: [
        /* @__PURE__ */ jsx("strong", { children: "Created:" }),
        " ",
        formatDate(post.created_at)
      ] })
    ] })
  ] });
}
function AdminPostsPage() {
  const {
    profile,
    session,
    signOut
  } = useAuth();
  const userName = profile?.name ?? session?.user.email ?? "Admin";
  const userEmail = session?.user.email ?? "";
  const currentUserId = session?.user.id ?? "";
  const supabaseUrl = "https://kakesgsqdjhrbcdhicey.supabase.co";
  const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtha2VzZ3NxZGpocmJjZGhpY2V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NjkyODYsImV4cCI6MjA4MzA0NTI4Nn0.nuQZcCOQnfNZ7S3VLSrn0cmDz7-hkRYX-RNsI3a_1iw";
  const queryClient = useQueryClient();
  const statusCountsKey = ["admin", "posts", "status-counts"];
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
  const [editingPost, setEditingPost] = useState(null);
  const [detailPost, setDetailPost] = useState(null);
  const [selectedIds, setSelectedIds] = useState(/* @__PURE__ */ new Set());
  const [filters, setFilters] = useState({
    search: "",
    status: "published",
    category_id: void 0,
    tag_id: void 0,
    sort_by: "newest",
    page: 1,
    per_page: 20
  });
  const categoriesQuery = useQuery({
    queryKey: ["admin", "post-categories"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("post_categories").select("*").eq("is_active", true).order("order_weight", {
        ascending: true
      });
      if (error) throw error;
      return data;
    },
    staleTime: 6e4
  });
  const tagsQuery = useQuery({
    queryKey: ["admin", "post-tags"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("post_tags").select("*").eq("is_active", true).order("name", {
        ascending: true
      });
      if (error) throw error;
      return data;
    },
    staleTime: 6e4
  });
  const buildPostsQueryKey = (activeFilters) => ["admin", "posts", activeFilters];
  const fetchPosts = useCallback(async (activeFilters) => {
    let query = supabase.from("posts").select(`
          *,
          categories:post_categories_map(category:post_categories(*)),
          tags:post_tags_map(tag:post_tags(*))
        `, {
      count: "exact"
    });
    if (activeFilters.status) {
      query = query.eq("status", activeFilters.status);
    }
    if (activeFilters.search) {
      query = query.or(`title.ilike.%${activeFilters.search}%,body.ilike.%${activeFilters.search}%`);
    }
    switch (activeFilters.sort_by) {
      case "oldest":
        query = query.order("created_at", {
          ascending: true
        });
        break;
      case "title_asc":
        query = query.order("title", {
          ascending: true
        });
        break;
      case "title_desc":
        query = query.order("title", {
          ascending: false
        });
        break;
      case "featured":
        query = query.order("featured", {
          ascending: false
        });
        break;
      default:
        query = query.order("created_at", {
          ascending: false
        });
    }
    const from = ((activeFilters.page ?? 1) - 1) * (activeFilters.per_page ?? 20);
    const to = from + (activeFilters.per_page ?? 20) - 1;
    query = query.range(from, to);
    const {
      data,
      error,
      count
    } = await withTimeout(query, 15e3, "Posts query");
    if (error) throw error;
    const authorIds = [...new Set(data?.map((p) => p.author_id).filter(Boolean))];
    let authorsMap = {};
    if (authorIds.length > 0) {
      const {
        data: profiles
      } = await supabase.from("profiles").select("id, name, email, photo_url").in("id", authorIds);
      if (profiles) {
        authorsMap = profiles.reduce((acc, profile2) => {
          acc[profile2.id] = profile2;
          return acc;
        }, {});
      }
    }
    const posts = (data ?? []).map((post) => ({
      ...post,
      author: post.author_id ? authorsMap[post.author_id] || null : null,
      categories: post.categories?.map((c) => c.category).filter(Boolean) ?? [],
      tags: post.tags?.map((t) => t.tag).filter(Boolean) ?? []
    }));
    return {
      posts,
      total: count ?? 0
    };
  }, [withTimeout]);
  const postsQueryKey = buildPostsQueryKey(filters);
  const postsQuery = useQuery({
    queryKey: postsQueryKey,
    queryFn: () => fetchPosts(filters),
    staleTime: 3e4
  });
  useEffect(() => {
    const statuses = ["published", "draft", "trash"];
    statuses.forEach((status) => {
      if (status === filters.status) return;
      const nextFilters = {
        ...filters,
        status
      };
      queryClient.prefetchQuery({
        queryKey: buildPostsQueryKey(nextFilters),
        queryFn: () => fetchPosts(nextFilters)
      });
    });
  }, [filters.status, filters.search, filters.category_id, filters.tag_id, filters.sort_by, filters.page, filters.per_page, queryClient, fetchPosts]);
  const updateCurrentPosts = (updater) => {
    queryClient.setQueryData(postsQueryKey, (old) => {
      if (!old) return old;
      return updater(old);
    });
  };
  const updateStatusCounts = (from, to, count) => {
    if (from === to || count <= 0) return;
    queryClient.setQueryData(statusCountsKey, (old) => {
      if (!old) return old;
      const data = old;
      return {
        ...data,
        [from]: Math.max(0, (data[from] ?? 0) - count),
        [to]: (data[to] ?? 0) + count
      };
    });
  };
  const decrementStatusCount = (status, count) => {
    if (count <= 0) return;
    queryClient.setQueryData(statusCountsKey, (old) => {
      if (!old) return old;
      const data = old;
      return {
        ...data,
        [status]: Math.max(0, (data[status] ?? 0) - count)
      };
    });
  };
  const statusCountsQuery = useQuery({
    queryKey: statusCountsKey,
    queryFn: async () => {
      const statuses = ["published", "draft", "trash"];
      const entries = await Promise.all(statuses.map(async (status) => {
        const {
          count,
          error
        } = await withTimeout(supabase.from("posts").select("id", {
          count: "exact",
          head: true
        }).eq("status", status), 15e3, "Posts count");
        if (error) throw error;
        return [status, count ?? 0];
      }));
      return Object.fromEntries(entries);
    },
    staleTime: 3e4
  });
  const totalPages = Math.ceil((postsQuery.data?.total ?? 0) / (filters.per_page ?? 20));
  const statusCounts = statusCountsQuery.data ?? {
    published: 0,
    draft: 0,
    trash: 0
  };
  const emptyStateConfig = {
    published: {
      title: "No published posts yet",
      description: "Create a post and publish it when you are ready.",
      action: "New Post"
    },
    draft: {
      title: "No drafts yet",
      description: "Start a draft to save your work for later.",
      action: "Start Draft"
    },
    trash: {
      title: "Trash is empty",
      description: "Deleted posts will show up here.",
      action: null
    }
  };
  const createTag = useMutation({
    mutationFn: async (name) => {
      const slug = name.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
      const {
        data,
        error
      } = await supabase.from("post_tags").insert({
        name,
        slug
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "post-tags"]
      });
      toast.success("Tag created");
    },
    onError: (err) => toast.error(err.message ?? "Failed to create tag")
  });
  const uploadImage = async (file, postId) => {
    const maxFeaturedImageSize = 5 * 1024 * 1024;
    if (file.size > maxFeaturedImageSize) {
      throw new Error("Featured image must be 5MB or less.");
    }
    const accessToken = session?.access_token;
    if (!accessToken) {
      throw new Error("Missing auth session. Please sign in again.");
    }
    const path = `post-images/${postId}/${Date.now()}-${file.name}`;
    const encodedPath = path.split("/").map(encodeURIComponent).join("/");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6e4);
    try {
      const response = await fetch(`${supabaseUrl}/storage/v1/object/post-images/${encodedPath}`, {
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
    } = supabase.storage.from("post-images").getPublicUrl(path);
    return {
      path,
      publicUrl: data.publicUrl
    };
  };
  const insertPostViaRest = async (post) => {
    const accessToken = session?.access_token;
    if (!accessToken) {
      throw new Error("Missing auth session. Please sign in again.");
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15e3);
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/posts`, {
        method: "POST",
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: JSON.stringify([post]),
        signal: controller.signal
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Post insert failed (${response.status}).`);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  };
  const updatePostsViaRest = async (ids, patch) => {
    const accessToken = session?.access_token;
    if (!accessToken) {
      throw new Error("Missing auth session. Please sign in again.");
    }
    if (ids.length === 0) return;
    const idFilter = `id=in.(${ids.join(",")})`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15e3);
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/posts?${encodeURI(idFilter)}`, {
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
        throw new Error(text || `Post update failed (${response.status}).`);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  };
  const deletePostsViaRest = async (ids) => {
    const accessToken = session?.access_token;
    if (!accessToken) {
      throw new Error("Missing auth session. Please sign in again.");
    }
    if (ids.length === 0) return;
    const idFilter = `id=in.(${ids.join(",")})`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15e3);
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/posts?${encodeURI(idFilter)}`, {
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
        throw new Error(text || `Post delete failed (${response.status}).`);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  };
  const upsertPost = useMutation({
    mutationFn: async (payload) => {
      const bodyLength = (payload.body ?? "").length;
      const fileSize = payload.file?.size ?? 0;
      console.log("upsertPost mutation started", {
        title: payload.title,
        slug: payload.slug,
        status: payload.status,
        bodyLength,
        hasFile: !!payload.file,
        fileSize
      });
      const resolvedPostId = payload.id ?? (() => {
        if (typeof crypto === "undefined" || !crypto.randomUUID) {
          throw new Error("UUID generator unavailable in this environment.");
        }
        return crypto.randomUUID();
      })();
      let postId = payload.id ?? null;
      let featured_image_url = payload.featured_image_url;
      let featured_image_path = payload.featured_image_path;
      if (payload.file) {
        console.log("Uploading image...");
        const uploaded = await uploadImage(payload.file, resolvedPostId);
        featured_image_url = uploaded.publicUrl;
        featured_image_path = uploaded.path;
      }
      const base = {
        title: payload.title,
        slug: payload.slug,
        excerpt: payload.excerpt,
        body: payload.body,
        featured_image_url,
        featured_image_path,
        author_id: payload.author_id || currentUserId,
        status: payload.status,
        published_at: payload.published_at,
        featured: payload.featured,
        language: payload.language
      };
      console.log("Inserting/updating post", {
        title: base.title,
        slug: base.slug,
        status: base.status,
        bodyLength,
        hasFile: !!payload.file,
        fileSize
      });
      if (payload.id) {
        console.log("Updating existing post...");
        const {
          error
        } = await withTimeout(supabase.from("posts").update(base).eq("id", payload.id), 15e3, "Post update");
        if (error) {
          console.error("Update error:", error);
          throw error;
        }
        postId = payload.id;
      } else {
        console.log("Inserting new post...");
        base.id = resolvedPostId;
        await withTimeout(insertPostViaRest(base), 15e3, "Post insert");
        postId = resolvedPostId;
        console.log("Insert completed", {
          postId
        });
      }
      if (!postId) {
        throw new Error("Failed to resolve post ID for updates");
      }
      const updateRelations = async () => {
        try {
          await withTimeout(supabase.from("post_categories_map").delete().eq("post_id", postId), 15e3, "Post categories cleanup");
          if (payload.category_ids && payload.category_ids.length > 0) {
            const {
              error
            } = await withTimeout(supabase.from("post_categories_map").insert(payload.category_ids.map((category_id) => ({
              post_id: postId,
              category_id
            }))), 15e3, "Post categories assign");
            if (error) throw error;
          }
        } catch (error) {
          console.error("Post categories update failed:", error);
          toast.warning("Post saved, but categories could not be updated.");
        }
        try {
          await withTimeout(supabase.from("post_tags_map").delete().eq("post_id", postId), 15e3, "Post tags cleanup");
          if (payload.tag_ids && payload.tag_ids.length > 0) {
            const {
              error
            } = await withTimeout(supabase.from("post_tags_map").insert(payload.tag_ids.map((tag_id) => ({
              post_id: postId,
              tag_id
            }))), 15e3, "Post tags assign");
            if (error) throw error;
          }
        } catch (error) {
          console.error("Post tags update failed:", error);
          toast.warning("Post saved, but tags could not be updated.");
        }
      };
      void updateRelations();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "posts"]
      });
      queryClient.invalidateQueries({
        queryKey: statusCountsKey
      });
      setShowForm(false);
      setEditingPost(null);
      toast.success("Post saved");
    },
    onError: (err) => {
      console.error("Post save failed:", err);
      toast.error(err?.message ?? "Failed to save post");
    }
  });
  const moveToTrash = useMutation({
    mutationFn: async (ids) => {
      const fromStatus = filters.status ?? "published";
      await updatePostsViaRest(ids, {
        status: "trash",
        previous_status: fromStatus
      });
    },
    onSuccess: (_data, ids) => {
      const fromStatus = filters.status ?? "published";
      updateStatusCounts(fromStatus, "trash", ids.length);
      updateCurrentPosts((data) => {
        const next = data.posts.map((post) => ids.includes(post.id) ? {
          ...post,
          status: "trash",
          previous_status: fromStatus
        } : post).filter((post) => post.status === filters.status);
        return {
          ...data,
          posts: next,
          total: next.length
        };
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "posts"]
      });
      queryClient.refetchQueries({
        queryKey: ["admin", "posts"]
      });
      queryClient.invalidateQueries({
        queryKey: statusCountsKey
      });
      setSelectedIds(/* @__PURE__ */ new Set());
      toast.success("Moved to trash");
    },
    onError: (err) => toast.error(err.message ?? "Failed to move to trash")
  });
  const restoreFromTrash = useMutation({
    mutationFn: async (ids) => {
      const currentPosts = postsQuery.data?.posts ?? [];
      const selected = currentPosts.filter((post) => ids.includes(post.id));
      const grouped = selected.reduce((acc, post) => {
        const nextStatus = post.previous_status ?? "draft";
        if (!acc[nextStatus]) acc[nextStatus] = [];
        acc[nextStatus].push(post.id);
        return acc;
      }, {});
      await Promise.all(Object.entries(grouped).map(([status, postIds]) => updatePostsViaRest(postIds, {
        status,
        previous_status: null
      })));
    },
    onSuccess: (_data, ids) => {
      const currentPosts = postsQuery.data?.posts ?? [];
      const selected = currentPosts.filter((post) => ids.includes(post.id));
      const grouped = selected.reduce((acc, post) => {
        const nextStatus = post.previous_status ?? "draft";
        acc[nextStatus] = (acc[nextStatus] ?? 0) + 1;
        return acc;
      }, {});
      Object.entries(grouped).forEach(([status, count]) => {
        updateStatusCounts("trash", status, count);
      });
      updateCurrentPosts((data) => {
        const next = data.posts.filter((post) => !ids.includes(post.id));
        return {
          ...data,
          posts: next,
          total: next.length
        };
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "posts"]
      });
      queryClient.invalidateQueries({
        queryKey: statusCountsKey
      });
      setSelectedIds(/* @__PURE__ */ new Set());
      toast.success("Posts restored to drafts");
    },
    onError: (err) => toast.error(err.message ?? "Failed to restore posts")
  });
  const deletePost = useMutation({
    mutationFn: async (id) => {
      await deletePostsViaRest([id]);
    },
    onSuccess: (_data, id) => {
      decrementStatusCount("trash", 1);
      updateCurrentPosts((data) => {
        const next = data.posts.filter((post) => post.id !== id);
        return {
          ...data,
          posts: next,
          total: next.length
        };
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "posts"]
      });
      queryClient.invalidateQueries({
        queryKey: statusCountsKey
      });
      toast.success("Post deleted");
    },
    onError: (err) => toast.error(err.message ?? "Failed to delete post")
  });
  const deletePosts = useMutation({
    mutationFn: async (ids) => {
      await deletePostsViaRest(ids);
    },
    onSuccess: (_data, ids) => {
      decrementStatusCount("trash", ids.length);
      updateCurrentPosts((data) => {
        const next = data.posts.filter((post) => !ids.includes(post.id));
        return {
          ...data,
          posts: next,
          total: next.length
        };
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "posts"]
      });
      queryClient.invalidateQueries({
        queryKey: statusCountsKey
      });
      setSelectedIds(/* @__PURE__ */ new Set());
      toast.success("Posts deleted");
    },
    onError: (err) => toast.error(err.message ?? "Failed to delete posts")
  });
  const toggleFeatured = useMutation({
    mutationFn: async (payload) => {
      const {
        error
      } = await supabase.from("posts").update({
        featured: payload.featured
      }).eq("id", payload.id);
      if (error) throw error;
    },
    onSuccess: (_data, payload) => {
      updateCurrentPosts((data) => ({
        ...data,
        posts: data.posts.map((post) => post.id === payload.id ? {
          ...post,
          featured: payload.featured
        } : post)
      }));
      queryClient.invalidateQueries({
        queryKey: ["admin", "posts"]
      });
      toast.success("Featured status updated");
    },
    onError: (err) => toast.error(err.message ?? "Failed to update featured")
  });
  const bulkPublish = useMutation({
    mutationFn: async (ids) => {
      const {
        error
      } = await supabase.from("posts").update({
        status: "published",
        published_at: (/* @__PURE__ */ new Date()).toISOString()
      }).in("id", ids);
      if (error) throw error;
    },
    onSuccess: (_data, ids) => {
      const fromStatus = filters.status ?? "draft";
      updateStatusCounts(fromStatus, "published", ids.length);
      updateCurrentPosts((data) => {
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const next = data.posts.map((post) => ids.includes(post.id) ? {
          ...post,
          status: "published",
          published_at: now
        } : post).filter((post) => post.status === filters.status);
        return {
          ...data,
          posts: next,
          total: next.length
        };
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "posts"]
      });
      queryClient.invalidateQueries({
        queryKey: statusCountsKey
      });
      setSelectedIds(/* @__PURE__ */ new Set());
      toast.success("Posts published");
    },
    onError: (err) => toast.error(err.message ?? "Failed to publish posts")
  });
  const bulkSetFeatured = useMutation({
    mutationFn: async (ids) => {
      const {
        error
      } = await supabase.from("posts").update({
        featured: true
      }).in("id", ids);
      if (error) throw error;
    },
    onSuccess: (_data, ids) => {
      updateCurrentPosts((data) => ({
        ...data,
        posts: data.posts.map((post) => ids.includes(post.id) ? {
          ...post,
          featured: true
        } : post)
      }));
      queryClient.invalidateQueries({
        queryKey: ["admin", "posts"]
      });
      setSelectedIds(/* @__PURE__ */ new Set());
      toast.success("Posts marked as featured");
    },
    onError: (err) => toast.error(err.message ?? "Failed to mark as featured")
  });
  const handleSelectAll = () => {
    if (selectedIds.size === postsQuery.data?.posts.length) {
      setSelectedIds(/* @__PURE__ */ new Set());
    } else {
      setSelectedIds(new Set(postsQuery.data?.posts.map((p) => p.id) ?? []));
    }
  };
  const handleSelectOne = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };
  const clearFilters = () => {
    setFilters({
      search: "",
      status: "published",
      category_id: void 0,
      tag_id: void 0,
      sort_by: "newest",
      page: 1,
      per_page: 20
    });
  };
  const statusColors2 = {
    draft: "bg-gray-100 text-gray-800",
    published: "bg-green-100 text-green-800",
    scheduled: "bg-blue-100 text-blue-800",
    pending: "bg-yellow-100 text-yellow-800",
    trash: "bg-red-100 text-red-800"
  };
  return /* @__PURE__ */ jsx(AdminGuard, { children: /* @__PURE__ */ jsx(DashboardLayout, { userRole: profile?.role ?? "admin", userName, userEmail, onSignOut: signOut, children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm uppercase text-gray-500", children: "Content" }),
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-gray-900", children: "Posts" })
      ] }),
      /* @__PURE__ */ jsx(Button, { onClick: () => {
        setEditingPost(null);
        setShowForm(true);
      }, children: "New Post" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-gray-200 p-4 bg-white space-y-4", children: [
      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap items-center gap-2", children: [{
        label: "Published",
        value: "published",
        count: statusCounts.published
      }, {
        label: "Drafts",
        value: "draft",
        count: statusCounts.draft
      }, {
        label: "Trash",
        value: "trash",
        count: statusCounts.trash
      }].map((tab) => /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setFilters((prev) => ({
        ...prev,
        status: tab.value,
        page: 1
      })), className: `rounded-full px-4 py-1.5 text-sm border flex items-center gap-2 ${filters.status === tab.value ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}`, children: [
        /* @__PURE__ */ jsx("span", { children: tab.label }),
        /* @__PURE__ */ jsx("span", { className: `rounded-full px-2 py-0.5 text-xs ${filters.status === tab.value ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700"}`, children: statusCountsQuery.isLoading ? "…" : tab.count })
      ] }, tab.value)) }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative lg:col-span-2", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" }),
          /* @__PURE__ */ jsx(Input, { placeholder: "Search posts...", value: filters.search, onChange: (e) => setFilters((prev) => ({
            ...prev,
            search: e.target.value,
            page: 1
          })), className: "pl-9" })
        ] }),
        /* @__PURE__ */ jsxs("select", { value: filters.status ?? "published", onChange: (e) => setFilters((prev) => ({
          ...prev,
          status: e.target.value,
          page: 1
        })), className: "w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2", children: [
          /* @__PURE__ */ jsx("option", { value: "draft", children: "Draft" }),
          /* @__PURE__ */ jsx("option", { value: "published", children: "Published" }),
          /* @__PURE__ */ jsx("option", { value: "trash", children: "Trash" })
        ] }),
        /* @__PURE__ */ jsxs("select", { value: filters.category_id ?? "", onChange: (e) => setFilters((prev) => ({
          ...prev,
          category_id: e.target.value || void 0,
          page: 1
        })), className: "w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2", children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "All Categories" }),
          categoriesQuery.data?.map((cat) => /* @__PURE__ */ jsx("option", { value: cat.id, children: cat.name }, cat.id))
        ] }),
        /* @__PURE__ */ jsxs("select", { value: filters.sort_by ?? "newest", onChange: (e) => setFilters((prev) => ({
          ...prev,
          sort_by: e.target.value,
          page: 1
        })), className: "w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2", children: [
          /* @__PURE__ */ jsx("option", { value: "newest", children: "Newest First" }),
          /* @__PURE__ */ jsx("option", { value: "oldest", children: "Oldest First" }),
          /* @__PURE__ */ jsx("option", { value: "title_asc", children: "Title A-Z" }),
          /* @__PURE__ */ jsx("option", { value: "title_desc", children: "Title Z-A" }),
          /* @__PURE__ */ jsx("option", { value: "featured", children: "Featured First" })
        ] })
      ] }),
      (filters.search || filters.status !== "published" || filters.category_id || filters.tag_id) && /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: clearFilters, children: "Clear Filters" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [{
      label: "Published",
      count: statusCountsQuery.isLoading ? "…" : statusCounts.published
    }, {
      label: "Drafts",
      count: statusCountsQuery.isLoading ? "…" : statusCounts.draft
    }, {
      label: "Trash",
      count: statusCountsQuery.isLoading ? "…" : statusCounts.trash
    }].map((item) => /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-gray-200 bg-white px-4 py-3", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs uppercase text-gray-500", children: item.label }),
      /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold text-gray-900", children: item.count })
    ] }, item.label)) }),
    selectedIds.size > 0 && /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-gray-200 p-3 bg-blue-50 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsx(SquareCheckBig, { className: "h-4 w-4 text-blue-600" }),
        /* @__PURE__ */ jsxs("span", { className: "font-medium text-blue-900", children: [
          selectedIds.size,
          " selected"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        filters.status === "draft" && /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", onClick: () => bulkPublish.mutate(Array.from(selectedIds)), children: "Publish" }),
        filters.status !== "trash" && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", onClick: () => bulkSetFeatured.mutate(Array.from(selectedIds)), children: "Set Featured" }),
          /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: () => moveToTrash.mutate(Array.from(selectedIds)), children: [
            /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 mr-1" }),
            "Move to Trash"
          ] })
        ] }),
        filters.status === "trash" && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", onClick: () => restoreFromTrash.mutate(Array.from(selectedIds)), children: "Restore" }),
          /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", onClick: () => deletePosts.mutate(Array.from(selectedIds)), children: "Delete Permanently" })
        ] }),
        /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", onClick: () => setSelectedIds(/* @__PURE__ */ new Set()), children: "Cancel" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-gray-200 bg-white overflow-hidden", children: postsQuery.isLoading ? /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 p-4", children: "Loading posts..." }) : postsQuery.isError ? /* @__PURE__ */ jsx("p", { className: "text-sm text-rose-600 p-4", children: "Failed to load posts. Check connection or permissions." }) : (postsQuery.data?.posts.length ?? 0) === 0 ? /* @__PURE__ */ jsxs("div", { className: "p-8 text-center space-y-3", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900", children: emptyStateConfig[filters.status]?.title ?? "No posts yet" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: emptyStateConfig[filters.status]?.description ?? "Create your first post to get started." }),
      emptyStateConfig[filters.status]?.action && /* @__PURE__ */ jsx(Button, { onClick: () => {
        setEditingPost(null);
        setShowForm(true);
      }, children: emptyStateConfig[filters.status].action })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableHead, { className: "w-12", children: /* @__PURE__ */ jsx("input", { type: "checkbox", checked: selectedIds.size === postsQuery.data?.posts.length && selectedIds.size > 0, onChange: handleSelectAll, className: "h-4 w-4 rounded border-gray-300" }) }),
          /* @__PURE__ */ jsx(TableHead, { children: "Title" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Author" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Categories" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Status" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Date" }),
          /* @__PURE__ */ jsx(TableHead, { className: "w-16", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx(TableBody, { children: postsQuery.data?.posts.map((post) => /* @__PURE__ */ jsxs(TableRow, { className: "cursor-pointer hover:bg-gray-50", onClick: () => setDetailPost(post), children: [
          /* @__PURE__ */ jsx(TableCell, { onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsx("input", { type: "checkbox", checked: selectedIds.has(post.id), onChange: () => handleSelectOne(post.id), className: "h-4 w-4 rounded border-gray-300" }) }),
          /* @__PURE__ */ jsx(TableCell, { className: "font-medium text-gray-900", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            post.title,
            post.featured && /* @__PURE__ */ jsx("span", { className: "text-xs", children: "*" })
          ] }) }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-gray-600", children: post.author?.name ?? "Unknown" }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-gray-600", children: post.categories?.map((c) => c.name).join(", ") || "-" }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("span", { className: `inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusColors2[post.status]}`, children: post.status }) }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-gray-600 text-sm", children: new Date(post.created_at).toLocaleDateString() }),
          /* @__PURE__ */ jsx(TableCell, { onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxs(DropdownMenu, { children: [
            /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", children: /* @__PURE__ */ jsx(Ellipsis, { className: "h-4 w-4" }) }) }),
            /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", children: [
              /* @__PURE__ */ jsx(DropdownMenuLabel, { children: "Actions" }),
              /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
              /* @__PURE__ */ jsx(DropdownMenuItem, { onClick: () => setDetailPost(post), children: "View" }),
              /* @__PURE__ */ jsx(DropdownMenuItem, { onClick: () => {
                setEditingPost(post);
                setShowForm(true);
              }, children: "Edit" }),
              /* @__PURE__ */ jsx(DropdownMenuItem, { onClick: () => toggleFeatured.mutate({
                id: post.id,
                featured: !post.featured
              }), children: post.featured ? "Unfeature" : "Mark Featured" }),
              /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
              post.status === "draft" && /* @__PURE__ */ jsx(DropdownMenuItem, { onClick: () => bulkPublish.mutate([post.id]), children: "Publish" }),
              post.status !== "trash" ? /* @__PURE__ */ jsx(DropdownMenuItem, { onClick: () => moveToTrash.mutate([post.id]), children: "Move to Trash" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(DropdownMenuItem, { onClick: () => restoreFromTrash.mutate([post.id]), children: "Restore to Draft" }),
                /* @__PURE__ */ jsx(DropdownMenuItem, { className: "text-destructive focus:text-destructive", onClick: () => deletePost.mutate(post.id), children: "Delete Permanently" })
              ] })
            ] })
          ] }) })
        ] }, post.id)) })
      ] }),
      totalPages > 1 && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-t border-gray-200 px-4 py-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-sm text-gray-700", children: [
            "Showing ",
            ((filters.page ?? 1) - 1) * (filters.per_page ?? 20) + 1,
            " ",
            "to",
            " ",
            Math.min((filters.page ?? 1) * (filters.per_page ?? 20), postsQuery.data?.total ?? 0),
            " ",
            "of ",
            postsQuery.data?.total ?? 0,
            " results"
          ] }),
          /* @__PURE__ */ jsxs("select", { value: filters.per_page, onChange: (e) => setFilters((prev) => ({
            ...prev,
            per_page: Number(e.target.value),
            page: 1
          })), className: "rounded border border-gray-300 px-2 py-1 text-sm", children: [
            /* @__PURE__ */ jsx("option", { value: 10, children: "10 per page" }),
            /* @__PURE__ */ jsx("option", { value: 20, children: "20 per page" }),
            /* @__PURE__ */ jsx("option", { value: 50, children: "50 per page" }),
            /* @__PURE__ */ jsx("option", { value: 100, children: "100 per page" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: () => setFilters((prev) => ({
            ...prev,
            page: Math.max(1, (prev.page ?? 1) - 1)
          })), disabled: (filters.page ?? 1) <= 1, children: [
            /* @__PURE__ */ jsx(ChevronLeft, { className: "h-4 w-4" }),
            "Previous"
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-sm text-gray-700", children: [
            "Page ",
            filters.page,
            " of ",
            totalPages
          ] }),
          /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: () => setFilters((prev) => ({
            ...prev,
            page: Math.min(totalPages, (prev.page ?? 1) + 1)
          })), disabled: (filters.page ?? 1) >= totalPages, children: [
            "Next",
            /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" })
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Sheet, { open: showForm, onOpenChange: setShowForm, children: /* @__PURE__ */ jsxs(SheetContent, { className: "w-full sm:max-w-3xl px-4 overflow-hidden", children: [
      /* @__PURE__ */ jsxs(SheetHeader, { children: [
        /* @__PURE__ */ jsx(SheetTitle, { children: editingPost ? "Edit Post" : "New Post" }),
        /* @__PURE__ */ jsx(SheetDescription, { children: "Create and manage blog posts with rich content." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "pt-4 max-h-[85vh] overflow-y-auto pr-2", children: /* @__PURE__ */ jsx(PostForm, { initial: editingPost ? {
        title: editingPost.title,
        slug: editingPost.slug,
        excerpt: editingPost.excerpt ?? "",
        body: editingPost.body ?? "",
        featured_image_url: editingPost.featured_image_url ?? "",
        featured_image_path: editingPost.featured_image_path ?? "",
        author_id: editingPost.author_id ?? currentUserId,
        status: editingPost.status,
        published_at: editingPost.published_at,
        featured: editingPost.featured,
        language: editingPost.language,
        category_ids: editingPost.categories?.map((c) => c.id) ?? [],
        tag_ids: editingPost.tags?.map((t) => t.id) ?? [],
        new_tags: []
      } : void 0, submitting: upsertPost.isPending, onSubmit: async (vals, file) => {
        await upsertPost.mutateAsync({
          ...vals,
          id: editingPost?.id,
          file
        });
      }, categories: categoriesQuery.data ?? [], tags: tagsQuery.data ?? [], onCreateTag: (name) => createTag.mutateAsync(name), currentUserId, onCancel: () => {
        setShowForm(false);
        setEditingPost(null);
      } }) })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: !!detailPost, onOpenChange: () => setDetailPost(null), children: /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-3xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: detailPost?.title ?? "Post Detail" }) }),
      detailPost && /* @__PURE__ */ jsx(PostDetail, { post: detailPost })
    ] }) })
  ] }) }) });
}
export {
  AdminPostsPage as component
};
