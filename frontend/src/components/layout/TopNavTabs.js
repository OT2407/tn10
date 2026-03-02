"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopNavTabs = TopNavTabs;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const tabs = ['Explore', 'Shop', 'Collections', 'Saved'];
function TopNavTabs({ activeTab, onTabSelect }) {
    return ((0, jsx_runtime_1.jsx)("nav", { className: "sticky top-0 z-20 border-b border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur", children: (0, jsx_runtime_1.jsx)("div", { className: "mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto", children: tabs.map((tab) => ((0, jsx_runtime_1.jsx)("button", { className: `rounded-full px-4 py-2 text-sm font-medium transition ${activeTab === tab ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'}`, onClick: () => onTabSelect(tab), type: "button", children: tab }, tab))) }) }));
}
//# sourceMappingURL=TopNavTabs.js.map