import { PrismaClient } from "@prisma/client";
import { generateHash } from "./hash";

const prisma = new PrismaClient();

export async function createFreeze(
  itemId: string,
  type: "base" | "intervention" | "final",
  svg: string,
  metadata: object
) {
  const previous = await prisma.freeze.findFirst({
    where: { itemId },
    orderBy: { createdAt: "desc" },
  });

  const parentHash = previous?.hash ?? null;

  const payload = {
    itemId,
    type,
    svg,
    metadata,
    parentHash,
  };

  const hash = generateHash(JSON.stringify(payload));

  const freeze = await prisma.freeze.create({
    data: {
      itemId,
      type,
      svg,
      metadata: JSON.stringify(metadata),
      parentHash,
      hash,
    },
  });

  await prisma.item.update({
    where: { id: itemId },
    data: { currentHash: hash },
  });

  return freeze;
}
