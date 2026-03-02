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
exports.ContractScreen = ContractScreen;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const ContractPage_1 = require("../components/contract/ContractPage");
const CreateCollabModal_1 = require("../components/collaboration/CreateCollabModal");
const data_1 = require("../mocks/data");
function ContractScreen() {
    const [showModal, setShowModal] = (0, react_1.useState)(false);
    return ((0, jsx_runtime_1.jsxs)("main", { className: "min-h-screen bg-zinc-50", children: [(0, jsx_runtime_1.jsx)("div", { className: "mx-auto max-w-6xl px-4 pt-5", children: (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setShowModal(true), className: "rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white", children: "Create Collaboration" }) }), (0, jsx_runtime_1.jsx)(ContractPage_1.ContractPage, { contract: data_1.sampleContract }), (0, jsx_runtime_1.jsx)(CreateCollabModal_1.CreateCollabModal, { open: showModal, members: data_1.sampleMembers })] }));
}
//# sourceMappingURL=ContractScreen.js.map