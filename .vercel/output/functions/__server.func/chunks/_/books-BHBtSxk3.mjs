import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { A as AdminGuard, D as DashboardLayout } from "./AdminGuard-DAXk2vKF.mjs";
import { B as Button, I as Input } from "./button-BUSE9ux3.mjs";
import { u as useAuth, s as supabase } from "./router-BiReTygo.mjs";
import { D as DropdownMenu, a as DropdownMenuTrigger, E as Ellipsis, b as DropdownMenuContent, c as DropdownMenuLabel, d as DropdownMenuSeparator, n as DropdownMenuItem, S as Sheet, j as SheetContent, k as SheetHeader, l as SheetTitle, m as SheetDescription } from "./sheet-B6u_Vcab.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell, f as TableCaption } from "./table-nB_ewZar.mjs";
import { L as Label } from "./label-CgBM-p8u.mjs";
import { toast } from "sonner";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription } from "./dialog-DxttVJL3.mjs";
import "@tanstack/react-router";
import "./x.mjs";
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
const defaultValues = {
  title: "",
  slug: "",
  price_mzn: 0,
  stock: 0,
  category: "",
  language: "pt",
  is_active: true,
  featured: false,
  cover_url: "",
  cover_path: "",
  description: "",
  isbn: "",
  publisher: "",
  seo_title: "",
  seo_description: "",
  author_ids: []
};
function BookForm({
  initial,
  onSubmit,
  onCancel,
  submitting = false,
  authors,
  onCreateAuthor
}) {
  const [values, setValues] = useState({
    ...defaultValues,
    ...initial,
    author_ids: initial?.author_ids ?? defaultValues.author_ids
  });
  const [coverPreview, setCoverPreview] = useState(
    initial?.cover_url ?? null
  );
  const [file, setFile] = useState(null);
  const [localAuthors, setLocalAuthors] = useState(authors);
  const [newAuthorName, setNewAuthorName] = useState("");
  const [addingAuthor, setAddingAuthor] = useState(false);
  useEffect(() => {
    setLocalAuthors(authors);
  }, [authors]);
  const handleChange = (key, value) => {
    setValues((prev) => ({
      ...prev,
      [key]: value
    }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const slug = values.slug || values.title.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
    onSubmit({ ...values, slug }, file);
  };
  const addAuthor = async () => {
    if (!onCreateAuthor) return;
    const name = newAuthorName.trim();
    if (!name) return;
    setAddingAuthor(true);
    try {
      const created = await onCreateAuthor(name);
      setLocalAuthors((prev) => [...prev, created]);
      handleChange("author_ids", [...values.author_ids, created.id]);
      setNewAuthorName("");
    } finally {
      setAddingAuthor(false);
    }
  };
  return /* @__PURE__ */ jsxs("form", { className: "space-y-4", onSubmit: handleSubmit, children: [
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "title", children: "Title" }),
      /* @__PURE__ */ jsx(
        Input,
        {
          id: "title",
          required: true,
          value: values.title,
          onChange: (e) => handleChange("title", e.target.value)
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx(Label, { children: "Authors" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Select from the catalog or add a new author." }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2", children: [
        localAuthors.map((author) => {
          const checked = values.author_ids.includes(author.id);
          return /* @__PURE__ */ jsxs(
            "label",
            {
              className: "flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm",
              children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "checkbox",
                    checked,
                    onChange: (e) => {
                      const next = e.target.checked ? [...values.author_ids, author.id] : values.author_ids.filter((id) => id !== author.id);
                      handleChange("author_ids", next);
                    },
                    className: "h-4 w-4 rounded border-gray-300"
                  }
                ),
                /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: author.name })
              ]
            },
            author.id
          );
        }),
        localAuthors.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "No authors yet." })
      ] }),
      onCreateAuthor && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 pt-2", children: [
        /* @__PURE__ */ jsx(
          Input,
          {
            placeholder: "New author name",
            value: newAuthorName,
            onChange: (e) => setNewAuthorName(e.target.value),
            onKeyDown: (e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addAuthor();
              }
            }
          }
        ),
        /* @__PURE__ */ jsx(Button, { type: "button", onClick: addAuthor, disabled: addingAuthor, children: addingAuthor ? "Adding…" : "Add" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx(Label, { children: "Cover image" }),
      /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(
          "label",
          {
            htmlFor: "cover",
            className: "inline-flex cursor-pointer items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100",
            children: "Choose file"
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            id: "cover",
            type: "file",
            accept: "image/*",
            onChange: (e) => {
              const selected = e.target.files?.[0] ?? null;
              setFile(selected);
              if (selected) {
                setCoverPreview(URL.createObjectURL(selected));
              }
            },
            className: "hidden"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col text-sm text-gray-600", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: file?.name ?? coverPreview ? "Preview loaded" : "No file chosen" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500", children: "JPG/PNG, up to 5MB" })
        ] }),
        coverPreview && /* @__PURE__ */ jsx(
          "img",
          {
            src: coverPreview,
            alt: "Cover preview",
            className: "h-16 w-12 rounded-md border border-gray-200 object-cover ml-auto"
          }
        )
      ] }) })
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
          rows: 4
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "price", children: "Price (MZN)" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "price",
            type: "number",
            min: 0,
            value: values.price_mzn,
            onChange: (e) => handleChange("price_mzn", Number(e.target.value))
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "stock", children: "Stock" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "stock",
            type: "number",
            min: 0,
            value: values.stock,
            onChange: (e) => handleChange("stock", Number(e.target.value))
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "isbn", children: "ISBN" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "isbn",
            value: values.isbn,
            onChange: (e) => handleChange("isbn", e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "publisher", children: "Publisher" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "publisher",
            value: values.publisher,
            onChange: (e) => handleChange("publisher", e.target.value)
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "category", children: "Category" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "category",
            value: values.category,
            onChange: (e) => handleChange("category", e.target.value)
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
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "seo_title", children: "SEO title" }),
      /* @__PURE__ */ jsx(
        Input,
        {
          id: "seo_title",
          value: values.seo_title,
          onChange: (e) => handleChange("seo_title", e.target.value)
        }
      ),
      /* @__PURE__ */ jsx(Label, { htmlFor: "seo_description", className: "pt-1", children: "SEO description" }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          id: "seo_description",
          value: values.seo_description,
          onChange: (e) => handleChange("seo_description", e.target.value),
          className: "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          rows: 2
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-4", children: [
      /* @__PURE__ */ jsxs("label", { className: "inline-flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "checkbox",
            checked: values.featured,
            onChange: (e) => handleChange("featured", e.target.checked),
            className: "h-4 w-4 rounded border-gray-300"
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: "Featured" })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "inline-flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "checkbox",
            checked: values.is_active,
            onChange: (e) => handleChange("is_active", e.target.checked),
            className: "h-4 w-4 rounded border-gray-300"
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: "Active" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
      /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", onClick: onCancel, children: "Cancel" }),
      /* @__PURE__ */ jsx(Button, { type: "submit", disabled: submitting, children: submitting ? "Saving…" : "Save" })
    ] })
  ] });
}
function AdminBooksPage() {
  const {
    profile,
    session,
    signOut
  } = useAuth();
  const userName = profile?.name ?? session?.user.email ?? "Admin";
  const userEmail = session?.user.email ?? "";
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [detailBook, setDetailBook] = useState(null);
  const authorsQuery = useQuery({
    queryKey: ["admin", "authors", "list"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("authors").select("id, name, photo_path").order("name", {
        ascending: true
      });
      if (error) throw error;
      return data;
    },
    staleTime: 6e4
  });
  const booksQuery = useQuery({
    queryKey: ["admin", "books"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("books").select("id, title, slug, price_mzn, stock, category, language, is_active, featured, cover_url, cover_path, description, description_json, isbn, publisher, seo_title, seo_description, authors:authors_books(author_id, authors(id, name, photo_path))").order("created_at", {
        ascending: false
      });
      if (error) throw error;
      return data;
    },
    staleTime: 3e4
  });
  const toggleActive = useMutation({
    mutationFn: async (payload) => {
      const {
        error
      } = await supabase.from("books").update({
        is_active: payload.is_active
      }).eq("id", payload.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "books"]
      });
      toast.success("Status updated");
    },
    onError: (err) => toast.error(err.message ?? "Failed to update status")
  });
  const toggleFeatured = useMutation({
    mutationFn: async (payload) => {
      const {
        error
      } = await supabase.from("books").update({
        featured: payload.featured
      }).eq("id", payload.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "books"]
      });
      toast.success("Featured updated");
    },
    onError: (err) => toast.error(err.message ?? "Failed to update featured")
  });
  useMutation({
    mutationFn: async (payload) => {
      const {
        error
      } = await supabase.from("books").update({
        stock: payload.stock
      }).eq("id", payload.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "books"]
      });
    }
  });
  const formatPrice = (value) => new Intl.NumberFormat("pt-MZ", {
    style: "currency",
    currency: "MZN",
    maximumFractionDigits: 0
  }).format(value);
  const coverUrlFor = (book) => {
    if (book.cover_url) return book.cover_url;
    if (book.cover_path) {
      return supabase.storage.from("covers").getPublicUrl(book.cover_path).data.publicUrl;
    }
    return null;
  };
  const addAuthor = useMutation({
    mutationFn: async (name) => {
      const {
        data,
        error
      } = await supabase.from("authors").insert({
        name
      }).select("id, name, photo_path").single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "authors", "list"]
      });
      toast.success("Author added");
    },
    onError: (err) => toast.error(err.message ?? "Failed to add author")
  });
  const uploadCover = async (file, bookId) => {
    const path = `covers/${bookId}/${Date.now()}-${file.name}`;
    const {
      error: uploadError
    } = await supabase.storage.from("covers").upload(path, file, {
      upsert: true
    });
    if (uploadError) throw uploadError;
    const {
      data
    } = supabase.storage.from("covers").getPublicUrl(path);
    return {
      path,
      publicUrl: data.publicUrl
    };
  };
  const upsertBook = useMutation({
    mutationFn: async (payload) => {
      const author_ids = payload.author_ids;
      const bookId = payload.id ?? crypto.randomUUID?.() ?? Date.now().toString();
      let cover_url = payload.cover_url;
      let cover_path = payload.cover_path;
      if (payload.file) {
        const uploaded = await uploadCover(payload.file, bookId);
        cover_url = uploaded.publicUrl;
        cover_path = uploaded.path;
      }
      const description_json = payload.description ? {
        type: "doc",
        content: [{
          type: "paragraph",
          content: [{
            type: "text",
            text: payload.description
          }]
        }]
      } : null;
      const base = {
        ...payload,
        id: payload.id ?? bookId,
        cover_url,
        cover_path,
        description_json
      };
      delete base.file;
      delete base.author_ids;
      if (payload.id) {
        const {
          error
        } = await supabase.from("books").update(base).eq("id", payload.id);
        if (error) throw error;
      } else {
        const {
          error
        } = await supabase.from("books").insert(base);
        if (error) throw error;
      }
      await supabase.from("authors_books").delete().eq("book_id", bookId);
      if (author_ids && author_ids.length > 0) {
        const {
          error
        } = await supabase.from("authors_books").insert(author_ids.map((author_id) => ({
          author_id,
          book_id: bookId
        })));
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "books"]
      });
      setShowForm(false);
      setEditingBook(null);
      toast.success("Book saved");
    },
    onError: (err) => toast.error(err.message ?? "Failed to save book")
  });
  const deleteBook = useMutation({
    mutationFn: async (id) => {
      const {
        error
      } = await supabase.from("books").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "books"]
      });
      toast.success("Book deleted");
    },
    onError: (err) => toast.error(err.message ?? "Failed to delete book")
  });
  return /* @__PURE__ */ jsx(AdminGuard, { children: /* @__PURE__ */ jsx(DashboardLayout, { userRole: profile?.role ?? "admin", userName, userEmail, onSignOut: signOut, children: /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm uppercase text-gray-500", children: "Catalog" }),
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-gray-900", children: "Books" })
      ] }),
      /* @__PURE__ */ jsx(Button, { onClick: () => {
        setEditingBook(null);
        setShowForm(true);
      }, children: "Add book" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-gray-200 p-4 bg-white", children: booksQuery.isLoading ? /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Loading books…" }) : booksQuery.isError ? /* @__PURE__ */ jsx("p", { className: "text-sm text-rose-600", children: "Failed to load books. Check connection or permissions." }) : /* @__PURE__ */ jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableHead, { children: "Title" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Authors" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Category" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Language" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Price" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Stock" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { children: booksQuery.data?.map((book) => /* @__PURE__ */ jsxs(TableRow, { className: "align-middle cursor-pointer hover:bg-gray-50", onClick: () => setDetailBook(book), children: [
        /* @__PURE__ */ jsx(TableCell, { className: "font-medium text-gray-900", children: book.title }),
        /* @__PURE__ */ jsx(TableCell, { className: "text-gray-600", children: book.authors?.map((a) => a.authors?.name).filter(Boolean).join(", ") || "—" }),
        /* @__PURE__ */ jsx(TableCell, { className: "text-gray-600", children: book.category ?? "—" }),
        /* @__PURE__ */ jsx(TableCell, { className: "text-gray-600", children: book.language?.toUpperCase() }),
        /* @__PURE__ */ jsx(TableCell, { className: "text-gray-900", children: formatPrice(book.price_mzn) }),
        /* @__PURE__ */ jsx(TableCell, { className: "text-gray-900", children: book.stock }),
        /* @__PURE__ */ jsx(TableCell, { className: "text-sm", children: /* @__PURE__ */ jsxs(DropdownMenu, { children: [
          /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onMouseDown: (e) => e.stopPropagation(), onClickCapture: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsx(Ellipsis, { className: "h-4 w-4" }) }) }),
          /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", onClick: (e) => e.stopPropagation(), children: [
            /* @__PURE__ */ jsx(DropdownMenuLabel, { children: "Actions" }),
            /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
            /* @__PURE__ */ jsx(DropdownMenuItem, { onClick: () => setDetailBook(book), children: "View details" }),
            /* @__PURE__ */ jsx(DropdownMenuItem, { onClick: () => {
              setEditingBook(book);
              setShowForm(true);
            }, children: "Edit" }),
            /* @__PURE__ */ jsx(DropdownMenuItem, { onClick: () => toggleFeatured.mutate({
              id: book.id,
              featured: !book.featured
            }), children: book.featured ? "Unfeature" : "Mark featured" }),
            /* @__PURE__ */ jsx(DropdownMenuItem, { onClick: () => toggleActive.mutate({
              id: book.id,
              is_active: !book.is_active
            }), children: book.is_active ? "Deactivate" : "Activate" }),
            /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
            /* @__PURE__ */ jsx(DropdownMenuItem, { className: "text-destructive focus:text-destructive", onClick: () => deleteBook.mutate(book.id), children: "Delete" })
          ] })
        ] }) })
      ] }, book.id)) }),
      booksQuery.data?.length === 0 && /* @__PURE__ */ jsx(TableCaption, { children: "No books yet." })
    ] }) }) }),
    /* @__PURE__ */ jsx(Sheet, { open: showForm, onOpenChange: setShowForm, children: /* @__PURE__ */ jsxs(SheetContent, { className: "w-full sm:max-w-xl px-4 overflow-hidden", children: [
      /* @__PURE__ */ jsxs(SheetHeader, { children: [
        /* @__PURE__ */ jsx(SheetTitle, { children: editingBook ? "Edit book" : "Add book" }),
        /* @__PURE__ */ jsx(SheetDescription, { children: "Manage title, slug, pricing, stock, and visibility." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "pt-4 max-h-[80vh] overflow-y-auto pr-2 space-y-4", children: /* @__PURE__ */ jsx(BookForm, { initial: editingBook ? {
        title: editingBook.title,
        slug: editingBook.slug,
        price_mzn: editingBook.price_mzn,
        stock: editingBook.stock,
        category: editingBook.category ?? "",
        language: editingBook.language,
        is_active: editingBook.is_active,
        featured: editingBook.featured ?? false,
        cover_url: editingBook.cover_url ?? "",
        cover_path: editingBook.cover_path ?? "",
        description: editingBook.description ?? "",
        isbn: editingBook.isbn ?? "",
        publisher: editingBook.publisher ?? "",
        seo_title: editingBook.seo_title ?? "",
        seo_description: editingBook.seo_description ?? "",
        author_ids: editingBook.authors?.map((a) => a.author_id) ?? []
      } : void 0, submitting: upsertBook.isPending, onSubmit: async (vals, file) => {
        await upsertBook.mutateAsync({
          ...vals,
          id: editingBook?.id,
          file
        });
      }, authors: authorsQuery.data?.map((a) => ({
        id: a.id,
        name: a.name ?? "Autor"
      })) ?? [], onCreateAuthor: (name) => addAuthor.mutateAsync(name), onCancel: () => {
        setShowForm(false);
        setEditingBook(null);
      } }) })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: !!detailBook, onOpenChange: () => setDetailBook(null), children: /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-xl", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: detailBook?.title ?? "Book detail" }),
        /* @__PURE__ */ jsx(DialogDescription, { children: detailBook?.seo_description ?? detailBook?.description ?? "Book details" })
      ] }),
      detailBook && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        coverUrlFor(detailBook) && /* @__PURE__ */ jsx("img", { src: coverUrlFor(detailBook) ?? "", alt: detailBook.title, className: "w-full max-h-64 rounded-xl object-cover border border-gray-200" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "Price" }),
            /* @__PURE__ */ jsx("p", { className: "font-semibold text-gray-900", children: formatPrice(detailBook.price_mzn) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "Stock" }),
            /* @__PURE__ */ jsx("p", { className: "font-semibold text-gray-900", children: detailBook.stock })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "Category" }),
            /* @__PURE__ */ jsx("p", { className: "font-semibold text-gray-900", children: detailBook.category ?? "—" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "Language" }),
            /* @__PURE__ */ jsx("p", { className: "font-semibold text-gray-900", children: detailBook.language?.toUpperCase() })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "ISBN" }),
            /* @__PURE__ */ jsx("p", { className: "font-semibold text-gray-900", children: detailBook.isbn ?? "—" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "Publisher" }),
            /* @__PURE__ */ jsx("p", { className: "font-semibold text-gray-900", children: detailBook.publisher ?? "—" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "Featured" }),
            /* @__PURE__ */ jsx("p", { className: "font-semibold text-gray-900", children: detailBook.featured ? "Yes" : "No" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "Active" }),
            /* @__PURE__ */ jsx("p", { className: "font-semibold text-gray-900", children: detailBook.is_active ? "Yes" : "No" })
          ] })
        ] }),
        detailBook.authors && detailBook.authors.length > 0 && /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm", children: "Authors" }),
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-gray-900", children: detailBook.authors.map((a) => a.authors?.name).filter(Boolean).join(", ") })
        ] }),
        detailBook.description && /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm", children: "Description" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-900 whitespace-pre-line", children: detailBook.description })
        ] }),
        (detailBook.seo_title || detailBook.seo_description) && /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm", children: "SEO" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-900 font-semibold", children: detailBook.seo_title }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-700 text-sm", children: detailBook.seo_description })
        ] })
      ] })
    ] }) })
  ] }) }) });
}
export {
  AdminBooksPage as component
};
