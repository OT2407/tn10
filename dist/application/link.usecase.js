"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkToFreeze = linkToFreeze;
const linkService_1 = require("../services/linkService");
const errors_1 = require("./errors");
async function linkToFreeze(input) {
    const existing = await (0, linkService_1.findLinkByFreezeAndUrl)(input.freezeId, input.url);
    if (existing) {
        throw new errors_1.AppError(409, "DUPLICATE_LINK", "Duplicate link for freeze");
    }
    return (0, linkService_1.createLink)(input.freezeId, input.url, input.note);
}
//# sourceMappingURL=link.usecase.js.map