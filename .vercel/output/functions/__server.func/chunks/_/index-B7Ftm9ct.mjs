import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { H as Header } from "./Header-B0XvW395.mjs";
import { s as supabase, b as formatPriceCompact } from "./router-BiReTygo.mjs";
import { P as ProductCard } from "./ProductCard-pvIWnZKE.mjs";
import { c as createLucideIcon, X } from "./x.mjs";
import { S as Search } from "./search.mjs";
import "@tanstack/react-router";
import "sonner";
import "@supabase/supabase-js";
import "./server.mjs";
import "node:async_hooks";
import "@tanstack/react-router/ssr/server";
import "./link-2.mjs";
const __iconNode = [
  ["path", { d: "M10 5H3", key: "1qgfaw" }],
  ["path", { d: "M12 19H3", key: "yhmn1j" }],
  ["path", { d: "M14 3v4", key: "1sua03" }],
  ["path", { d: "M16 17v4", key: "1q0r14" }],
  ["path", { d: "M21 12h-9", key: "1o4lsq" }],
  ["path", { d: "M21 19h-5", key: "1rlt1p" }],
  ["path", { d: "M21 5h-7", key: "1oszz2" }],
  ["path", { d: "M8 10v4", key: "tgpxqk" }],
  ["path", { d: "M8 12H3", key: "a7s4jb" }]
];
const SlidersHorizontal = createLucideIcon("sliders-horizontal", __iconNode);
const clamp = (value, min, max) => Math.max(min, Math.min(value, max));
function FilterSidebar({
  search,
  onSearchChange,
  categories,
  selectedCategories,
  onSelectedCategoriesChange,
  language,
  onLanguageChange,
  priceRange,
  selectedPrice,
  onPriceChange,
  onClearFilters,
  isLoading = false,
  className,
  idPrefix = "shop"
}) {
  const handleCategoryToggle = (category) => {
    const isSelected = selectedCategories.includes(category);
    const next = isSelected ? selectedCategories.filter((item) => item !== category) : [...selectedCategories, category];
    onSelectedCategoriesChange(next);
  };
  const handleMinPriceChange = (value) => {
    const nextMin = clamp(value, priceRange.min, selectedPrice.max);
    onPriceChange({ min: nextMin, max: selectedPrice.max });
  };
  const handleMaxPriceChange = (value) => {
    const nextMax = clamp(value, selectedPrice.min, priceRange.max);
    onPriceChange({ min: selectedPrice.min, max: nextMax });
  };
  const minLabel = formatPriceCompact(priceRange.min);
  const maxLabel = formatPriceCompact(priceRange.max);
  const searchId = `${idPrefix}-search`;
  return /* @__PURE__ */ jsxs(
    "aside",
    {
      className: `space-y-6 border border-gray-200 bg-white p-6 ${className ?? ""}`,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Filtros" }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: onClearFilters,
              className: "inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-500 transition-colors hover:text-gray-900",
              disabled: isLoading,
              children: [
                /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" }),
                "Limpar"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-gray-700", htmlFor: searchId, children: "Pesquisa" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                id: searchId,
                type: "search",
                value: search,
                onChange: (event) => onSearchChange(event.target.value),
                placeholder: "Buscar por titulo",
                className: "w-full border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 focus:border-[color:var(--brand)] focus:outline-none",
                disabled: isLoading
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold uppercase tracking-wider text-gray-500", children: "Categorias" }),
          categories.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Nenhuma categoria encontrada." }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: categories.map((category) => /* @__PURE__ */ jsxs(
            "label",
            {
              className: "flex items-center gap-2 text-sm text-gray-700",
              children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "checkbox",
                    checked: selectedCategories.includes(category),
                    onChange: () => handleCategoryToggle(category),
                    className: "h-4 w-4 border-gray-300 text-[color:var(--brand)] focus:ring-[color:var(--brand)]",
                    disabled: isLoading
                  }
                ),
                /* @__PURE__ */ jsx("span", { children: category })
              ]
            },
            category
          )) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold uppercase tracking-wider text-gray-500", children: "Idioma" }),
          /* @__PURE__ */ jsx("div", { className: "space-y-2 text-sm text-gray-700", children: [
            { label: "Todos", value: null },
            { label: "Portugues", value: "pt" },
            { label: "Ingles", value: "en" }
          ].map((option) => /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "radio",
                name: "language",
                checked: language === option.value,
                onChange: () => onLanguageChange(option.value),
                className: "h-4 w-4 border-gray-300 text-[color:var(--brand)] focus:ring-[color:var(--brand)]",
                disabled: isLoading
              }
            ),
            /* @__PURE__ */ jsx("span", { children: option.label })
          ] }, option.label)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold uppercase tracking-wider text-gray-500", children: "Preco" }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500", children: [
            minLabel,
            " MZN - ",
            maxLabel,
            " MZN"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-3 text-sm text-gray-700 md:grid-cols-2", children: [
            /* @__PURE__ */ jsxs("label", { className: "flex flex-col gap-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-wider text-gray-500", children: "Minimo" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  min: priceRange.min,
                  max: selectedPrice.max,
                  value: selectedPrice.min,
                  onChange: (event) => handleMinPriceChange(Number(event.target.value)),
                  className: "w-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[color:var(--brand)] focus:outline-none",
                  disabled: isLoading
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "flex flex-col gap-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-wider text-gray-500", children: "Maximo" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  min: selectedPrice.min,
                  max: priceRange.max,
                  value: selectedPrice.max,
                  onChange: (event) => handleMaxPriceChange(Number(event.target.value)),
                  className: "w-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[color:var(--brand)] focus:outline-none",
                  disabled: isLoading
                }
              )
            ] })
          ] })
        ] })
      ]
    }
  );
}
const DEFAULT_PRICE_RANGE = {
  min: 0,
  max: 1e4
};
function ShopListingPage() {
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [language, setLanguage] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState({
    min: 0,
    max: 0
  });
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const priceRangeRef = useRef(DEFAULT_PRICE_RANGE);
  const categoriesQuery = useQuery({
    queryKey: ["shop-categories"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("books").select("category").eq("is_active", true).not("category", "is", null);
      if (error) throw error;
      const categories2 = Array.from(new Set(data?.map((b) => b.category).filter(Boolean))).sort();
      return categories2;
    },
    staleTime: 3e5
  });
  const priceRangeQuery = useQuery({
    queryKey: ["shop-price-range"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("books").select("price_mzn").eq("is_active", true).not("price_mzn", "is", null).order("price_mzn", {
        ascending: false
      }).limit(1);
      if (error) throw error;
      const maxPrice = data?.[0]?.price_mzn ?? DEFAULT_PRICE_RANGE.max;
      return {
        min: 0,
        max: Math.ceil(maxPrice / 100) * 100
      };
    },
    staleTime: 3e5
  });
  const priceRange = priceRangeQuery.data ?? DEFAULT_PRICE_RANGE;
  useEffect(() => {
    const prevRange = priceRangeRef.current;
    if (selectedPrice.max === 0) {
      setSelectedPrice(priceRange);
    } else if (selectedPrice.min === prevRange.min && selectedPrice.max === prevRange.max) {
      setSelectedPrice(priceRange);
    }
    priceRangeRef.current = priceRange;
  }, [priceRange, selectedPrice.max, selectedPrice.min]);
  const booksQuery = useInfiniteQuery({
    queryKey: ["books", "shop", {
      search,
      selectedCategories,
      language,
      selectedPrice,
      sortBy
    }],
    queryFn: async ({
      pageParam = 1
    }) => {
      let query = supabase.from("books").select(`
          id,
          title,
          slug,
          price_mzn,
          stock,
          description,
          seo_description,
          cover_url,
          cover_path,
          category,
          language,
          authors:authors_books(author:authors(id, name, wp_slug))
        `).eq("is_active", true);
      const trimmedSearch = search.trim();
      if (trimmedSearch) {
        query = query.or(`title.ilike.%${trimmedSearch}%,description.ilike.%${trimmedSearch}%`);
      }
      if (selectedCategories.length > 0) {
        query = query.in("category", selectedCategories);
      }
      if (language) {
        query = query.eq("language", language);
      }
      if (selectedPrice.min > priceRange.min) {
        query = query.gte("price_mzn", selectedPrice.min);
      }
      if (selectedPrice.max < priceRange.max) {
        query = query.lte("price_mzn", selectedPrice.max);
      }
      switch (sortBy) {
        case "newest":
          query = query.order("created_at", {
            ascending: false
          });
          break;
        case "oldest":
          query = query.order("created_at", {
            ascending: true
          });
          break;
        case "price-asc":
          query = query.order("price_mzn", {
            ascending: true,
            nullsFirst: false
          });
          break;
        case "price-desc":
          query = query.order("price_mzn", {
            ascending: false,
            nullsFirst: false
          });
          break;
        case "title":
          query = query.order("title", {
            ascending: true
          });
          break;
      }
      const from = (pageParam - 1) * 12;
      const to = from + 11;
      const {
        data,
        error
      } = await query.range(from, to);
      if (error) throw error;
      const books = data?.map((entry) => ({
        ...entry,
        authors: entry.authors?.map((a) => ({
          author: a.author
        })) ?? []
      })) ?? [];
      return {
        books,
        hasMore: books.length === 12
      };
    },
    getNextPageParam: (lastPage, allPages) => lastPage.hasMore ? allPages.length + 1 : void 0,
    initialPageParam: 1,
    staleTime: 6e4
  });
  const allBooks = booksQuery.data?.pages.flatMap((page) => page.books) ?? [];
  const categories = categoriesQuery.data ?? [];
  const handleClearFilters = () => {
    setSearch("");
    setSelectedCategories([]);
    setLanguage(null);
    setSelectedPrice(priceRange);
    setSortBy("newest");
  };
  const activeFiltersCount = (search ? 1 : 0) + (selectedCategories.length > 0 ? 1 : 0) + (language ? 1 : 0) + (selectedPrice.min > priceRange.min || selectedPrice.max < priceRange.max ? 1 : 0);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-white text-gray-900", children: [
    /* @__PURE__ */ jsx(Header, {}),
    /* @__PURE__ */ jsx("section", { className: "bg-[#1c1b1a] text-white", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 py-16 lg:px-15", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-4xl font-semibold md:text-6xl", children: "Loja" }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 text-lg text-white/80", children: "Descubra a nossa colecao de livros" })
    ] }) }),
    /* @__PURE__ */ jsx("main", { className: "py-12", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 lg:px-15", children: /* @__PURE__ */ jsxs("div", { className: "lg:grid lg:grid-cols-[280px_1fr] lg:gap-12", children: [
      /* @__PURE__ */ jsx("aside", { className: "hidden lg:block", children: /* @__PURE__ */ jsx("div", { className: "sticky top-4", children: /* @__PURE__ */ jsx(FilterSidebar, { idPrefix: "shop-desktop", search, onSearchChange: setSearch, categories, selectedCategories, onSelectedCategoriesChange: setSelectedCategories, language, onLanguageChange: setLanguage, priceRange, selectedPrice, onPriceChange: setSelectedPrice, onClearFilters: handleClearFilters, isLoading: categoriesQuery.isLoading || priceRangeQuery.isLoading }) }) }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6 lg:hidden", children: [
        /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setShowFilters(!showFilters), className: "flex w-full items-center justify-center gap-2 border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium", children: [
          /* @__PURE__ */ jsx(SlidersHorizontal, { className: "h-4 w-4" }),
          "Filtros",
          activeFiltersCount > 0 && /* @__PURE__ */ jsx("span", { className: "ml-1 rounded-full bg-[color:var(--brand)] px-2 py-0.5 text-xs text-white", children: activeFiltersCount })
        ] }),
        showFilters && /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-4", children: [
          /* @__PURE__ */ jsx(FilterSidebar, { idPrefix: "shop-mobile", search, onSearchChange: setSearch, categories, selectedCategories, onSelectedCategoriesChange: setSelectedCategories, language, onLanguageChange: setLanguage, priceRange, selectedPrice, onPriceChange: setSelectedPrice, onClearFilters: handleClearFilters, isLoading: categoriesQuery.isLoading || priceRangeQuery.isLoading }),
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setShowFilters(false), className: "w-full bg-[color:var(--brand)] px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-white hover:bg-[#a25a2c]", children: "Fechar filtros" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-6 flex flex-wrap items-center justify-between gap-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: booksQuery.isSuccess && /* @__PURE__ */ jsx(Fragment, { children: allBooks.length > 0 ? `${allBooks.length} ${allBooks.length === 1 ? "livro encontrado" : "livros encontrados"}` : "Nenhum livro encontrado" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "sort", className: "text-sm text-gray-600", children: "Ordenar:" }),
            /* @__PURE__ */ jsxs("select", { id: "sort", value: sortBy, onChange: (e) => setSortBy(e.target.value), className: "border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-[color:var(--brand)] focus:outline-none", children: [
              /* @__PURE__ */ jsx("option", { value: "newest", children: "Mais recentes" }),
              /* @__PURE__ */ jsx("option", { value: "oldest", children: "Mais antigos" }),
              /* @__PURE__ */ jsx("option", { value: "price-asc", children: "Preco: Baixo para Alto" }),
              /* @__PURE__ */ jsx("option", { value: "price-desc", children: "Preco: Alto para Baixo" }),
              /* @__PURE__ */ jsx("option", { value: "title", children: "Titulo (A-Z)" })
            ] })
          ] })
        ] }),
        booksQuery.isLoading && /* @__PURE__ */ jsx("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", children: Array.from({
          length: 12
        }).map((_, index) => /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsx("div", { className: "aspect-[3/4] w-full animate-pulse bg-gray-200" }),
          /* @__PURE__ */ jsx("div", { className: "h-5 w-3/4 animate-pulse bg-gray-200" }),
          /* @__PURE__ */ jsx("div", { className: "h-4 w-1/2 animate-pulse bg-gray-200" }),
          /* @__PURE__ */ jsx("div", { className: "h-6 w-1/3 animate-pulse bg-gray-200" })
        ] }, `skeleton-${index}`)) }),
        booksQuery.isError && /* @__PURE__ */ jsx("div", { className: "border border-gray-200 bg-white p-8 text-center", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: "Falha ao carregar os livros. Tente novamente." }) }),
        !booksQuery.isLoading && !booksQuery.isError && allBooks.length === 0 && /* @__PURE__ */ jsxs("div", { className: "border border-gray-200 bg-white p-8 text-center", children: [
          /* @__PURE__ */ jsx("p", { className: "mb-4 text-lg font-semibold text-gray-900", children: "Nenhum livro encontrado" }),
          /* @__PURE__ */ jsx("p", { className: "mb-6 text-sm text-gray-600", children: "Tente ajustar os filtros ou pesquisar por outro termo" }),
          activeFiltersCount > 0 && /* @__PURE__ */ jsx("button", { type: "button", onClick: handleClearFilters, className: "bg-[color:var(--brand)] px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-white hover:bg-[#a25a2c]", children: "Limpar filtros" })
        ] }),
        !booksQuery.isLoading && !booksQuery.isError && allBooks.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", children: allBooks.map((book) => /* @__PURE__ */ jsx(ProductCard, { book }, book.id)) }),
          booksQuery.hasNextPage && /* @__PURE__ */ jsx("div", { className: "mt-12 flex justify-center", children: /* @__PURE__ */ jsx("button", { type: "button", onClick: () => booksQuery.fetchNextPage(), disabled: booksQuery.isFetchingNextPage, className: "bg-[color:var(--brand)] px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#a25a2c] disabled:cursor-not-allowed disabled:opacity-50", children: booksQuery.isFetchingNextPage ? "Carregando..." : "Carregar mais" }) }),
          booksQuery.isFetchingNextPage && /* @__PURE__ */ jsx("div", { className: "mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", children: Array.from({
            length: 12
          }).map((_, index) => /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsx("div", { className: "aspect-[3/4] w-full animate-pulse bg-gray-200" }),
            /* @__PURE__ */ jsx("div", { className: "h-5 w-3/4 animate-pulse bg-gray-200" }),
            /* @__PURE__ */ jsx("div", { className: "h-4 w-1/2 animate-pulse bg-gray-200" })
          ] }, `loading-more-${index}`)) })
        ] })
      ] })
    ] }) }) })
  ] });
}
export {
  ShopListingPage as component
};
