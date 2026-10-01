import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const databaseUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@129.152.23.114:5432/doha_exam_platform?sslmode=disable';

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasourceUrl: databaseUrl,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
