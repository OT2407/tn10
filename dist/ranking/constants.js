"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SNAPSHOT = exports.EXPLORATION = exports.CREATOR_GROWTH = exports.FRESHNESS = exports.ENGAGEMENT_WEIGHTS = exports.PERSONALIZATION_WEIGHTS = void 0;
exports.PERSONALIZATION_WEIGHTS = {
    tag: 1.0,
    category: 0.8,
    designer: 1.2,
};
exports.ENGAGEMENT_WEIGHTS = {
    likes: 1.0,
    saves: 1.5,
    ageDecayFactor: 0.15,
    windowDays: 7,
};
exports.FRESHNESS = {
    halfLifeHours: 72,
};
exports.CREATOR_GROWTH = {
    emergingFollowerThreshold: 50,
    emergingItemThreshold: 5,
    emergingBoost: 1.5,
};
exports.EXPLORATION = {
    maxNoise: 0.2,
};
exports.SNAPSHOT = {
    ttlMinutes: 5,
};
//# sourceMappingURL=constants.js.map