"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createItem = createItem;
exports.getItemWithFreezes = getItemWithFreezes;
const itemService_1 = require("../services/itemService");
async function createItem(input) {
    // business rules could be added here
    return (0, itemService_1.createItem)(input.name);
}
async function getItemWithFreezes(id) {
    const item = await (0, itemService_1.getItem)(id);
    return item;
}
//# sourceMappingURL=item.usecase.js.map