"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateFreezeSchema = void 0;
const zod_1 = require("zod");
exports.CreateFreezeSchema = zod_1.z.object({
    type: zod_1.z.enum(['base', 'intervention', 'final']),
    svg: zod_1.z.string().min(1),
    metadata: zod_1.z.string().min(0),
    parentHash: zod_1.z.string().optional(),
    hash: zod_1.z.string().min(1)
});
//# sourceMappingURL=freeze.schema.js.map