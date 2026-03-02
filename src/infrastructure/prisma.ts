import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

let isDisconnected = false;

export async function disconnectPrisma(): Promise<void> {
  if (isDisconnected) {
    return;
  }
  await prisma.$disconnect();
  isDisconnected = true;
}
