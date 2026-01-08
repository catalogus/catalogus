import { jsx } from "react/jsx-runtime";
const variantClasses = {
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-rose-100 text-rose-800",
  muted: "bg-gray-100 text-gray-700",
  info: "bg-blue-100 text-blue-800"
};
function StatusBadge({ label, variant = "muted" }) {
  return /* @__PURE__ */ jsx(
    "span",
    {
      className: `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${variantClasses[variant]}`,
      children: label
    }
  );
}
export {
  StatusBadge as S
};
