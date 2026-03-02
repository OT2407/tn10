"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkToFreeze = linkToFreeze;
const linkService_1 = require("../services/linkService");
async function linkToFreeze(input) {
    return (0, linkService_1.createLink)(input.freezeId, input.url, input.note);
}
//# sourceMappingURL=link.usecase.js.map