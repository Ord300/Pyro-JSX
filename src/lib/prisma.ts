import path from "path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/src/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function resolveDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL || "file:./prisma/dev.db";
  const filePath = raw.replace(/^file:/, "");
  if (path.isAbsolute(filePath)) return filePath;
  return path.join(process.cwd(), filePath);
}

export function createPrismaClient(): PrismaClient {
  const adapter = new PrismaBetterSqlite3({ url: resolveDatabaseUrl() });
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
