"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevenueSplitSlider = RevenueSplitSlider;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
function RevenueSplitSlider({ label, value, onChange }) {
    return ((0, jsx_runtime_1.jsxs)("label", { className: "block space-y-1", children: [(0, jsx_runtime_1.jsxs)("span", { className: "text-sm text-zinc-700", children: [label, " \u00B7 ", value, "%"] }), (0, jsx_runtime_1.jsx)("input", { type: "range", min: 0, max: 100, value: value, onChange: (e) => onChange(Number(e.target.value)), className: "w-full" })] }));
}
//# sourceMappingURL=RevenueSplitSlider.js.map