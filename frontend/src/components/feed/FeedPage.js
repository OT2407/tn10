"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedPage = FeedPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const TagPill_1 = require("../common/TagPill");
const FeedCard_1 = require("./FeedCard");
const PAGE_SIZE = 8;
function FeedPage({ items, tags }) {
    const [selectedTag, setSelectedTag] = (0, react_1.useState)(null);
    const [visibleCount, setVisibleCount] = (0, react_1.useState)(PAGE_SIZE);
    const filtered = (0, react_1.useMemo)(() => (selectedTag === null ? items : items.filter((item) => item.tags.includes(selectedTag))), [items, selectedTag]);
    const visible = filtered.slice(0, visibleCount);
    const canLoadMore = visibleCount < filtered.length;
    return ((0, jsx_runtime_1.jsxs)("section", { className: "mx-auto max-w-6xl space-y-6 px-4 py-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-wrap gap-2", children: [(0, jsx_runtime_1.jsx)(TagPill_1.TagPill, { label: "All", selected: selectedTag === null, onClick: () => setSelectedTag(null) }), tags.map((tag) => ((0, jsx_runtime_1.jsx)(TagPill_1.TagPill, { label: tag, selected: selectedTag === tag, onClick: () => setSelectedTag(tag) }, tag)))] }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3", children: visible.map((item) => ((0, jsx_runtime_1.jsx)(FeedCard_1.FeedCard, { item: item }, item.id))) }), canLoadMore && ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center", children: (0, jsx_runtime_1.jsx)("button", { type: "button", className: "rounded-full bg-zinc-900 px-5 py-2 text-sm text-white", onClick: () => setVisibleCount((v) => Math.min(v + PAGE_SIZE, filtered.length)), children: "Load More" }) }))] }));
}
//# sourceMappingURL=FeedPage.js.map