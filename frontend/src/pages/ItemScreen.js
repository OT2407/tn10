"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemScreen = ItemScreen;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const ItemPage_1 = require("../components/item/ItemPage");
const data_1 = require("../mocks/data");
function ItemScreen() {
    return (0, jsx_runtime_1.jsx)("main", { className: "min-h-screen bg-zinc-50", children: (0, jsx_runtime_1.jsx)(ItemPage_1.ItemPage, { item: data_1.sampleItem }) });
}
//# sourceMappingURL=ItemScreen.js.map