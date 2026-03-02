"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedCard = FeedCard;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const LikeButton_1 = require("../common/LikeButton");
const SaveButton_1 = require("../common/SaveButton");
const TagPill_1 = require("../common/TagPill");
function FeedCard({ item }) {
    return ((0, jsx_runtime_1.jsxs)("article", { className: "group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-lg", children: [(0, jsx_runtime_1.jsx)("img", { src: item.coverUrl, alt: item.title, className: "h-56 w-full object-cover transition duration-500 group-hover:scale-105" }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-3 p-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 text-xs", children: [item.hasCollab && (0, jsx_runtime_1.jsx)("span", { className: "rounded bg-sky-100 px-2 py-0.5 text-sky-700", children: "Collab" }), item.isVerified && (0, jsx_runtime_1.jsx)("span", { className: "rounded bg-emerald-100 px-2 py-0.5 text-emerald-700", children: "Verified" })] }), (0, jsx_runtime_1.jsx)("h3", { className: "text-base font-semibold text-zinc-900", children: item.title }), (0, jsx_runtime_1.jsxs)("p", { className: "text-xs text-zinc-500", children: [item.seller.displayName, " \u00B7 ", item.currency, " ", item.price] }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2", children: item.tags.map((tag) => (0, jsx_runtime_1.jsx)(TagPill_1.TagPill, { label: tag }, tag)) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(LikeButton_1.LikeButton, { count: item.likes }), (0, jsx_runtime_1.jsx)(SaveButton_1.SaveButton, { count: item.saves })] })] })] }));
}
//# sourceMappingURL=FeedCard.js.map