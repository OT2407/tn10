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
exports.ContractPage = ContractPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
function ContractPage({ contract }) {
    const [tab, setTab] = (0, react_1.useState)('Overview');
    const releasedPercent = (0, react_1.useMemo)(() => contract.milestones.filter((m) => m.status === 'RELEASED').reduce((sum, m) => sum + m.percentage, 0), [contract.milestones]);
    return ((0, jsx_runtime_1.jsxs)("section", { className: "mx-auto max-w-6xl space-y-5 px-4 py-6", children: [contract.monitoringEnabled && ((0, jsx_runtime_1.jsx)("div", { className: "rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800", children: "Monitoring Mode Enabled: escrow is active and activity is tracked." })), (0, jsx_runtime_1.jsxs)("header", { className: "flex flex-wrap items-center justify-between gap-3", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-bold", children: contract.title }), (0, jsx_runtime_1.jsxs)("span", { className: "rounded bg-zinc-100 px-3 py-1 text-sm", children: ["Freeze: ", contract.freezeState] })] }), (0, jsx_runtime_1.jsx)("div", { className: "h-3 overflow-hidden rounded-full bg-zinc-200", children: (0, jsx_runtime_1.jsx)("div", { className: "h-full bg-zinc-900 transition-all", style: { width: `${releasedPercent}%` } }) }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2", children: ['Overview', 'Milestones', 'Chat', 'Files', 'Activity Log'].map((t) => ((0, jsx_runtime_1.jsx)("button", { type: "button", className: `rounded-full px-4 py-2 text-sm ${tab === t ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700'}`, onClick: () => setTab(t), children: t }, t))) }), tab === 'Milestones' && ((0, jsx_runtime_1.jsx)("ul", { className: "space-y-2 rounded-xl border border-zinc-200 p-4", children: contract.milestones.map((m) => ((0, jsx_runtime_1.jsxs)("li", { className: "flex justify-between text-sm", children: [(0, jsx_runtime_1.jsx)("span", { children: m.name }), (0, jsx_runtime_1.jsxs)("span", { children: [m.percentage, "% \u00B7 ", m.status] })] }, m.id))) })), tab === 'Files' && (0, jsx_runtime_1.jsx)("ul", { className: "rounded-xl border border-zinc-200 p-4 text-sm", children: contract.files.map((f) => (0, jsx_runtime_1.jsx)("li", { children: f }, f)) }), tab === 'Activity Log' && (0, jsx_runtime_1.jsx)("ul", { className: "rounded-xl border border-zinc-200 p-4 text-sm", children: contract.activityLog.map((a) => (0, jsx_runtime_1.jsx)("li", { children: a }, a)) }), (tab === 'Overview' || tab === 'Chat') && (0, jsx_runtime_1.jsxs)("div", { className: "rounded-xl border border-zinc-200 p-4 text-sm text-zinc-600", children: [tab, " panel ready for live data binding."] })] }));
}
//# sourceMappingURL=ContractPage.js.map