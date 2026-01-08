import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { u as useAuth, c as useCart } from "./router-BiReTygo.mjs";
import { U as User, C as ChevronDown, L as LayoutDashboard, a as LogOut, M as Menu, X, S as ShoppingCart } from "./x.mjs";
const formatCount = (count) => count > 99 ? "99+" : String(count);
function CartButton({
  showLabel = false,
  className,
  onClick
}) {
  const { count, isLoading } = useCart();
  const hasItems = count > 0;
  return /* @__PURE__ */ jsxs(
    Link,
    {
      to: "/carrinho",
      onClick,
      className: `relative inline-flex items-center gap-2 border border-transparent bg-white/0 px-3 py-2 text-sm font-semibold text-[color:var(--header-ink)] transition-all duration-200 hover:-translate-y-0.5 hover:text-[color:var(--header-accent)] ${className ?? ""}`,
      "aria-label": isLoading ? "Carrinho" : `Carrinho com ${count} ${count === 1 ? "item" : "itens"}`,
      children: [
        /* @__PURE__ */ jsx(ShoppingCart, { className: "h-5 w-5" }),
        showLabel && /* @__PURE__ */ jsx("span", { children: "Carrinho" }),
        !isLoading && hasItems && /* @__PURE__ */ jsx("span", { className: "absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[color:var(--brand)] px-1 text-[11px] font-bold text-white", children: formatCount(count) })
      ]
    }
  );
}
const navItems = [
  { label: "Inicio", href: "/", spa: true },
  { label: "Autores", href: "/autores" },
  { label: "Noticias", href: "/noticias" },
  { label: "Eventos", href: "/eventos" },
  { label: "Loja", href: "/loja" },
  { label: "Sobre", href: "/sobre" }
];
function Header() {
  const { session, profile, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  useEffect(() => {
    const updateHeaderHeight = () => {
      const headerEl = document.querySelector("header");
      if (headerEl) {
        document.documentElement.style.setProperty(
          "--header-height",
          `${headerEl.offsetHeight}px`
        );
      }
    };
    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight);
    return () => window.removeEventListener("resize", updateHeaderHeight);
  }, []);
  useEffect(() => {
    const headerEl = document.querySelector("header");
    if (headerEl) {
      document.documentElement.style.setProperty(
        "--header-height",
        `${headerEl.offsetHeight}px`
      );
    }
  }, [isScrolled]);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    if (!menuOpen) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);
  useEffect(() => {
    if (!userMenuOpen) return;
    const handleScroll = () => setUserMenuOpen(false);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [userMenuOpen]);
  return /* @__PURE__ */ jsxs(
    "header",
    {
      className: `sticky top-0 z-50 w-full transition-all duration-300 `,
      style: {
        background: isScrolled ? "var(--header-bg-scrolled)" : "var(--header-bg)",
        borderColor: isScrolled ? "var(--header-border)" : "transparent"
      },
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 py-3 md:px-15 lg:py-6", children: [
          /* @__PURE__ */ jsx(Link, { to: "/", className: "group flex items-center gap-3", children: /* @__PURE__ */ jsx(
            "img",
            {
              src: "/logo.svg",
              alt: "Catalogus",
              className: "h-4 w-auto sm:h-4"
            }
          ) }),
          /* @__PURE__ */ jsx("nav", { className: "hidden items-center gap-6 lg:flex", children: navItems.map((item) => {
            const className = "relative text-xl font-medium text-[color:var(--header-ink)] transition-colors duration-200 after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-[color:var(--header-accent)] after:transition-transform after:duration-300 after:content-[''] hover:text-[color:var(--header-accent)] hover:after:scale-x-100";
            if (item.spa) {
              return /* @__PURE__ */ jsx(Link, { to: "/", className, children: item.label }, item.label);
            }
            return /* @__PURE__ */ jsx("a", { href: item.href, className, children: item.label }, item.label);
          }) }),
          /* @__PURE__ */ jsxs("div", { className: "hidden items-center gap-3 lg:flex", children: [
            /* @__PURE__ */ jsx(CartButton, { className: "bg-white/0" }),
            session && profile ? /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => setUserMenuOpen(!userMenuOpen),
                  className: "flex items-center gap-2 bg-[color:var(--header-ink)] px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[color:var(--header-accent)]",
                  children: [
                    profile.photo_url ? /* @__PURE__ */ jsx(
                      "img",
                      {
                        src: profile.photo_url,
                        alt: profile.name ?? "User",
                        className: "h-6 w-6 object-cover"
                      }
                    ) : /* @__PURE__ */ jsx(User, { className: "h-4 w-4" }),
                    /* @__PURE__ */ jsx("span", { children: profile.name ?? session.user.email }),
                    /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" })
                  ]
                }
              ),
              userMenuOpen && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "fixed inset-0 z-40",
                    onClick: () => setUserMenuOpen(false)
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 shadow-lg z-50", children: [
                  (profile.role === "admin" || profile.role === "author") && /* @__PURE__ */ jsxs(
                    Link,
                    {
                      to: "/admin/dashboard",
                      className: "flex items-center gap-2 px-4 py-3 text-sm text-gray-900 hover:bg-gray-100 transition-colors",
                      onClick: () => setUserMenuOpen(false),
                      children: [
                        /* @__PURE__ */ jsx(LayoutDashboard, { className: "h-4 w-4" }),
                        "Painel Admin"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: async () => {
                        setUserMenuOpen(false);
                        await signOut();
                      },
                      className: "flex w-full items-center gap-2 px-4 py-3 text-sm text-gray-900 hover:bg-gray-100 transition-colors",
                      children: [
                        /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" }),
                        "Sair"
                      ]
                    }
                  )
                ] })
              ] })
            ] }) : /* @__PURE__ */ jsx(
              Link,
              {
                to: "/auth/sign-in",
                className: "bg-[color:var(--header-ink)] px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[color:var(--header-accent)]",
                children: "Entrar"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 lg:hidden", children: [
            /* @__PURE__ */ jsx(CartButton, { className: "h-10 w-10 justify-center px-0" }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setMenuOpen(true),
                className: "flex h-10 w-10 items-center justify-center text-[color:var(--header-ink)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--header-accent)]",
                "aria-label": "Abrir menu",
                "aria-expanded": menuOpen,
                "aria-controls": "mobile-menu",
                children: /* @__PURE__ */ jsx(Menu, { className: "h-5 w-5" })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: `fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${menuOpen ? "opacity-100" : "pointer-events-none opacity-0"}`,
            onClick: () => setMenuOpen(false)
          }
        ),
        /* @__PURE__ */ jsxs(
          "aside",
          {
            id: "mobile-menu",
            className: `fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col gap-6 px-6 pb-10 pt-6 text-white transition-transform duration-300 ${menuOpen ? "translate-x-0" : "translate-x-full"}`,
            style: { background: "var(--header-panel)" },
            "aria-hidden": !menuOpen,
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxs(
                  Link,
                  {
                    to: "/",
                    className: "flex items-center gap-3",
                    onClick: () => setMenuOpen(false),
                    children: [
                      /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center border border-white/20 bg-white/10", children: "C" }),
                      /* @__PURE__ */ jsxs("div", { className: "leading-tight", children: [
                        /* @__PURE__ */ jsx("p", { className: "text-base font-semibold", children: "Catalogus" }),
                        /* @__PURE__ */ jsx("p", { className: "text-[11px] uppercase tracking-[0.2em] text-[color:var(--header-panel-muted)]", children: "Livraria & cultura" })
                      ] })
                    ]
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => setMenuOpen(false),
                    className: "flex h-10 w-10 items-center justify-center border border-white/20 text-white",
                    "aria-label": "Fechar menu",
                    children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-4 pt-4 text-lg", children: navItems.map((item, index) => {
                const baseClass = "flex items-center justify-between border-b border-white/10 pb-3 text-white font-semibold transition-all duration-300 hover:translate-x-1 hover:text-[color:var(--header-accent)]";
                const style = { transitionDelay: `${index * 40}ms` };
                if (item.spa) {
                  return /* @__PURE__ */ jsx(
                    Link,
                    {
                      to: "/",
                      className: baseClass,
                      style,
                      onClick: () => setMenuOpen(false),
                      children: item.label
                    },
                    item.label
                  );
                }
                return /* @__PURE__ */ jsx(
                  "a",
                  {
                    href: item.href,
                    className: baseClass,
                    style,
                    onClick: () => setMenuOpen(false),
                    children: item.label
                  },
                  item.label
                );
              }) }),
              /* @__PURE__ */ jsx("div", { className: "mt-auto space-y-3", children: session && profile ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("div", { className: "border-t border-white/10 pt-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-4 py-2", children: [
                  profile.photo_url ? /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: profile.photo_url,
                      alt: profile.name ?? "User",
                      className: "h-10 w-10 object-cover border-2 border-white/20"
                    }
                  ) : /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center bg-white/10 border-2 border-white/20", children: /* @__PURE__ */ jsx(User, { className: "h-5 w-5" }) }),
                  /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                    /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-white", children: profile.name ?? "Usuário" }),
                    /* @__PURE__ */ jsx("p", { className: "text-xs text-white/60", children: session.user.email })
                  ] })
                ] }) }),
                (profile.role === "admin" || profile.role === "author") && /* @__PURE__ */ jsxs(
                  Link,
                  {
                    to: "/admin/dashboard",
                    className: "flex items-center gap-2 bg-white/10 px-4 py-3 text-sm font-semibold text-white border border-white/20 hover:bg-white/20 transition-colors",
                    onClick: () => setMenuOpen(false),
                    children: [
                      /* @__PURE__ */ jsx(LayoutDashboard, { className: "h-4 w-4" }),
                      "Painel Admin"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: async () => {
                      setMenuOpen(false);
                      await signOut();
                    },
                    className: "flex w-full items-center gap-2 bg-white px-4 py-3 text-sm font-semibold text-[color:var(--header-ink)] hover:bg-gray-100 transition-colors",
                    children: [
                      /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" }),
                      "Sair"
                    ]
                  }
                )
              ] }) : /* @__PURE__ */ jsx(
                Link,
                {
                  to: "/auth/sign-in",
                  className: "flex items-center justify-between bg-white px-4 py-3 text-sm font-semibold text-[color:var(--header-ink)]",
                  onClick: () => setMenuOpen(false),
                  children: "Entrar"
                }
              ) })
            ]
          }
        )
      ]
    }
  );
}
export {
  Header as H
};
