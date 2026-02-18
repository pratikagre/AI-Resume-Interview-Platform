import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
    // Graceful fallback for build time if env var is missing
    if (!process.env.DATABASE_URL) {
        if (process.env.NODE_ENV === 'production') {
            console.warn("⚠️ DATABASE_URL is missing in production. Using dummy connection string for build compliance.");
        }
        // Set dummy URL in env to satisfy Prisma constructor validation without passing 'datasources' object
        process.env.DATABASE_URL = "postgresql://dummy:dummy@localhost:5432/dummy";
    }

    return new PrismaClient();
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
