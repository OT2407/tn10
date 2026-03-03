"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSession = getSession;
exports.updateSession = updateSession;
const sessionStore = new Map();
function getSession(userId) {
    if (!sessionStore.has(userId)) {
        sessionStore.set(userId, {
            userId,
            viewedTags: {},
            viewedCategories: {},
            viewedDesigners: {}
        });
    }
    return sessionStore.get(userId);
}
function updateSession(userId, type, key) {
    const session = getSession(userId);
    if (type === 'tag')
        session.viewedTags[key] = (session.viewedTags[key] || 0) + 1;
    if (type === 'category')
        session.viewedCategories[key] = (session.viewedCategories[key] || 0) + 1;
    if (type === 'designer')
        session.viewedDesigners[key] = (session.viewedDesigners[key] || 0) + 1;
}
//# sourceMappingURL=session.js.map