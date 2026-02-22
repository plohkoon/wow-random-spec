import { PrismaClient, Prisma } from "../../generated/prisma/client";

export const db = new PrismaClient();
export { Prisma };
export * from "../../generated/prisma.types";
