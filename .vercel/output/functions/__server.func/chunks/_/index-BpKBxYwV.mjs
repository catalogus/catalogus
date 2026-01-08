import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { H as Header } from "./Header-B0XvW395.mjs";
import { u as useAuth, c as useCart, f as formatPrice, s as supabase, i as isValidEmail, d as isValidMozambiquePhone } from "./router-BiReTygo.mjs";
import "./x.mjs";
import "@tanstack/react-query";
import "@supabase/supabase-js";
import "./server.mjs";
import "node:async_hooks";
import "@tanstack/react-router/ssr/server";
function CheckoutPage() {
  const navigate = useNavigate();
  const {
    session,
    profile
  } = useAuth();
  const {
    items,
    total,
    clearCart
  } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [errors, setErrors] = useState({});
  useEffect(() => {
    setFormState((prev) => ({
      name: prev.name || profile?.name || "",
      email: prev.email || profile?.email || session?.user?.email || "",
      phone: prev.phone || profile?.phone || ""
    }));
  }, [profile, session]);
  const isCartEmpty = items.length === 0;
  const orderItems = useMemo(() => items.map((item) => ({
    book_id: item.id,
    quantity: item.quantity,
    price: item.price
  })), [items]);
  const validateForm = () => {
    const nextErrors = {};
    if (!formState.name.trim()) {
      nextErrors.name = "Nome obrigatorio";
    }
    if (!formState.email.trim() || !isValidEmail(formState.email)) {
      nextErrors.email = "Email invalido";
    }
    if (!formState.phone.trim() || !isValidMozambiquePhone(formState.phone)) {
      nextErrors.phone = "Telefone invalido";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (isCartEmpty) {
      toast.error("O carrinho esta vazio");
      return;
    }
    if (!validateForm()) return;
    try {
      setIsSubmitting(true);
      const {
        data: order,
        error: orderError
      } = await supabase.from("orders").insert({
        customer_id: session?.user?.id ?? null,
        customer_name: formState.name.trim(),
        customer_email: formState.email.trim().toLowerCase(),
        customer_phone: formState.phone.trim(),
        total,
        status: "pending"
      }).select().single();
      if (orderError) throw orderError;
      const {
        error: itemsError
      } = await supabase.from("order_items").insert(orderItems.map((item) => ({
        ...item,
        order_id: order.id
      })));
      if (itemsError) throw itemsError;
      for (const item of orderItems) {
        const {
          error: stockError
        } = await supabase.rpc("decrement_book_stock", {
          book_id: item.book_id,
          quantity: item.quantity
        });
        if (stockError) throw stockError;
      }
      clearCart();
      toast.success("Pedido criado com sucesso");
      navigate({
        to: `/pedido/${order.id}`
      });
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Falha ao criar o pedido. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#f8f4ef] text-gray-900", children: [
    /* @__PURE__ */ jsx(Header, {}),
    /* @__PURE__ */ jsxs("main", { className: "container mx-auto px-4 py-16 lg:px-15", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-semibold md:text-5xl", children: "Checkout" }),
      isCartEmpty ? /* @__PURE__ */ jsxs("div", { className: "mt-8 border border-gray-200 bg-white p-8 text-center", children: [
        /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold text-gray-900", children: "O seu carrinho esta vazio" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600", children: "Adicione livros antes de finalizar a compra." }),
        /* @__PURE__ */ jsx(Link, { to: "/loja", className: "mt-6 inline-flex items-center justify-center bg-[color:var(--brand)] px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-white hover:bg-[#a25a2c]", children: "Ir para a loja" })
      ] }) : /* @__PURE__ */ jsxs("div", { className: "mt-8 grid gap-8 lg:grid-cols-[1fr_360px]", children: [
        /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-6 border border-gray-200 bg-white p-6", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Dados do cliente" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-600", children: "Preencha os dados para concluir o pedido." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("label", { className: "block text-sm font-medium text-gray-700", children: [
              "Nome completo",
              /* @__PURE__ */ jsx("input", { type: "text", value: formState.name, onChange: (event) => setFormState((prev) => ({
                ...prev,
                name: event.target.value
              })), className: "mt-2 w-full border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[color:var(--brand)] focus:outline-none" }),
              errors.name && /* @__PURE__ */ jsx("span", { className: "mt-1 block text-xs text-red-600", children: errors.name })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "block text-sm font-medium text-gray-700", children: [
              "Email",
              /* @__PURE__ */ jsx("input", { type: "email", value: formState.email, onChange: (event) => setFormState((prev) => ({
                ...prev,
                email: event.target.value
              })), className: "mt-2 w-full border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[color:var(--brand)] focus:outline-none" }),
              errors.email && /* @__PURE__ */ jsx("span", { className: "mt-1 block text-xs text-red-600", children: errors.email })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "block text-sm font-medium text-gray-700", children: [
              "Telefone",
              /* @__PURE__ */ jsx("input", { type: "tel", value: formState.phone, onChange: (event) => setFormState((prev) => ({
                ...prev,
                phone: event.target.value
              })), className: "mt-2 w-full border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[color:var(--brand)] focus:outline-none" }),
              errors.phone && /* @__PURE__ */ jsx("span", { className: "mt-1 block text-xs text-red-600", children: errors.phone })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "border-t border-gray-200 pt-4", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold uppercase tracking-wider text-gray-500", children: "Metodo de pagamento" }),
            /* @__PURE__ */ jsx("div", { className: "mt-3 space-y-2 text-sm text-gray-700", children: /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("input", { type: "radio", checked: true, readOnly: true }),
              /* @__PURE__ */ jsx("span", { children: "M-Pesa" })
            ] }) })
          ] }),
          /* @__PURE__ */ jsx("button", { type: "submit", disabled: isSubmitting, className: "w-full bg-[color:var(--brand)] px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#a25a2c] disabled:cursor-not-allowed disabled:bg-gray-300", children: isSubmitting ? "Processando..." : "Confirmar pedido" })
        ] }),
        /* @__PURE__ */ jsxs("aside", { className: "h-fit border border-gray-200 bg-white p-6", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Resumo do pedido" }),
          /* @__PURE__ */ jsx("div", { className: "mt-4 space-y-4", children: items.map((item) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "h-16 w-12 flex-shrink-0 bg-gray-100", children: item.cover_url ? /* @__PURE__ */ jsx("img", { src: item.cover_url, alt: item.title, className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsx("div", { className: "flex h-full w-full items-center justify-center text-xs font-semibold text-gray-300", children: item.title.charAt(0).toUpperCase() }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-gray-900", children: item.title }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-600", children: [
                item.quantity,
                " x ",
                formatPrice(item.price)
              ] })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-gray-900", children: formatPrice(item.price * item.quantity) })
          ] }, item.id)) }),
          /* @__PURE__ */ jsx("div", { className: "mt-6 border-t border-gray-200 pt-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm text-gray-600", children: [
            /* @__PURE__ */ jsx("span", { children: "Total" }),
            /* @__PURE__ */ jsx("span", { className: "text-lg font-semibold text-gray-900", children: formatPrice(total) })
          ] }) })
        ] })
      ] })
    ] })
  ] });
}
export {
  CheckoutPage as component
};
