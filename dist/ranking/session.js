"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSession = getSession;
exports.updateSession = updateSession;
const sessionStore = new Map();
const MAX_SIGNAL = 5; // cap per key
const DECAY_FACTOR = 0.9; // soft decay per read
function getSession(userId) {
    if (!sessionStore.has(userId)) {
        sessionStore.set(userId, {
            userId,
            viewedTags: {},
            viewedCategories: {},
            viewedDesigners: {}
        });
    }
    const session = sessionStore.get(userId);
    // Apply soft decay
    for (const map of [
        session.viewedTags,
        session.viewedCategories,
        session.viewedDesigners
    ]) {
        for (const key in map) {
            map[key] = (map[key] ?? 0) * DECAY_FACTOR;
        }
    }
    return session;
}
function updateSession(userId, type, key) {
    const session = getSession(userId);
    if (type === 'tag') {
        session.viewedTags[key] = Math.min((session.viewedTags[key] || 0) + 1, MAX_SIGNAL);
    }
    if (type === 'category') {
        session.viewedCategories[key] = Math.min((session.viewedCategories[key] || 0) + 1, MAX_SIGNAL);
    }
    if (type === 'designer') {
        session.viewedDesigners[key] = Math.min((session.viewedDesigners[key] || 0) + 1, MAX_SIGNAL);
    }
}
//# sourceMappingURL=session.js.map