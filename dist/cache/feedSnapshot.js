"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSnapshot = getSnapshot;
exports.setSnapshot = setSnapshot;
const constants_1 = require("../ranking/constants");
const snapshotStore = new Map();
function getSnapshot(userId) {
    const entry = snapshotStore.get(userId);
    if (!entry)
        return null;
    if (Date.now() > entry.expiresAt) {
        snapshotStore.delete(userId);
        return null;
    }
    return entry.itemIds;
}
function setSnapshot(userId, itemIds) {
    const ttl = constants_1.SNAPSHOT.ttlMinutes * 60 * 1000;
    snapshotStore.set(userId, {
        itemIds,
        expiresAt: Date.now() + ttl,
    });
}
//# sourceMappingURL=feedSnapshot.js.map