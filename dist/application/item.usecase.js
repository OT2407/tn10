"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createItem = createItem;
exports.getItemWithFreezes = getItemWithFreezes;
exports.getItemsPage = getItemsPage;
exports.renameItem = renameItem;
exports.getItemFull = getItemFull;
const itemService_1 = require("../services/itemService");
const freezeService_1 = require("../services/freezeService");
async function createItem(input) {
    // business rules could be added here
    return (0, itemService_1.createItem)(input.ownerId, input.name);
}
async function getItemWithFreezes(id) {
    const item = await (0, itemService_1.getItem)(id);
    return item;
}
async function getItemsPage(input) {
    const items = await (0, itemService_1.listItems)(input.ownerId, input.limit + 1, input.cursor);
    const hasMore = items.length > input.limit;
    const pageItems = hasMore ? items.slice(0, input.limit) : items;
    const nextCursor = hasMore ? (pageItems[pageItems.length - 1]?.id ?? null) : null;
    return { items: pageItems, nextCursor };
}
async function renameItem(id, version, name) {
    return (0, itemService_1.updateItemVersion)(id, version, name === undefined ? {} : { name });
}
function parseFreezeMetadata(raw) {
    try {
        const parsed = JSON.parse(raw);
        if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
            return parsed;
        }
        return {};
    }
    catch {
        return {};
    }
}
async function getItemFull(id) {
    const item = await (0, itemService_1.getItem)(id);
    if (!item) {
        return null;
    }
    const freezes = await (0, freezeService_1.listFreezes)(id);
    const latestFreeze = freezes.length > 0 ? freezes[freezes.length - 1] : null;
    const status = freezes.length === 0 ? 'EMPTY' : latestFreeze?.type === 'final' ? 'FROZEN' : 'ACTIVE';
    return {
        id: item.id,
        name: item.name,
        currentHash: item.currentHash,
        status,
        freezes: freezes.map((freeze) => ({
            id: freeze.id,
            type: freeze.type,
            hash: freeze.hash,
            parentHash: freeze.parentHash,
            metadata: parseFreezeMetadata(freeze.metadata),
        })),
    };
}
//# sourceMappingURL=item.usecase.js.map