"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLinkBodySchema = exports.linkFreezeParamSchema = void 0;
const zod_1 = require("zod");
exports.linkFreezeParamSchema = zod_1.z.object({
    freezeId: zod_1.z.string().min(1),
});
exports.createLinkBodySchema = zod_1.z.object({
    url: zod_1.z.url(),
    note: zod_1.z.string().min(1).optional(),
});
//# sourceMappingURL=link.schema.js.map