import { PrismaClient } from "@prisma/client";
import { LayerBreakdown } from "../ranking/types";

const prisma = new PrismaClient();

export async function logRankingTelemetry(
  userId: string,
  itemId: string,
  breakdown: LayerBreakdown,
  enabled = false
): Promise<void> {
  if (!enabled) return;

  await prisma.rankingTelemetry.create({
    data: {
      userId,
      itemId,
      totalScore: breakdown.totalScore,
      layerBreakdown: JSON.stringify(breakdown),
    },
  });
}
