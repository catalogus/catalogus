import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useRouterState, Link } from "@tanstack/react-router";
import { I as Input, B as Button } from "./button-BUSE9ux3.mjs";
import { u as useAuth } from "./router-BiReTygo.mjs";
import { c as createLucideIcon, X, M as Menu, S as ShoppingCart, L as LayoutDashboard, C as ChevronDown, U as User, a as LogOut } from "./x.mjs";
import { S as Search } from "./search.mjs";
const __iconNode$5 = [
  ["path", { d: "M12 7v14", key: "1akyts" }],
  [
    "path",
    {
      d: "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",
      key: "ruj8y"
    }
  ]
];
const BookOpen = createLucideIcon("book-open", __iconNode$5);
const __iconNode$4 = [
  [
    "path",
    {
      d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
      key: "1oefj6"
    }
  ],
  ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5", key: "wfsgrz" }],
  ["path", { d: "M10 9H8", key: "b1mrlr" }],
  ["path", { d: "M16 13H8", key: "t4e002" }],
  ["path", { d: "M16 17H8", key: "z1uh3a" }]
];
const FileText = createLucideIcon("file-text", __iconNode$4);
const __iconNode$3 = [
  ["path", { d: "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8", key: "5wwlr5" }],
  [
    "path",
    {
      d: "M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
      key: "r6nss1"
    }
  ]
];
const House = createLucideIcon("house", __iconNode$3);
const __iconNode$2 = [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2", key: "1m3agn" }],
  ["circle", { cx: "9", cy: "9", r: "2", key: "af1f0g" }],
  ["path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21", key: "1xmnt7" }]
];
const Image = createLucideIcon("image", __iconNode$2);
const __iconNode$1 = [
  ["rect", { width: "8", height: "18", x: "3", y: "3", rx: "1", key: "oynpb5" }],
  ["path", { d: "M7 3v18", key: "bbkbws" }],
  [
    "path",
    {
      d: "M20.4 18.9c.2.5-.1 1.1-.6 1.3l-1.9.7c-.5.2-1.1-.1-1.3-.6L11.1 5.1c-.2-.5.1-1.1.6-1.3l1.9-.7c.5-.2 1.1.1 1.3.6Z",
      key: "1qboyk"
    }
  ]
];
const LibraryBig = createLucideIcon("library-big", __iconNode$1);
const __iconNode = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["path", { d: "M16 3.128a4 4 0 0 1 0 7.744", key: "16gr8j" }],
  ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87", key: "kshegd" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }]
];
const Users = createLucideIcon("users", __iconNode);
const adminNavigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Hero Slides", href: "/admin/hero-slides", icon: Image },
  { name: "Posts", href: "/admin/posts", icon: FileText },
  { name: "Books", href: "/admin/books", icon: BookOpen },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Authors", href: "/admin/authors", icon: Users },
  {
    name: "Content",
    href: "/admin/content",
    icon: FileText,
    subItems: [
      { name: "Partners", href: "/admin/content/partners", icon: Users },
      { name: "Services", href: "/admin/content/services", icon: LibraryBig },
      { name: "Projects", href: "/admin/content/projects", icon: LayoutDashboard }
    ]
  }
];
const authorNavigation = [
  { name: "Profile", href: "/author/profile", icon: Users }
];
const customerNavigation = [
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart }
];
function Sidebar({ userRole = "admin" }) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname
  });
  const [expandedItems, setExpandedItems] = useState(/* @__PURE__ */ new Set());
  const navigation = useMemo(() => {
    if (userRole === "author") return authorNavigation;
    if (userRole === "customer") return customerNavigation;
    return adminNavigation;
  }, [userRole]);
  useEffect(() => {
    const updated = new Set(expandedItems);
    navigation.forEach((item) => {
      if (item.subItems?.length) {
        const shouldExpand = pathname.startsWith(item.href);
        if (shouldExpand) {
          updated.add(item.name);
        }
      }
    });
    setExpandedItems(updated);
  }, [pathname]);
  const toggleExpanded = (itemName) => {
    setExpandedItems((current) => {
      const next = new Set(current);
      next.has(itemName) ? next.delete(itemName) : next.add(itemName);
      return next;
    });
  };
  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full bg-[#fafafa] text-[#111827] border-r border-gray-200", children: [
    /* @__PURE__ */ jsx("div", { className: "flex items-center px-6 py-5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
      /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-2xl bg-black text-white flex items-center justify-center font-semibold", children: "C" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-base font-semibold", children: "Catalogus" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Admin" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("nav", { className: "flex-1 px-4 py-4 space-y-2 overflow-y-auto", children: navigation.map((item) => {
      const Icon = item.icon;
      const hasSubItems = item.subItems?.length;
      const expanded = expandedItems.has(item.name);
      if (hasSubItems) {
        return /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => toggleExpanded(item.name),
              className: "w-full flex items-center justify-between px-3 py-3 rounded-3xl text-sm font-medium text-[#111827] hover:bg-gray-900 hover:text-white transition-colors",
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsx(Icon, { className: "w-5 h-5" }),
                  item.name
                ] }),
                /* @__PURE__ */ jsx(
                  ChevronDown,
                  {
                    className: `w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`
                  }
                )
              ]
            }
          ),
          expanded && /* @__PURE__ */ jsx("div", { className: "ml-4 mt-2 space-y-1", children: item.subItems.map((subItem) => {
            const SubIcon = subItem.icon;
            const active2 = isActive(subItem.href);
            return /* @__PURE__ */ jsxs(
              Link,
              {
                to: subItem.href,
                className: `flex items-center px-3 py-2 rounded-2xl text-sm transition-colors ${active2 ? "bg-[#EAEAEA] text-black font-medium" : "text-[#374151] hover:bg-gray-100"}`,
                children: [
                  /* @__PURE__ */ jsx(SubIcon, { className: "w-4 h-4 mr-3" }),
                  subItem.name
                ]
              },
              subItem.name
            );
          }) })
        ] }, item.name);
      }
      const active = isActive(item.href);
      return /* @__PURE__ */ jsxs(
        Link,
        {
          to: item.href,
          className: `flex items-center px-3 py-3 rounded-3xl text-sm font-medium transition-colors ${active ? "bg-[#EAEAEA] text-black" : "text-[#111827] hover:bg-gray-900 hover:text-white"}`,
          children: [
            /* @__PURE__ */ jsx(Icon, { className: "w-5 h-5 mr-3" }),
            item.name
          ]
        },
        item.name
      );
    }) })
  ] });
}
const getInitials = (name) => name?.split(" ").map((part) => part[0]).join("").toUpperCase() || "CA";
const roleBadge = (role) => {
  switch (role) {
    case "admin":
      return { label: "Admin", classes: "bg-red-100 text-red-800" };
    case "author":
      return { label: "Author", classes: "bg-blue-100 text-blue-800" };
    case "customer":
      return { label: "Customer", classes: "bg-green-100 text-green-800" };
    default:
      return { label: "User", classes: "bg-gray-100 text-gray-800" };
  }
};
const adminLevelBadge = (level) => {
  switch (level) {
    case "full_admin":
      return { label: "Full Admin", classes: "bg-yellow-100 text-yellow-800" };
    case "staff":
      return { label: "Staff", classes: "bg-purple-100 text-purple-800" };
    case "technician":
      return { label: "Technician", classes: "bg-blue-100 text-blue-800" };
    default:
      return { label: null, classes: "" };
  }
};
function TopBar({
  userRole = "admin",
  adminLevel = "full_admin",
  userName = "Catalogus Admin",
  userEmail = "admin@catalogus.com",
  onSignOut,
  onProfileSettings
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const handleSignOut = async () => {
    await onSignOut?.();
  };
  const { label: roleLabel, classes: roleClasses } = roleBadge(userRole);
  const { label: levelLabel, classes: levelClasses } = adminLevelBadge(adminLevel);
  return /* @__PURE__ */ jsx("div", { className: "px-6 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
    /* @__PURE__ */ jsx("div", { className: "flex-1 max-w-xs", children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" }),
      /* @__PURE__ */ jsx(
        Input,
        {
          type: "text",
          placeholder: "Search...",
          value: searchQuery,
          onChange: (e) => setSearchQuery(e.target.value),
          className: "pl-10"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setShowUserMenu((open) => !open),
          className: "flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900", children: userName }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: userEmail })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "w-10 h-10 bg-black rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-white font-semibold text-sm", children: getInitials(userName) }) })
          ]
        }
      ),
      showUserMenu && /* @__PURE__ */ jsxs("div", { className: "absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50", children: [
        /* @__PURE__ */ jsxs("div", { className: "px-4 py-3 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900", children: userName }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: userEmail }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-2", children: [
            /* @__PURE__ */ jsx(
              "span",
              {
                className: `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${roleClasses}`,
                children: roleLabel
              }
            ),
            levelLabel && /* @__PURE__ */ jsx(
              "span",
              {
                className: `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${levelClasses}`,
                children: levelLabel
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "py-1", children: [
          /* @__PURE__ */ jsxs(
            Link,
            {
              to: "/",
              className: "flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50",
              onClick: () => setShowUserMenu(false),
              children: [
                /* @__PURE__ */ jsx(House, { className: "w-4 h-4 mr-3" }),
                "Homepage"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => {
                setShowUserMenu(false);
                onProfileSettings?.();
              },
              className: "flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50",
              children: [
                /* @__PURE__ */ jsx(User, { className: "w-4 h-4 mr-3" }),
                "Profile Settings"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            Button,
            {
              onClick: handleSignOut,
              variant: "ghost",
              className: "flex items-center w-full justify-start px-4 py-2 text-sm text-rose-600 hover:bg-rose-50",
              children: [
                /* @__PURE__ */ jsx(LogOut, { className: "w-4 h-4 mr-3" }),
                "Sign Out"
              ]
            }
          )
        ] })
      ] })
    ] })
  ] }) });
}
function DashboardLayout({
  children,
  userRole = "admin",
  adminLevel = "full_admin",
  userName = "Catalogus Admin",
  userEmail = "admin@catalogus.com",
  onSignOut
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#FAFAFA] flex overflow-hidden", children: [
    sidebarOpen && /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 z-40 lg:hidden",
        onClick: () => setSidebarOpen(false),
        children: /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gray-600 opacity-75" })
      }
    ),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: `
          fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `,
        children: /* @__PURE__ */ jsx(Sidebar, { userRole })
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col overflow-hidden", children: [
      /* @__PURE__ */ jsx(
        TopBar,
        {
          userRole,
          adminLevel,
          userName,
          userEmail,
          onSignOut
        }
      ),
      /* @__PURE__ */ jsx("main", { className: "flex-1 overflow-y-auto px-6 pb-8", children: /* @__PURE__ */ jsx("div", { className: "p-6 bg-white rounded-3xl shadow-[0_2px_8px_0_rgba(0,0,0,0.1)]", children }) })
    ] }),
    /* @__PURE__ */ jsx(
      "button",
      {
        className: "lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg",
        onClick: () => setSidebarOpen((open) => !open),
        children: sidebarOpen ? /* @__PURE__ */ jsx(X, { className: "w-6 h-6 text-gray-600" }) : /* @__PURE__ */ jsx(Menu, { className: "w-6 h-6 text-gray-600" })
      }
    )
  ] });
}
function AdminGuard({ children }) {
  const { session, profile, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (loading) return;
    if (!session || profile?.role !== "admin") {
      navigate({
        to: "/auth/sign-in",
        search: { redirect: "/admin/dashboard" },
        replace: true
      });
    }
  }, [session, profile?.role, loading, navigate]);
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-h-screen", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: "Loading..." })
    ] }) });
  }
  if (!session || profile?.role !== "admin") {
    return null;
  }
  return /* @__PURE__ */ jsx(Fragment, { children });
}
export {
  AdminGuard as A,
  DashboardLayout as D,
  Image as I
};
