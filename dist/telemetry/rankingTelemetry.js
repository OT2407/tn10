"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logRankingTelemetry = logRankingTelemetry;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function logRankingTelemetry(userId, itemId, breakdown, enabled = false) {
    if (!enabled)
        return;
    await prisma.rankingTelemetry.create({
        data: {
            userId,
            itemId,
            totalScore: breakdown.totalScore,
            layerBreakdown: JSON.stringify(breakdown),
        },
    });
}
//# sourceMappingURL=rankingTelemetry.js.map