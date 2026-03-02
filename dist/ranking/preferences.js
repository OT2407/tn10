"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPreference = getPreference;
exports.updatePreference = updatePreference;
const preferenceStore = new Map();
function getPreference(userId) {
    return (preferenceStore.get(userId) || {
        userId,
        likedTags: {},
        likedCategories: {},
        followedDesigners: {},
    });
}
function updatePreference(userId, type, key, delta) {
    const pref = getPreference(userId);
    if (type === 'tag')
        pref.likedTags[key] = (pref.likedTags[key] || 0) + delta;
    if (type === 'category')
        pref.likedCategories[key] = (pref.likedCategories[key] || 0) + delta;
    if (type === 'designer')
        pref.followedDesigners[key] = (pref.followedDesigners[key] || 0) + delta;
    preferenceStore.set(userId, pref);
}
//# sourceMappingURL=preferences.js.map