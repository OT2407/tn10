import { prisma } from '../infrastructure/prisma';

export async function upsertUserByEmail(email: string, password: string, role: string) {
  return prisma.user.upsert({
    where: { email },
    update: { password, role },
    create: { email, password, role },
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}
