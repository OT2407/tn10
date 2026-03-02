"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LikeButton = LikeButton;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
function LikeButton({ count, active = false }) {
    return (0, jsx_runtime_1.jsxs)("button", { type: "button", className: `rounded-full px-3 py-1 text-xs ${active ? 'bg-rose-100 text-rose-700' : 'bg-zinc-100 text-zinc-700'}`, children: ["\u2665 ", count] });
}
//# sourceMappingURL=LikeButton.js.map