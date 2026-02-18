import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
    // In Prisma v7 with 'driverAdapter' or explicit config, we should pass the URL if not in schema.
    // However, if we are using standard Postgres without an adapter, we might need to pass `datasourceUrl` 
    // or `datasources` in a specific format if the schema doesn't have it.

    // Attempting the most standard v7 way for non-adapter usage:
    return new PrismaClient({
        datasourceUrl: process.env.DATABASE_URL,
    });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
