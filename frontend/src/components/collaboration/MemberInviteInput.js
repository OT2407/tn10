"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberInviteInput = MemberInviteInput;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
function MemberInviteInput({ value, onChange }) {
    return ((0, jsx_runtime_1.jsx)("input", { type: "email", value: value, onChange: (e) => onChange(e.target.value), placeholder: "Invite member by email", className: "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" }));
}
//# sourceMappingURL=MemberInviteInput.js.map