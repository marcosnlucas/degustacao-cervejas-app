import { PrismaClient } from '@/generated/prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

declare global {
  var prisma: PrismaClient | undefined;
}

const prismaBase = new PrismaClient();

const prismaClient = prismaBase.$extends(withAccelerate());

export const prisma =
  global.prisma ??
  (process.env.NODE_ENV === 'production'
    ? prismaClient
    : prismaBase);

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

