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
exports.CreateCollabModal = CreateCollabModal;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const MemberInviteInput_1 = require("./MemberInviteInput");
const RevenueSplitSlider_1 = require("./RevenueSplitSlider");
function CreateCollabModal({ open, members }) {
    const [invite, setInvite] = (0, react_1.useState)('');
    const [localMembers, setLocalMembers] = (0, react_1.useState)(members);
    const total = (0, react_1.useMemo)(() => localMembers.reduce((sum, m) => sum + m.percentage, 0), [localMembers]);
    if (!open) {
        return null;
    }
    return ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-30 flex items-center justify-center bg-zinc-900/35 p-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-lg font-semibold", children: "Create Collaboration" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm text-zinc-600", children: "Invite members and define revenue split." }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-4 space-y-3", children: [(0, jsx_runtime_1.jsx)(MemberInviteInput_1.MemberInviteInput, { value: invite, onChange: setInvite }), localMembers.map((member, idx) => ((0, jsx_runtime_1.jsx)(RevenueSplitSlider_1.RevenueSplitSlider, { label: `${member.name} (${member.role})`, value: member.percentage, onChange: (value) => setLocalMembers((prev) => prev.map((m, i) => (i === idx ? { ...m, percentage: value } : m))) }, member.id))), (0, jsx_runtime_1.jsxs)("p", { className: `text-sm ${total === 100 ? 'text-emerald-600' : 'text-rose-600'}`, children: ["Total Split: ", total, "%"] }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "w-full rounded-lg bg-zinc-900 px-4 py-2 text-white", children: "Save Collaboration" })] })] }) }));
}
//# sourceMappingURL=CreateCollabModal.js.map