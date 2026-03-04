"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExploreQuerySchema = void 0;
const zod_1 = require("zod");
exports.ExploreQuerySchema = zod_1.z.object({
    cursor: zod_1.z.string().min(1).optional(),
    limit: zod_1.z.coerce.number().int().min(1).max(50).default(20),
    debugRanking: zod_1.z.coerce.boolean().optional(),
});
//# sourceMappingURL=explore.schema.js.map