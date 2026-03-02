"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagPill = TagPill;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
function TagPill({ label, selected = false, onClick }) {
    return ((0, jsx_runtime_1.jsx)("button", { type: "button", onClick: onClick, className: `rounded-full border px-3 py-1 text-xs font-medium transition ${selected ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500'}`, children: label }));
}
//# sourceMappingURL=TagPill.js.map