import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { A as AdminGuard, D as DashboardLayout } from "./AdminGuard-DAXk2vKF.mjs";
import { B as Button, I as Input } from "./button-BUSE9ux3.mjs";
import { u as useAuth, s as supabase } from "./router-BiReTygo.mjs";
import { D as DropdownMenu, a as DropdownMenuTrigger, E as Ellipsis, b as DropdownMenuContent, c as DropdownMenuLabel, n as DropdownMenuItem, d as DropdownMenuSeparator, S as Sheet, j as SheetContent, k as SheetHeader, l as SheetTitle, m as SheetDescription } from "./sheet-B6u_Vcab.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription } from "./dialog-DxttVJL3.mjs";
import { L as Label } from "./label-CgBM-p8u.mjs";
import { toast } from "sonner";
import { C as Calendar } from "./calendar.mjs";
import { M as MapPin } from "./map-pin.mjs";
import { G as Globe, L as Linkedin, F as Facebook, I as Instagram, T as Twitter, Y as Youtube } from "./youtube.mjs";
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
      d: "m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5",
      key: "ftymec"
    }
  ],
  ["rect", { x: "2", y: "6", width: "14", height: "12", rx: "2", key: "158x01" }]
];
const Video = createLucideIcon("video", __iconNode);
const defaultValues = {
  name: "",
  phone: "",
  bio: "",
  photo_url: "",
  photo_path: "",
  social_links: {},
  birth_date: "",
  residence_city: "",
  province: "",
  published_works: [],
  author_gallery: [],
  featured_video: "",
  author_type: ""
};
function AuthorForm({
  initial,
  onSubmit,
  onCancel,
  submitting = false,
  mode
}) {
  const [values, setValues] = useState({
    ...defaultValues,
    ...initial,
    social_links: initial?.social_links ?? defaultValues.social_links,
    published_works: initial?.published_works ?? defaultValues.published_works,
    author_gallery: initial?.author_gallery ?? defaultValues.author_gallery
  });
  const [photoPreview, setPhotoPreview] = useState(
    initial?.photo_url ?? null
  );
  const [file, setFile] = useState(null);
  const handleChange = (key, value) => {
    setValues((prev) => ({
      ...prev,
      [key]: value
    }));
  };
  const handleSocialLinkChange = (platform, value) => {
    setValues((prev) => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value || void 0
      }
    }));
  };
  const handleFileChange = (e) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    if (selected) {
      setPhotoPreview(URL.createObjectURL(selected));
    }
  };
  const handleAddPublishedWork = () => {
    setValues((prev) => ({
      ...prev,
      published_works: [
        ...prev.published_works,
        { title: "", genre: "", synopsis: "", link: "" }
      ]
    }));
  };
  const handlePublishedWorkChange = (index, field, value) => {
    setValues((prev) => ({
      ...prev,
      published_works: prev.published_works.map(
        (work, i) => i === index ? { ...work, [field]: value } : work
      )
    }));
  };
  const handleRemovePublishedWork = (index) => {
    setValues((prev) => ({
      ...prev,
      published_works: prev.published_works.filter((_, i) => i !== index)
    }));
  };
  const handleWorkCoverChange = async (index, e) => {
    const file2 = e.target.files?.[0];
    if (!file2) return;
    const previewUrl = URL.createObjectURL(file2);
    setValues((prev) => ({
      ...prev,
      published_works: prev.published_works.map(
        (work, i) => i === index ? { ...work, cover_url: previewUrl } : work
      )
    }));
  };
  const handleAddGalleryImage = () => {
    setValues((prev) => ({
      ...prev,
      author_gallery: [...prev.author_gallery, { url: "", path: "", caption: "" }]
    }));
  };
  const handleGalleryImageChange = (index, field, value) => {
    setValues((prev) => ({
      ...prev,
      author_gallery: prev.author_gallery.map(
        (img, i) => i === index ? { ...img, [field]: value } : img
      )
    }));
  };
  const handleRemoveGalleryImage = (index) => {
    setValues((prev) => ({
      ...prev,
      author_gallery: prev.author_gallery.filter((_, i) => i !== index)
    }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(values, file);
  };
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs(Label, { htmlFor: "name", children: [
          "Name ",
          /* @__PURE__ */ jsx("span", { className: "text-red-500", children: "*" })
        ] }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "name",
            type: "text",
            value: values.name,
            onChange: (e) => handleChange("name", e.target.value),
            required: true,
            minLength: 2,
            maxLength: 100,
            placeholder: "Author name"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs(Label, { htmlFor: "author_type", children: [
          "Tipo de Autor ",
          /* @__PURE__ */ jsx("span", { className: "text-red-500", children: "*" })
        ] }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            id: "author_type",
            value: values.author_type,
            onChange: (e) => handleChange("author_type", e.target.value),
            required: true,
            className: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Selecionar tipo" }),
              /* @__PURE__ */ jsx("option", { value: "Autor", children: "Autor" }),
              /* @__PURE__ */ jsx("option", { value: "Cineasta", children: "Cineasta" }),
              /* @__PURE__ */ jsx("option", { value: "Escritor", children: "Escritor" }),
              /* @__PURE__ */ jsx("option", { value: "Escritora", children: "Escritora" }),
              /* @__PURE__ */ jsx("option", { value: "Jornalista", children: "Jornalista" }),
              /* @__PURE__ */ jsx("option", { value: "Pesquisador", children: "Pesquisador" }),
              /* @__PURE__ */ jsx("option", { value: "Poeta", children: "Poeta" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "phone", children: "Phone" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "phone",
            type: "tel",
            value: values.phone,
            onChange: (e) => handleChange("phone", e.target.value),
            placeholder: "+258 84 123 4567"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "bio", children: "Bio" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            id: "bio",
            value: values.bio,
            onChange: (e) => handleChange("bio", e.target.value),
            maxLength: 500,
            rows: 4,
            placeholder: "Author biography (max 500 characters)",
            className: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          }
        ),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500", children: [
          values.bio.length,
          "/500 characters"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "photo", children: "Profile Photo" }),
        photoPreview && /* @__PURE__ */ jsx("div", { className: "mb-2", children: /* @__PURE__ */ jsx(
          "img",
          {
            src: photoPreview,
            alt: "Preview",
            className: "h-32 w-32 rounded-lg object-cover border border-gray-200"
          }
        ) }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "photo",
            type: "file",
            accept: "image/jpeg,image/png,image/webp,image/gif",
            onChange: handleFileChange
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Max 5MB. Supported formats: JPG, PNG, WEBP, GIF" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "birth_date", children: "Birth Date" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "birth_date",
            type: "date",
            value: values.birth_date,
            onChange: (e) => handleChange("birth_date", e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "residence_city", children: "Residence City" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "residence_city",
            type: "text",
            value: values.residence_city,
            onChange: (e) => handleChange("residence_city", e.target.value),
            placeholder: "City name"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "province", children: "Province" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "province",
            type: "text",
            value: values.province,
            onChange: (e) => handleChange("province", e.target.value),
            placeholder: "Province name"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "featured_video", children: "Featured Video URL" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "featured_video",
            type: "url",
            value: values.featured_video,
            onChange: (e) => handleChange("featured_video", e.target.value),
            placeholder: "https://youtube.com/watch?v=..."
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "YouTube or Vimeo video URL" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 border-t pt-4", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-gray-900", children: "Social Links" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "website", children: "Website" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "website",
              type: "url",
              value: values.social_links.website ?? "",
              onChange: (e) => handleSocialLinkChange("website", e.target.value),
              placeholder: "https://example.com"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "linkedin", children: "LinkedIn" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "linkedin",
              type: "url",
              value: values.social_links.linkedin ?? "",
              onChange: (e) => handleSocialLinkChange("linkedin", e.target.value),
              placeholder: "https://linkedin.com/in/username"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "facebook", children: "Facebook" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "facebook",
              type: "url",
              value: values.social_links.facebook ?? "",
              onChange: (e) => handleSocialLinkChange("facebook", e.target.value),
              placeholder: "https://facebook.com/username"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "instagram", children: "Instagram" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "instagram",
              type: "url",
              value: values.social_links.instagram ?? "",
              onChange: (e) => handleSocialLinkChange("instagram", e.target.value),
              placeholder: "https://instagram.com/username"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "twitter", children: "Twitter" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "twitter",
              type: "url",
              value: values.social_links.twitter ?? "",
              onChange: (e) => handleSocialLinkChange("twitter", e.target.value),
              placeholder: "https://twitter.com/username"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "youtube", children: "YouTube" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "youtube",
              type: "url",
              value: values.social_links.youtube ?? "",
              onChange: (e) => handleSocialLinkChange("youtube", e.target.value),
              placeholder: "https://youtube.com/@username"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 border-t pt-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-gray-900", children: "Obras Publicadas (Published Works)" }),
          /* @__PURE__ */ jsx(
            Button,
            {
              type: "button",
              onClick: handleAddPublishedWork,
              className: "bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1",
              children: "+ Add Work"
            }
          )
        ] }),
        values.published_works.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "No published works added yet" }) : /* @__PURE__ */ jsx("div", { className: "space-y-4", children: values.published_works.map((work, index) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "border border-gray-300 rounded-lg p-4 space-y-3 bg-gray-50",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxs("h4", { className: "text-sm font-semibold text-gray-900", children: [
                  "Obra #",
                  index + 1
                ] }),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    type: "button",
                    onClick: () => handleRemovePublishedWork(index),
                    className: "bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-xs",
                    children: "Remove"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxs(Label, { htmlFor: `work_cover_${index}`, children: [
                  "Capa da Obra ",
                  /* @__PURE__ */ jsx("span", { className: "text-red-500", children: "*" })
                ] }),
                work.cover_url && /* @__PURE__ */ jsx("div", { className: "mb-2", children: /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: work.cover_url,
                    alt: "Cover preview",
                    className: "h-32 w-24 object-cover rounded border border-gray-200"
                  }
                ) }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    id: `work_cover_${index}`,
                    type: "file",
                    accept: "image/jpeg,image/png,image/webp",
                    onChange: (e) => handleWorkCoverChange(index, e)
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxs(Label, { htmlFor: `work_title_${index}`, children: [
                  "Título da Obra ",
                  /* @__PURE__ */ jsx("span", { className: "text-red-500", children: "*" })
                ] }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    id: `work_title_${index}`,
                    type: "text",
                    value: work.title,
                    onChange: (e) => handlePublishedWorkChange(index, "title", e.target.value),
                    placeholder: "Título que conta na Capa da Obra",
                    required: true
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxs(Label, { htmlFor: `work_genre_${index}`, children: [
                  "Gênero literário ",
                  /* @__PURE__ */ jsx("span", { className: "text-red-500", children: "*" })
                ] }),
                /* @__PURE__ */ jsxs(
                  "select",
                  {
                    id: `work_genre_${index}`,
                    value: work.genre,
                    onChange: (e) => handlePublishedWorkChange(index, "genre", e.target.value),
                    required: true,
                    className: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900",
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "", children: "Selecionar o tipo de Obra" }),
                      /* @__PURE__ */ jsx("option", { value: "Romance", children: "Romance" }),
                      /* @__PURE__ */ jsx("option", { value: "Conto", children: "Conto" }),
                      /* @__PURE__ */ jsx("option", { value: "Poesia", children: "Poesia" }),
                      /* @__PURE__ */ jsx("option", { value: "Drama", children: "Drama" }),
                      /* @__PURE__ */ jsx("option", { value: "Infantil", children: "Infantil" }),
                      /* @__PURE__ */ jsx("option", { value: "Ficção Científica", children: "Ficção Científica" }),
                      /* @__PURE__ */ jsx("option", { value: "Suspense", children: "Suspense" }),
                      /* @__PURE__ */ jsx("option", { value: "Outros", children: "Outros" })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxs(Label, { htmlFor: `work_synopsis_${index}`, children: [
                  "Sinopse da Obra ",
                  /* @__PURE__ */ jsx("span", { className: "text-red-500", children: "*" })
                ] }),
                /* @__PURE__ */ jsx(
                  "textarea",
                  {
                    id: `work_synopsis_${index}`,
                    value: work.synopsis,
                    onChange: (e) => handlePublishedWorkChange(index, "synopsis", e.target.value),
                    placeholder: "Breve descrição/resumo",
                    required: true,
                    rows: 3,
                    className: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: `work_link_${index}`, children: "Link da Obra" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    id: `work_link_${index}`,
                    type: "url",
                    value: work.link ?? "",
                    onChange: (e) => handlePublishedWorkChange(index, "link", e.target.value),
                    placeholder: "Endereço na web"
                  }
                )
              ] })
            ]
          },
          index
        )) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 border-t pt-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-gray-900", children: "Galeria do Autor (Author Gallery)" }),
          /* @__PURE__ */ jsx(
            Button,
            {
              type: "button",
              onClick: handleAddGalleryImage,
              className: "bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1",
              children: "+ Add Image"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Add image URLs for the author's gallery" }),
        values.author_gallery.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "No gallery images added yet" }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: values.author_gallery.map((image, index) => /* @__PURE__ */ jsxs("div", { className: "border border-gray-200 rounded-lg p-3 space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(
              Input,
              {
                type: "url",
                value: image.url,
                onChange: (e) => handleGalleryImageChange(index, "url", e.target.value),
                placeholder: "Image URL",
                className: "flex-1"
              }
            ),
            /* @__PURE__ */ jsx(
              Button,
              {
                type: "button",
                onClick: () => handleRemoveGalleryImage(index),
                className: "bg-red-600 hover:bg-red-700 text-white px-3",
                children: "Remove"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            Input,
            {
              type: "text",
              value: image.caption ?? "",
              onChange: (e) => handleGalleryImageChange(index, "caption", e.target.value),
              placeholder: "Caption (optional)"
            }
          ),
          image.url && /* @__PURE__ */ jsx(
            "img",
            {
              src: image.url,
              alt: image.caption || "Gallery preview",
              className: "h-24 w-full object-cover rounded border border-gray-200",
              onError: (e) => {
                e.currentTarget.style.display = "none";
              }
            }
          )
        ] }, index)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-3 border-t pt-4", children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "button",
          onClick: onCancel,
          disabled: submitting,
          className: "bg-gray-200 text-gray-900 hover:bg-gray-300",
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ jsx(Button, { type: "submit", disabled: submitting, children: submitting ? mode === "create" ? "Creating..." : "Saving..." : mode === "create" ? "Create Author" : "Save Changes" })
    ] })
  ] });
}
function AuthorDetail({ author }) {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };
  const hasSocialLinks = author.social_links && Object.values(author.social_links).some((link) => link);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-6", children: [
      author.photo_url ? /* @__PURE__ */ jsx(
        "img",
        {
          src: author.photo_url,
          alt: author.name,
          className: "h-32 w-32 rounded-lg object-cover border border-gray-200"
        }
      ) : /* @__PURE__ */ jsx("div", { className: "h-32 w-32 rounded-lg bg-gray-200 flex items-center justify-center border border-gray-300", children: /* @__PURE__ */ jsx("span", { className: "text-4xl text-gray-400", children: author.name.charAt(0).toUpperCase() }) }),
      /* @__PURE__ */ jsx("div", { className: "flex-1 space-y-3", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold text-gray-900", children: author.name }),
        author.author_type && /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-gray-500 uppercase tracking-wide", children: author.author_type })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "border-t pt-4 space-y-3", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-gray-900", children: "Contact Information" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Phone" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-900", children: author.phone || "Not provided" })
        ] }),
        author.wp_slug && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "WordPress Slug" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-900", children: author.wp_slug })
        ] })
      ] })
    ] }),
    (author.birth_date || author.residence_city || author.province) && /* @__PURE__ */ jsxs("div", { className: "border-t pt-4 space-y-3", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-gray-900", children: "Personal Information" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        author.birth_date && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4 text-gray-500" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Birth Date" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-900", children: formatDate(author.birth_date) })
          ] })
        ] }),
        author.residence_city && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4 text-gray-500" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "City" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-900", children: author.residence_city })
          ] })
        ] }),
        author.province && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4 text-gray-500" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Province" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-900", children: author.province })
          ] })
        ] })
      ] })
    ] }),
    author.bio && /* @__PURE__ */ jsxs("div", { className: "border-t pt-4 space-y-2", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-gray-900", children: "Biography" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-700 whitespace-pre-wrap", children: author.bio })
    ] }),
    hasSocialLinks && /* @__PURE__ */ jsxs("div", { className: "border-t pt-4 space-y-3", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-gray-900", children: "Social Links" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        author.social_links?.website && /* @__PURE__ */ jsxs(
          "a",
          {
            href: author.social_links.website,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "flex items-center gap-3 text-sm text-blue-600 hover:text-blue-700 hover:underline",
            children: [
              /* @__PURE__ */ jsx(Globe, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsx("span", { children: author.social_links.website })
            ]
          }
        ),
        author.social_links?.linkedin && /* @__PURE__ */ jsxs(
          "a",
          {
            href: author.social_links.linkedin,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "flex items-center gap-3 text-sm text-blue-600 hover:text-blue-700 hover:underline",
            children: [
              /* @__PURE__ */ jsx(Linkedin, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsx("span", { children: author.social_links.linkedin })
            ]
          }
        ),
        author.social_links?.facebook && /* @__PURE__ */ jsxs(
          "a",
          {
            href: author.social_links.facebook,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "flex items-center gap-3 text-sm text-blue-600 hover:text-blue-700 hover:underline",
            children: [
              /* @__PURE__ */ jsx(Facebook, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsx("span", { children: author.social_links.facebook })
            ]
          }
        ),
        author.social_links?.instagram && /* @__PURE__ */ jsxs(
          "a",
          {
            href: author.social_links.instagram,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "flex items-center gap-3 text-sm text-blue-600 hover:text-blue-700 hover:underline",
            children: [
              /* @__PURE__ */ jsx(Instagram, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsx("span", { children: author.social_links.instagram })
            ]
          }
        ),
        author.social_links?.twitter && /* @__PURE__ */ jsxs(
          "a",
          {
            href: author.social_links.twitter,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "flex items-center gap-3 text-sm text-blue-600 hover:text-blue-700 hover:underline",
            children: [
              /* @__PURE__ */ jsx(Twitter, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsx("span", { children: author.social_links.twitter })
            ]
          }
        ),
        author.social_links?.youtube && /* @__PURE__ */ jsxs(
          "a",
          {
            href: author.social_links.youtube,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "flex items-center gap-3 text-sm text-blue-600 hover:text-blue-700 hover:underline",
            children: [
              /* @__PURE__ */ jsx(Youtube, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsx("span", { children: author.social_links.youtube })
            ]
          }
        )
      ] })
    ] }),
    author.featured_video && /* @__PURE__ */ jsxs("div", { className: "border-t pt-4 space-y-2", children: [
      /* @__PURE__ */ jsxs("h3", { className: "text-sm font-semibold text-gray-900 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Video, { className: "h-4 w-4" }),
        "Featured Video"
      ] }),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: author.featured_video,
          target: "_blank",
          rel: "noopener noreferrer",
          className: "text-sm text-blue-600 hover:text-blue-700 hover:underline break-all",
          children: author.featured_video
        }
      )
    ] }),
    author.published_works && author.published_works.length > 0 && /* @__PURE__ */ jsxs("div", { className: "border-t pt-4 space-y-3", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-gray-900", children: "Obras Publicadas (Published Works)" }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-4", children: author.published_works.map((work, index) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "border border-gray-200 rounded-lg p-3 flex gap-3",
          children: [
            work.cover_url && /* @__PURE__ */ jsx(
              "img",
              {
                src: work.cover_url,
                alt: work.title,
                className: "h-32 w-24 object-cover rounded border border-gray-200 shrink-0"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-2", children: [
              /* @__PURE__ */ jsx("h4", { className: "font-semibold text-gray-900", children: work.title }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-600", children: [
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Gênero:" }),
                " ",
                work.genre
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-700", children: work.synopsis }),
              work.link && /* @__PURE__ */ jsx(
                "a",
                {
                  href: work.link,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-sm text-blue-600 hover:text-blue-700 hover:underline inline-block",
                  children: "Ver obra"
                }
              )
            ] })
          ]
        },
        index
      )) })
    ] }),
    author.author_gallery && author.author_gallery.length > 0 && /* @__PURE__ */ jsxs("div", { className: "border-t pt-4 space-y-3", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-gray-900", children: "Galeria do Autor (Author Gallery)" }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-3", children: author.author_gallery.map((image, index) => /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            src: image.url,
            alt: image.caption || `Gallery image ${index + 1}`,
            className: "w-full h-32 object-cover rounded border border-gray-200"
          }
        ),
        image.caption && /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-600", children: image.caption })
      ] }, index)) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "border-t pt-4", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 text-xs text-gray-500", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { children: "Created" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-900", children: formatDate(author.created_at) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { children: "Last Updated" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-900", children: formatDate(author.updated_at) })
      ] })
    ] }) })
  ] });
}
function AdminAuthorsPage() {
  const {
    profile,
    session,
    signOut
  } = useAuth();
  const userName = profile?.name ?? session?.user.email ?? "Admin";
  const userEmail = session?.user.email ?? "";
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [detailAuthor, setDetailAuthor] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const authorsQuery = useQuery({
    queryKey: ["admin", "authors"],
    queryFn: async () => {
      try {
        const {
          data,
          error
        } = await supabase.from("authors").select("id, name, wp_id, wp_slug, bio, photo_url, photo_path, phone, social_links, featured, birth_date, residence_city, province, published_works, author_gallery, featured_video, author_type, created_at, updated_at").order("created_at", {
          ascending: false
        });
        if (error) {
          console.error("Authors query error:", error);
          throw error;
        }
        console.log("Fetched authors:", data?.length ?? 0, "authors");
        return data ?? [];
      } catch (err) {
        console.error("Failed to fetch authors:", err);
        throw err;
      }
    },
    staleTime: 0,
    retry: 1
  });
  const resizePhoto = async (file) => {
    if (!file.type.startsWith("image/")) return file;
    const maxDimension = 1400;
    const quality = 0.85;
    const shouldResize = file.size > 12e5;
    const img = await new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        URL.revokeObjectURL(url);
        resolve(image);
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load image"));
      };
      image.src = url;
    });
    const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
    if (!shouldResize && scale === 1) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((result) => result ? resolve(result) : reject(new Error("Resize failed")), "image/jpeg", quality);
    });
    const fileName = file.name.replace(/\.[^/.]+$/, ".jpg");
    return new File([blob], fileName, {
      type: blob.type
    });
  };
  const uploadPhoto = async (file, userId) => {
    const preparedFile = await resizePhoto(file);
    const maxSize = 5 * 1024 * 1024;
    if (preparedFile.size > maxSize) {
      throw new Error("Profile photo must be 5MB or less.");
    }
    const path = `author-photos/${userId}/${Date.now()}-${preparedFile.name}`;
    const {
      error: uploadError
    } = await supabase.storage.from("author-photos").upload(path, preparedFile, {
      upsert: true,
      contentType: preparedFile.type
    });
    if (uploadError) throw uploadError;
    const {
      data
    } = supabase.storage.from("author-photos").getPublicUrl(path);
    return {
      path,
      publicUrl: data.publicUrl
    };
  };
  const createAuthor = useMutation({
    mutationFn: async (payload) => {
      const {
        values,
        file
      } = payload;
      const payloadRow = {
        name: values.name,
        phone: values.phone || null,
        bio: values.bio || null,
        photo_url: values.photo_url || null,
        photo_path: values.photo_path || null,
        social_links: values.social_links ?? {},
        birth_date: values.birth_date || null,
        residence_city: values.residence_city || null,
        province: values.province || null,
        published_works: values.published_works ?? [],
        author_gallery: values.author_gallery ?? [],
        featured_video: values.featured_video || null,
        author_type: values.author_type || null
      };
      const {
        data: created,
        error: insertError
      } = await supabase.from("authors").insert(payloadRow).select().single();
      if (insertError) throw insertError;
      if (file && created?.id) {
        const uploaded = await uploadPhoto(file, created.id);
        const {
          error: updateError
        } = await supabase.from("authors").update({
          photo_url: uploaded.publicUrl,
          photo_path: uploaded.path
        }).eq("id", created.id);
        if (updateError) throw updateError;
      }
    },
    onSuccess: async () => {
      console.log("Author created, invalidating queries...");
      await queryClient.invalidateQueries({
        queryKey: ["admin", "authors"]
      });
      console.log("Refetching authors...");
      await queryClient.refetchQueries({
        queryKey: ["admin", "authors"]
      });
      console.log("Queries refreshed, closing form");
      setShowForm(false);
      toast.success("Author created successfully");
    },
    onError: (err) => {
      console.error("Create author error:", err);
      const message = err.message ?? "Failed to create author";
      toast.error(message);
    }
  });
  const updateAuthor = useMutation({
    mutationFn: async (payload) => {
      const {
        values,
        file,
        id
      } = payload;
      let photo_path = values.photo_path || null;
      let photo_url = values.photo_url || null;
      if (file) {
        if (values.photo_path) {
          await supabase.storage.from("author-photos").remove([values.photo_path]);
        }
        const uploaded = await uploadPhoto(file, id);
        photo_url = uploaded.publicUrl;
        photo_path = uploaded.path;
      }
      const {
        error
      } = await supabase.from("authors").update({
        name: values.name,
        phone: values.phone || null,
        bio: values.bio || null,
        photo_url,
        photo_path,
        social_links: values.social_links ?? {},
        birth_date: values.birth_date || null,
        residence_city: values.residence_city || null,
        province: values.province || null,
        published_works: values.published_works,
        author_gallery: values.author_gallery,
        featured_video: values.featured_video || null,
        author_type: values.author_type || null
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin", "authors"]
      });
      await queryClient.refetchQueries({
        queryKey: ["admin", "authors"]
      });
      setShowForm(false);
      setEditingAuthor(null);
      toast.success("Author updated successfully");
    },
    onError: (err) => {
      console.error("Update author error:", err);
      toast.error(err.message ?? "Failed to update author");
    }
  });
  const deleteAuthor = useMutation({
    mutationFn: async (id) => {
      const {
        data: author
      } = await supabase.from("authors").select("photo_path").eq("id", id).single();
      if (author?.photo_path) {
        await supabase.storage.from("author-photos").remove([author.photo_path]);
      }
      const {
        error
      } = await supabase.from("authors").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin", "authors"]
      });
      await queryClient.refetchQueries({
        queryKey: ["admin", "authors"]
      });
      setDeleteConfirm(null);
      toast.success("Author deleted successfully");
    },
    onError: (err) => {
      console.error("Delete author error:", err);
      toast.error(err.message ?? "Failed to delete author");
    }
  });
  const toggleFeatured = useMutation({
    mutationFn: async (payload) => {
      const {
        error
      } = await supabase.from("authors").update({
        featured: payload.featured
      }).eq("id", payload.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "authors"]
      });
      toast.success("Featured status updated");
    },
    onError: (err) => toast.error(err.message ?? "Failed to update featured status")
  });
  const handleFormSubmit = async (values, file) => {
    if (editingAuthor) {
      await updateAuthor.mutateAsync({
        values,
        file,
        id: editingAuthor.id
      });
    } else {
      await createAuthor.mutateAsync({
        values,
        file
      });
    }
  };
  const handleEdit = (author) => {
    setEditingAuthor(author);
    setShowForm(true);
  };
  const handleDelete = (id) => {
    setDeleteConfirm(id);
  };
  return /* @__PURE__ */ jsx(AdminGuard, { children: /* @__PURE__ */ jsxs(DashboardLayout, { userRole: profile?.role ?? "admin", userName, userEmail, onSignOut: signOut, children: [
    /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm uppercase text-gray-500", children: "Community" }),
          /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-semibold text-gray-900", children: [
            "Authors ",
            authorsQuery.data ? `(${authorsQuery.data.length})` : ""
          ] })
        ] }),
        /* @__PURE__ */ jsx(Button, { onClick: () => {
          setEditingAuthor(null);
          setShowForm(true);
        }, children: "Add author" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-gray-200 p-4 bg-white", children: authorsQuery.isLoading ? /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Loading authors…" }) : authorsQuery.isError ? /* @__PURE__ */ jsx("p", { className: "text-sm text-rose-600", children: "Failed to load authors. Check connection or permissions." }) : authorsQuery.data?.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 text-center py-8", children: 'No authors found. Click "Add author" to create one.' }) : /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "text-left text-gray-500 border-b", children: [
          /* @__PURE__ */ jsx("th", { className: "py-2 pr-3", children: "Author" }),
          /* @__PURE__ */ jsx("th", { className: "py-2 pr-3", children: "Phone" }),
          /* @__PURE__ */ jsx("th", { className: "py-2 pr-3", children: "Tipo de Autor" }),
          /* @__PURE__ */ jsx("th", { className: "py-2 pr-3", children: "WordPress" }),
          /* @__PURE__ */ jsx("th", { className: "py-2 pr-3", children: "Featured" }),
          /* @__PURE__ */ jsx("th", { className: "py-2 pr-3", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y", children: authorsQuery.data?.map((author) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-50 cursor-pointer", onClick: () => setDetailAuthor(author), children: [
          /* @__PURE__ */ jsx("td", { className: "py-3 pr-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            author.photo_url ? /* @__PURE__ */ jsx("img", { src: author.photo_url, alt: author.name, className: "h-10 w-10 rounded-full object-cover border border-gray-200" }) : /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600", children: author.name.charAt(0).toUpperCase() }) }),
            /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-900", children: author.name }) })
          ] }) }),
          /* @__PURE__ */ jsx("td", { className: "py-3 pr-3 text-gray-600", children: author.phone ?? "—" }),
          /* @__PURE__ */ jsx("td", { className: "py-3 pr-3 text-gray-600", children: author.author_type ?? "—" }),
          /* @__PURE__ */ jsx("td", { className: "py-3 pr-3", children: /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600", children: author.wp_slug ?? "—" }) }),
          /* @__PURE__ */ jsx("td", { className: "py-3 pr-3 text-gray-600", children: author.featured ? "Yes" : "No" }),
          /* @__PURE__ */ jsx("td", { className: "py-3 pr-3", children: /* @__PURE__ */ jsxs(DropdownMenu, { children: [
            /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsx(Ellipsis, { className: "h-4 w-4" }) }) }),
            /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", children: [
              /* @__PURE__ */ jsx(DropdownMenuLabel, { children: "Actions" }),
              /* @__PURE__ */ jsx(DropdownMenuItem, { onClick: (e) => {
                e.stopPropagation();
                setDetailAuthor(author);
              }, children: "View details" }),
              /* @__PURE__ */ jsx(DropdownMenuItem, { onClick: (e) => {
                e.stopPropagation();
                handleEdit(author);
              }, children: "Edit" }),
              /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
              /* @__PURE__ */ jsx(DropdownMenuItem, { onClick: (e) => {
                e.stopPropagation();
                toggleFeatured.mutate({
                  id: author.id,
                  featured: !(author.featured ?? false)
                });
              }, children: author.featured ? "Unfeature" : "Mark featured" }),
              /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
              /* @__PURE__ */ jsx(DropdownMenuItem, { onClick: (e) => {
                e.stopPropagation();
                handleDelete(author.id);
              }, className: "text-red-600", children: "Delete" })
            ] })
          ] }) })
        ] }, author.id)) })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsx(Sheet, { open: showForm, onOpenChange: setShowForm, children: /* @__PURE__ */ jsxs(SheetContent, { className: "overflow-y-auto sm:max-w-lg px-4", children: [
      /* @__PURE__ */ jsxs(SheetHeader, { children: [
        /* @__PURE__ */ jsx(SheetTitle, { children: editingAuthor ? "Edit Author" : "Add New Author" }),
        /* @__PURE__ */ jsx(SheetDescription, { children: editingAuthor ? "Update author profile information" : "Create a new author profile" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(AuthorForm, { initial: editingAuthor ? {
        name: editingAuthor.name,
        phone: editingAuthor.phone ?? "",
        bio: editingAuthor.bio ?? "",
        photo_url: editingAuthor.photo_url ?? "",
        photo_path: editingAuthor.photo_path ?? "",
        social_links: editingAuthor.social_links ?? {},
        birth_date: editingAuthor.birth_date ?? "",
        residence_city: editingAuthor.residence_city ?? "",
        province: editingAuthor.province ?? "",
        published_works: editingAuthor.published_works ?? [],
        author_gallery: editingAuthor.author_gallery ?? [],
        featured_video: editingAuthor.featured_video ?? "",
        author_type: editingAuthor.author_type ?? ""
      } : void 0, onSubmit: handleFormSubmit, onCancel: () => {
        setShowForm(false);
        setEditingAuthor(null);
      }, submitting: createAuthor.isPending || updateAuthor.isPending, mode: editingAuthor ? "edit" : "create" }) })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: !!detailAuthor, onOpenChange: () => setDetailAuthor(null), children: /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: "Author Details" }),
        /* @__PURE__ */ jsx(DialogDescription, { children: "View author profile information" })
      ] }),
      detailAuthor && /* @__PURE__ */ jsx(AuthorDetail, { author: detailAuthor })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: !!deleteConfirm, onOpenChange: () => setDeleteConfirm(null), children: /* @__PURE__ */ jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: "Delete Author" }),
        /* @__PURE__ */ jsx(DialogDescription, { children: "Are you sure you want to delete this author? This action cannot be undone and will remove their profile and all associated data." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-3 mt-4", children: [
        /* @__PURE__ */ jsx(Button, { variant: "ghost", onClick: () => setDeleteConfirm(null), disabled: deleteAuthor.isPending, children: "Cancel" }),
        /* @__PURE__ */ jsx(Button, { onClick: () => deleteConfirm && deleteAuthor.mutate(deleteConfirm), disabled: deleteAuthor.isPending, className: "bg-red-600 hover:bg-red-700", children: deleteAuthor.isPending ? "Deleting..." : "Delete" })
      ] })
    ] }) })
  ] }) });
}
export {
  AdminAuthorsPage as component
};
