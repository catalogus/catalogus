import { jsxs, jsx } from "react/jsx-runtime";
import { c as createLucideIcon } from "./x.mjs";
const __iconNode$1 = [["path", { d: "M5 12h14", key: "1ays0h" }]];
const Minus = createLucideIcon("minus", __iconNode$1);
const __iconNode = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }]
];
const Plus = createLucideIcon("plus", __iconNode);
const clamp = (value, min, max) => Math.max(min, Math.min(value, max));
function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 10,
  disabled = false,
  className
}) {
  const handleDecrease = () => {
    if (disabled) return;
    onChange(clamp(value - 1, min, max));
  };
  const handleIncrease = () => {
    if (disabled) return;
    onChange(clamp(value + 1, min, max));
  };
  const handleInputChange = (event) => {
    if (disabled) return;
    const rawValue = Number(event.target.value);
    if (Number.isNaN(rawValue)) return;
    onChange(clamp(rawValue, min, max));
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `inline-flex items-center border border-gray-200 bg-white ${className ?? ""}`,
      children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: handleDecrease,
            disabled: disabled || value <= min,
            className: "flex h-10 w-10 items-center justify-center text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300",
            "aria-label": "Diminuir quantidade",
            children: /* @__PURE__ */ jsx(Minus, { className: "h-4 w-4" })
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            inputMode: "numeric",
            min,
            max,
            value,
            onChange: handleInputChange,
            disabled,
            className: "h-10 w-12 border-l border-r border-gray-200 text-center text-sm font-semibold text-gray-900 focus:outline-none",
            "aria-label": "Quantidade"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: handleIncrease,
            disabled: disabled || value >= max,
            className: "flex h-10 w-10 items-center justify-center text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300",
            "aria-label": "Aumentar quantidade",
            children: /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" })
          }
        )
      ]
    }
  );
}
export {
  QuantitySelector as Q
};
