import { createRouter, createRootRoute, createFileRoute, lazyRouteComponent, redirect, HeadContent, Scripts } from "@tanstack/react-router";
import { jsxs, jsx } from "react/jsx-runtime";
import { QueryClientProvider, QueryClient, useQueryClient, useQuery } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { Component, useEffect, useCallback, useMemo, createContext, useState, useContext } from "react";
import { createClient } from "@supabase/supabase-js";
import { c as createServerFn, T as TSS_SERVER_FUNCTION, g as getServerFnById } from "./server.mjs";
import "node:async_hooks";
import "@tanstack/react-router/ssr/server";
function json(payload, init) {
  return Response.json(payload, init);
}
const supabaseUrl = "https://kakesgsqdjhrbcdhicey.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtha2VzZ3NxZGpocmJjZGhpY2V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NjkyODYsImV4cCI6MjA4MzA0NTI4Nn0.nuQZcCOQnfNZ7S3VLSrn0cmDz7-hkRYX-RNsI3a_1iw";
const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);
const AuthContext = createContext(void 0);
function AuthProvider({ children }) {
  const queryClient2 = useQueryClient();
  const ensureProfile = async (userId, name, email) => {
    const normalizedEmail = email?.toLowerCase().trim();
    const { data: existing, error: existingError } = await supabase.from("profiles").select("id, email").eq("id", userId).maybeSingle();
    if (existingError) return new Error(existingError.message);
    if (existing) {
      if (!existing.email && normalizedEmail) {
        const { error: error2 } = await supabase.from("profiles").update({ email: normalizedEmail }).eq("id", userId);
        return error2 ? new Error(error2.message) : null;
      }
      return null;
    }
    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      name: name ?? "Catalogus User",
      role: "customer",
      email: normalizedEmail ?? null
    });
    return error ? new Error(error.message) : null;
  };
  const fetchProfile = async (userId) => {
    const { data, error } = await supabase.from("profiles").select("id, role, status, name, email, phone, bio, photo_url, photo_path, social_links, birth_date, residence_city, province, published_works, author_gallery, featured_video, author_type").eq("id", userId).maybeSingle();
    if (error) throw error;
    return data ?? null;
  };
  const sessionQuery = useQuery({
    queryKey: ["auth", "session"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Session fetch error:", error);
          return null;
        }
        return data.session ?? null;
      } catch (err) {
        console.error("Session query failed:", err);
        return null;
      }
    },
    staleTime: Infinity,
    retry: 1,
    refetchOnWindowFocus: false,
    networkMode: "online"
  });
  const profileQuery = useQuery({
    queryKey: ["profile", sessionQuery.data?.user?.id],
    queryFn: async () => {
      try {
        return await fetchProfile(sessionQuery.data.user.id);
      } catch (err) {
        console.error("Profile fetch error:", err);
        return null;
      }
    },
    enabled: !!sessionQuery.data?.user?.id,
    staleTime: 5 * 60 * 1e3,
    retry: 1,
    refetchOnWindowFocus: false,
    networkMode: "online"
  });
  const loading = sessionQuery.status === "pending" || !!sessionQuery.data?.user?.id && profileQuery.status === "pending";
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, nextSession) => {
        queryClient2.setQueryData(["auth", "session"], nextSession);
        if (nextSession?.user?.id) {
          await queryClient2.invalidateQueries({
            queryKey: ["profile", nextSession.user.id]
          });
        } else {
          queryClient2.removeQueries({ queryKey: ["profile"] });
        }
      }
    );
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [queryClient2]);
  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (!error && data.session?.user?.id) {
      const profileError = await ensureProfile(
        data.session.user.id,
        data.session.user.user_metadata?.name ?? email,
        email
      );
      if (profileError) return { error: profileError };
      queryClient2.setQueryData(["auth", "session"], data.session);
      await queryClient2.invalidateQueries({
        queryKey: ["profile", data.session.user.id]
      });
    }
    return { error };
  }, [queryClient2]);
  const signUp = useCallback(async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });
    if (!error && data.session?.user?.id) {
      const profileError = await ensureProfile(
        data.session.user.id,
        name ?? email,
        email
      );
      if (profileError) return { error: profileError };
      queryClient2.setQueryData(["auth", "session"], data.session);
      await queryClient2.invalidateQueries({
        queryKey: ["profile", data.session.user.id]
      });
    }
    return { error };
  }, [queryClient2]);
  const signUpAuthor = useCallback(async (email, password, name, phone, bio, photoFile) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, phone, bio }
        }
      });
      if (error) return { error };
      if (data.user) {
        let photo_path = null;
        let photo_url = null;
        if (photoFile) {
          const path = `author-photos/${data.user.id}/${Date.now()}-${photoFile.name}`;
          const { error: uploadError } = await supabase.storage.from("author-photos").upload(path, photoFile, { upsert: true });
          if (!uploadError) {
            photo_path = path;
            const { data: urlData } = supabase.storage.from("author-photos").getPublicUrl(path);
            photo_url = urlData.publicUrl;
          }
        }
        const { data: existingProfile } = await supabase.from("profiles").select("id, role").eq("id", data.user.id).single();
        let profileError;
        if (existingProfile) {
          const { error: error2 } = await supabase.from("profiles").update({
            name,
            email: email.toLowerCase().trim(),
            phone,
            bio: bio || null,
            photo_url,
            photo_path,
            role: "author",
            status: "pending",
            social_links: {}
          }).eq("id", data.user.id);
          profileError = error2;
        } else {
          const { error: error2 } = await supabase.from("profiles").insert({
            id: data.user.id,
            name,
            email: email.toLowerCase().trim(),
            phone,
            bio: bio || null,
            photo_url,
            photo_path,
            role: "author",
            status: "pending",
            social_links: {}
          });
          profileError = error2;
        }
        if (profileError) return { error: new Error(profileError.message) };
        if (data.session) {
          queryClient2.setQueryData(["auth", "session"], data.session);
          await queryClient2.invalidateQueries({
            queryKey: ["profile", data.user.id]
          });
        }
      }
      return { error: null };
    } catch (err) {
      return { error: err };
    }
  }, [queryClient2]);
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    queryClient2.setQueryData(["auth", "session"], null);
    queryClient2.removeQueries({ queryKey: ["profile"] });
  }, [queryClient2]);
  const value = useMemo(
    () => ({
      supabase,
      session: sessionQuery.data ?? null,
      profile: profileQuery.data ?? null,
      loading,
      signIn,
      signUp,
      signUpAuthor,
      signOut
    }),
    [sessionQuery.data, profileQuery.data, loading, signIn, signUp, signUpAuthor, signOut]
  );
  return /* @__PURE__ */ jsx(AuthContext.Provider, { value, children });
}
const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return /* @__PURE__ */ jsxs("div", { style: { padding: "2rem", fontFamily: "system-ui" }, children: [
        /* @__PURE__ */ jsx("h1", { style: { color: "#dc2626", marginBottom: "1rem" }, children: "Something went wrong" }),
        /* @__PURE__ */ jsx("p", { style: { marginBottom: "1rem", color: "#6b7280" }, children: this.state.error?.message || "An unexpected error occurred" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              this.setState({ hasError: false, error: null });
              window.location.href = "/";
            },
            style: {
              padding: "0.5rem 1rem",
              backgroundColor: "#000",
              color: "#fff",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer"
            },
            children: "Go to Home"
          }
        ),
        process.env.NODE_ENV === "development" && /* @__PURE__ */ jsx(
          "pre",
          {
            style: {
              marginTop: "1rem",
              padding: "1rem",
              backgroundColor: "#f3f4f6",
              borderRadius: "0.5rem",
              overflow: "auto",
              fontSize: "0.875rem"
            },
            children: this.state.error?.stack
          }
        )
      ] });
    }
    return this.props.children;
  }
}
const formatPrice = (value) => {
  if (value === null || value === void 0) return "0,00 MZN";
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "MZN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};
const formatPriceCompact = (value) => {
  if (value === null || value === void 0) return "0,00";
  return new Intl.NumberFormat("pt-PT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
const isValidMozambiquePhone = (phone) => {
  const cleaned = phone.replace(/[\s\-()]/g, "");
  const phoneRegex = /^(\+?258)?[0-9]{9}$/;
  return phoneRegex.test(cleaned);
};
const isInStock = (stock) => {
  return (stock ?? 0) > 0;
};
const getStockStatusLabel = (stock) => {
  const stockValue = stock ?? 0;
  if (stockValue === 0) return "Esgotado";
  if (stockValue <= 5) return `Apenas ${stockValue} em stock`;
  return "Em stock";
};
const getStockStatusColor = (stock) => {
  const stockValue = stock ?? 0;
  if (stockValue === 0) return "text-red-600";
  if (stockValue <= 5) return "text-orange-600";
  return "text-green-600";
};
const getMaxQuantity = (stock, limit = 10) => {
  const stockValue = stock ?? 0;
  return Math.min(stockValue, limit);
};
const truncateText = (text, maxLength) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
};
const calculateCartTotal = (items) => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};
const getOrderStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "paid":
    case "processing":
      return "bg-blue-100 text-blue-800";
    case "shipped":
      return "bg-purple-100 text-purple-800";
    case "delivered":
    case "completed":
      return "bg-green-100 text-green-800";
    case "cancelled":
    case "refunded":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
const getOrderStatusLabel = (status) => {
  switch (status) {
    case "pending":
      return "Pendente";
    case "paid":
      return "Pago";
    case "processing":
      return "Em processamento";
    case "shipped":
      return "Enviado";
    case "delivered":
      return "Entregue";
    case "completed":
      return "Concluído";
    case "cancelled":
      return "Cancelado";
    case "refunded":
      return "Reembolsado";
    default:
      return status;
  }
};
const CartContext = createContext(void 0);
const CART_STORAGE_KEY = "catalogus-cart";
async function hydrateCart(storedItems) {
  if (storedItems.length === 0) return [];
  const bookIds = storedItems.map((item) => item.id);
  const { data, error } = await supabase.from("books").select("id, title, slug, price_mzn, stock, cover_url, cover_path").in("id", bookIds).eq("is_active", true);
  if (error) {
    console.error("Error hydrating cart:", error);
    return [];
  }
  const books = data?.map((book) => {
    let coverUrl = book.cover_url;
    if (!coverUrl && book.cover_path) {
      const { data: urlData } = supabase.storage.from("covers").getPublicUrl(book.cover_path);
      coverUrl = urlData.publicUrl;
    }
    return {
      id: book.id,
      title: book.title,
      slug: book.slug,
      price: book.price_mzn ?? 0,
      stock: book.stock ?? 0,
      cover_url: coverUrl
    };
  });
  const cartItems = [];
  for (const stored of storedItems) {
    const book = books?.find((b) => b.id === stored.id);
    if (book) {
      const quantity = Math.min(stored.quantity, book.stock);
      if (quantity > 0) {
        cartItems.push({
          id: book.id,
          title: book.title,
          slug: book.slug,
          price: book.price,
          stock: book.stock,
          cover_url: book.cover_url,
          quantity
        });
      }
    }
  }
  return cartItems;
}
function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const loadCart = async () => {
      try {
        const saved = localStorage.getItem(CART_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const hydrated = await hydrateCart(parsed);
          setItems(hydrated);
        }
      } catch (error) {
        console.error("Error loading cart:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadCart();
  }, []);
  useEffect(() => {
    if (!isLoading) {
      const toStore = items.map((item) => ({ id: item.id, quantity: item.quantity }));
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(toStore));
    }
  }, [items, isLoading]);
  const addToCart = useCallback((book, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === book.id);
      if (existing) {
        const newQuantity = Math.min(existing.quantity + quantity, book.stock);
        return prev.map(
          (item) => item.id === book.id ? { ...item, quantity: newQuantity } : item
        );
      }
      const validQuantity = Math.min(quantity, book.stock);
      if (validQuantity <= 0) return prev;
      return [
        ...prev,
        {
          id: book.id,
          title: book.title,
          slug: book.slug,
          price: book.price_mzn ?? 0,
          stock: book.stock,
          cover_url: book.cover_url,
          quantity: validQuantity
        }
      ];
    });
  }, []);
  const removeFromCart = useCallback((bookId) => {
    setItems((prev) => prev.filter((item) => item.id !== bookId));
  }, []);
  const updateQuantity = useCallback((bookId, quantity) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.id !== bookId);
      }
      return prev.map((item) => {
        if (item.id === bookId) {
          const validQuantity = Math.min(quantity, item.stock);
          return { ...item, quantity: validQuantity };
        }
        return item;
      });
    });
  }, []);
  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);
  const total = calculateCartTotal(items);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    total,
    count,
    isLoading
  };
  return /* @__PURE__ */ jsx(CartContext.Provider, { value, children });
}
function useCart() {
  const context = useContext(CartContext);
  if (context === void 0) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
const appCss = "/assets/styles-B7IKt73g.css";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1e3,
      retry: 1
    }
  }
});
const Route$z = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8"
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      },
      {
        title: "TanStack Start Starter"
      }
    ],
    links: [
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com"
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous"
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
      },
      {
        rel: "stylesheet",
        href: appCss
      }
    ]
  }),
  shellComponent: RootDocument
});
function RootDocument({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { children: [
      /* @__PURE__ */ jsx(ErrorBoundary, { children: /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx(AuthProvider, { children: /* @__PURE__ */ jsxs(CartProvider, { children: [
        children,
        /* @__PURE__ */ jsx(Toaster, { position: "top-right", richColors: true })
      ] }) }) }) }),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
const $$splitComponentImporter$w = () => import("./index-BhKMS4R7.mjs");
const Route$y = createFileRoute("/")({
  component: lazyRouteComponent($$splitComponentImporter$w, "component")
});
const $$splitComponentImporter$v = () => import("./index-DhykVBcS.mjs");
const Route$x = createFileRoute("/noticias/")({
  validateSearch: (search) => ({
    q: typeof search.q === "string" ? search.q : void 0,
    categoria: typeof search.categoria === "string" ? search.categoria : void 0,
    tag: typeof search.tag === "string" ? search.tag : void 0
  }),
  component: lazyRouteComponent($$splitComponentImporter$v, "component")
});
const $$splitComponentImporter$u = () => import("./index-C3iuEZx3.mjs");
const Route$w = createFileRoute("/meus-pedidos/")({
  component: lazyRouteComponent($$splitComponentImporter$u, "component")
});
const $$splitComponentImporter$t = () => import("./index-B7Ftm9ct.mjs");
const Route$v = createFileRoute("/loja/")({
  component: lazyRouteComponent($$splitComponentImporter$t, "component")
});
const $$splitComponentImporter$s = () => import("./index-BpKBxYwV.mjs");
const Route$u = createFileRoute("/checkout/")({
  component: lazyRouteComponent($$splitComponentImporter$s, "component")
});
const $$splitComponentImporter$r = () => import("./index-CcKU3tI5.mjs");
const Route$t = createFileRoute("/carrinho/")({
  component: lazyRouteComponent($$splitComponentImporter$r, "component")
});
const $$splitComponentImporter$q = () => import("./index-BJjcXDk2.mjs");
const Route$s = createFileRoute("/autores/")({
  component: lazyRouteComponent($$splitComponentImporter$q, "component")
});
const Route$r = createFileRoute("/admin/")({
  loader: () => redirect({ to: "/admin/dashboard" })
});
const $$splitComponentImporter$p = () => import("./_orderId-DL044gbX.mjs");
const Route$q = createFileRoute("/pedido/$orderId")({
  component: lazyRouteComponent($$splitComponentImporter$p, "component")
});
const $$splitComponentImporter$o = () => import("./_slug-BGgKNgNO.mjs");
const Route$p = createFileRoute("/noticias/$slug")({
  component: lazyRouteComponent($$splitComponentImporter$o, "component")
});
const $$splitComponentImporter$n = () => import("./_bookId-BYnQAoRv.mjs");
const Route$o = createFileRoute("/livro/$bookId")({
  component: lazyRouteComponent($$splitComponentImporter$n, "component")
});
const $$splitComponentImporter$m = () => import("./_authorId-CnsrVXMk.mjs");
const Route$n = createFileRoute("/autor/$authorId")({
  component: lazyRouteComponent($$splitComponentImporter$m, "component")
});
const $$splitComponentImporter$l = () => import("./sign-up-BoaJ-iga.mjs");
const Route$m = createFileRoute("/author/sign-up")({
  component: lazyRouteComponent($$splitComponentImporter$l, "component")
});
const $$splitComponentImporter$k = () => import("./sign-in-Zg4gPqii.mjs");
const Route$l = createFileRoute("/author/sign-in")({
  component: lazyRouteComponent($$splitComponentImporter$k, "component")
});
const $$splitComponentImporter$j = () => import("./profile--pll-AR2.mjs");
const Route$k = createFileRoute("/author/profile")({
  component: lazyRouteComponent($$splitComponentImporter$j, "component")
});
const $$splitComponentImporter$i = () => import("./sign-up-CCW8h5WL.mjs");
const Route$j = createFileRoute("/auth/sign-up")({
  validateSearch: (search) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : null
  }),
  component: lazyRouteComponent($$splitComponentImporter$i, "component")
});
const $$splitComponentImporter$h = () => import("./sign-in-X9e_yIYl.mjs");
const Route$i = createFileRoute("/auth/sign-in")({
  validateSearch: (search) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : null
  }),
  component: lazyRouteComponent($$splitComponentImporter$h, "component")
});
const $$splitComponentImporter$g = () => import("./users-8FUrN3wO.mjs");
const Route$h = createFileRoute("/admin/users")({
  component: lazyRouteComponent($$splitComponentImporter$g, "component")
});
const $$splitComponentImporter$f = () => import("./posts-CIf1sQ3m.mjs");
const Route$g = createFileRoute("/admin/posts")({
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
const $$splitComponentImporter$e = () => import("./orders-C0D6ENSZ.mjs");
const Route$f = createFileRoute("/admin/orders")({
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./hero-slides-BgYAbvqt.mjs");
const Route$e = createFileRoute("/admin/hero-slides")({
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./dashboard-Cz3DdBn4.mjs");
const Route$d = createFileRoute("/admin/dashboard")({
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./content-BQim7AVJ.mjs");
const Route$c = createFileRoute("/admin/content")({
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./books-BHBtSxk3.mjs");
const Route$b = createFileRoute("/admin/books")({
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./authors-B4q0he8G.mjs");
const Route$a = createFileRoute("/admin/authors")({
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const createSsrRpc = (functionId, importer) => {
  const url = "/_serverFn/" + functionId;
  const fn = async (...args) => {
    const serverFn = await getServerFnById(functionId);
    return serverFn(...args);
  };
  return Object.assign(fn, {
    url,
    functionId,
    [TSS_SERVER_FUNCTION]: true
  });
};
const $$splitComponentImporter$8 = () => import("./start.server-funcs-CIZhtMkj.mjs");
const getTodos = createServerFn({
  method: "GET"
}).handler(createSsrRpc("c9d51a5243700889c80f82ed57a4ce74b25f188e5ebd534c9c64965dc44e8e8d"));
const Route$9 = createFileRoute("/demo/start/server-funcs")({
  component: lazyRouteComponent($$splitComponentImporter$8, "component"),
  loader: async () => await getTodos()
});
const $$splitComponentImporter$7 = () => import("./start.api-request-DhPN1_Dc.mjs");
const Route$8 = createFileRoute("/demo/start/api-request")({
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const Route$7 = createFileRoute("/demo/api/names")({
  server: {
    handlers: {
      GET: () => json(["Alice", "Bob", "Charlie"])
    }
  }
});
const $$splitComponentImporter$6 = () => import("./content.services-BLgkJwgb.mjs");
const Route$6 = createFileRoute("/admin/content/services")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./content.projects-6dVjyb32.mjs");
const Route$5 = createFileRoute("/admin/content/projects")({
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./content.partners-_d1d3GEW.mjs");
const Route$4 = createFileRoute("/admin/content/partners")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./start.ssr.index-BmCCCK3g.mjs");
const Route$3 = createFileRoute("/demo/start/ssr/")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./start.ssr.spa-mode-DYJ0B00w.mjs");
const Route$2 = createFileRoute("/demo/start/ssr/spa-mode")({
  ssr: false,
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const getPunkSongs = createServerFn({
  method: "GET"
}).handler(createSsrRpc("f74da881407a186b78a7af058df21dafb0126eb11e5a4d54fd322e8feb5038f1"));
const $$splitComponentImporter$1 = () => import("./start.ssr.full-ssr-C8EI-kSP.mjs");
const Route$1 = createFileRoute("/demo/start/ssr/full-ssr")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component"),
  loader: async () => await getPunkSongs()
});
const $$splitComponentImporter = () => import("./start.ssr.data-only-CRs4EnpM.mjs");
const Route = createFileRoute("/demo/start/ssr/data-only")({
  ssr: "data-only",
  component: lazyRouteComponent($$splitComponentImporter, "component"),
  loader: async () => await getPunkSongs()
});
const IndexRoute = Route$y.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$z
});
const NoticiasIndexRoute = Route$x.update({
  id: "/noticias/",
  path: "/noticias/",
  getParentRoute: () => Route$z
});
const MeusPedidosIndexRoute = Route$w.update({
  id: "/meus-pedidos/",
  path: "/meus-pedidos/",
  getParentRoute: () => Route$z
});
const LojaIndexRoute = Route$v.update({
  id: "/loja/",
  path: "/loja/",
  getParentRoute: () => Route$z
});
const CheckoutIndexRoute = Route$u.update({
  id: "/checkout/",
  path: "/checkout/",
  getParentRoute: () => Route$z
});
const CarrinhoIndexRoute = Route$t.update({
  id: "/carrinho/",
  path: "/carrinho/",
  getParentRoute: () => Route$z
});
const AutoresIndexRoute = Route$s.update({
  id: "/autores/",
  path: "/autores/",
  getParentRoute: () => Route$z
});
const AdminIndexRoute = Route$r.update({
  id: "/admin/",
  path: "/admin/",
  getParentRoute: () => Route$z
});
const PedidoOrderIdRoute = Route$q.update({
  id: "/pedido/$orderId",
  path: "/pedido/$orderId",
  getParentRoute: () => Route$z
});
const NoticiasSlugRoute = Route$p.update({
  id: "/noticias/$slug",
  path: "/noticias/$slug",
  getParentRoute: () => Route$z
});
const LivroBookIdRoute = Route$o.update({
  id: "/livro/$bookId",
  path: "/livro/$bookId",
  getParentRoute: () => Route$z
});
const AutorAuthorIdRoute = Route$n.update({
  id: "/autor/$authorId",
  path: "/autor/$authorId",
  getParentRoute: () => Route$z
});
const AuthorSignUpRoute = Route$m.update({
  id: "/author/sign-up",
  path: "/author/sign-up",
  getParentRoute: () => Route$z
});
const AuthorSignInRoute = Route$l.update({
  id: "/author/sign-in",
  path: "/author/sign-in",
  getParentRoute: () => Route$z
});
const AuthorProfileRoute = Route$k.update({
  id: "/author/profile",
  path: "/author/profile",
  getParentRoute: () => Route$z
});
const AuthSignUpRoute = Route$j.update({
  id: "/auth/sign-up",
  path: "/auth/sign-up",
  getParentRoute: () => Route$z
});
const AuthSignInRoute = Route$i.update({
  id: "/auth/sign-in",
  path: "/auth/sign-in",
  getParentRoute: () => Route$z
});
const AdminUsersRoute = Route$h.update({
  id: "/admin/users",
  path: "/admin/users",
  getParentRoute: () => Route$z
});
const AdminPostsRoute = Route$g.update({
  id: "/admin/posts",
  path: "/admin/posts",
  getParentRoute: () => Route$z
});
const AdminOrdersRoute = Route$f.update({
  id: "/admin/orders",
  path: "/admin/orders",
  getParentRoute: () => Route$z
});
const AdminHeroSlidesRoute = Route$e.update({
  id: "/admin/hero-slides",
  path: "/admin/hero-slides",
  getParentRoute: () => Route$z
});
const AdminDashboardRoute = Route$d.update({
  id: "/admin/dashboard",
  path: "/admin/dashboard",
  getParentRoute: () => Route$z
});
const AdminContentRoute = Route$c.update({
  id: "/admin/content",
  path: "/admin/content",
  getParentRoute: () => Route$z
});
const AdminBooksRoute = Route$b.update({
  id: "/admin/books",
  path: "/admin/books",
  getParentRoute: () => Route$z
});
const AdminAuthorsRoute = Route$a.update({
  id: "/admin/authors",
  path: "/admin/authors",
  getParentRoute: () => Route$z
});
const DemoStartServerFuncsRoute = Route$9.update({
  id: "/demo/start/server-funcs",
  path: "/demo/start/server-funcs",
  getParentRoute: () => Route$z
});
const DemoStartApiRequestRoute = Route$8.update({
  id: "/demo/start/api-request",
  path: "/demo/start/api-request",
  getParentRoute: () => Route$z
});
const DemoApiNamesRoute = Route$7.update({
  id: "/demo/api/names",
  path: "/demo/api/names",
  getParentRoute: () => Route$z
});
const AdminContentServicesRoute = Route$6.update({
  id: "/services",
  path: "/services",
  getParentRoute: () => AdminContentRoute
});
const AdminContentProjectsRoute = Route$5.update({
  id: "/projects",
  path: "/projects",
  getParentRoute: () => AdminContentRoute
});
const AdminContentPartnersRoute = Route$4.update({
  id: "/partners",
  path: "/partners",
  getParentRoute: () => AdminContentRoute
});
const DemoStartSsrIndexRoute = Route$3.update({
  id: "/demo/start/ssr/",
  path: "/demo/start/ssr/",
  getParentRoute: () => Route$z
});
const DemoStartSsrSpaModeRoute = Route$2.update({
  id: "/demo/start/ssr/spa-mode",
  path: "/demo/start/ssr/spa-mode",
  getParentRoute: () => Route$z
});
const DemoStartSsrFullSsrRoute = Route$1.update({
  id: "/demo/start/ssr/full-ssr",
  path: "/demo/start/ssr/full-ssr",
  getParentRoute: () => Route$z
});
const DemoStartSsrDataOnlyRoute = Route.update({
  id: "/demo/start/ssr/data-only",
  path: "/demo/start/ssr/data-only",
  getParentRoute: () => Route$z
});
const AdminContentRouteChildren = {
  AdminContentPartnersRoute,
  AdminContentProjectsRoute,
  AdminContentServicesRoute
};
const AdminContentRouteWithChildren = AdminContentRoute._addFileChildren(
  AdminContentRouteChildren
);
const rootRouteChildren = {
  IndexRoute,
  AdminAuthorsRoute,
  AdminBooksRoute,
  AdminContentRoute: AdminContentRouteWithChildren,
  AdminDashboardRoute,
  AdminHeroSlidesRoute,
  AdminOrdersRoute,
  AdminPostsRoute,
  AdminUsersRoute,
  AuthSignInRoute,
  AuthSignUpRoute,
  AuthorProfileRoute,
  AuthorSignInRoute,
  AuthorSignUpRoute,
  AutorAuthorIdRoute,
  LivroBookIdRoute,
  NoticiasSlugRoute,
  PedidoOrderIdRoute,
  AdminIndexRoute,
  AutoresIndexRoute,
  CarrinhoIndexRoute,
  CheckoutIndexRoute,
  LojaIndexRoute,
  MeusPedidosIndexRoute,
  NoticiasIndexRoute,
  DemoApiNamesRoute,
  DemoStartApiRequestRoute,
  DemoStartServerFuncsRoute,
  DemoStartSsrDataOnlyRoute,
  DemoStartSsrFullSsrRoute,
  DemoStartSsrSpaModeRoute,
  DemoStartSsrIndexRoute
};
const routeTree = Route$z._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const router2 = createRouter({
    routeTree,
    context: {},
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Route$x as R,
  getOrderStatusLabel as a,
  formatPriceCompact as b,
  useCart as c,
  isValidMozambiquePhone as d,
  getMaxQuantity as e,
  formatPrice as f,
  getOrderStatusColor as g,
  Route$q as h,
  isValidEmail as i,
  Route$p as j,
  Route$o as k,
  isInStock as l,
  getStockStatusLabel as m,
  getStockStatusColor as n,
  Route$n as o,
  Route$j as p,
  Route$i as q,
  Route$9 as r,
  supabase as s,
  truncateText as t,
  useAuth as u,
  createSsrRpc as v,
  getPunkSongs as w,
  Route$1 as x,
  Route as y,
  router as z
};
