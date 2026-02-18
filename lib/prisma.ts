import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
    // Graceful fallback: If DATABASE_URL exists, use standard init (respects schema.prisma)
    if (process.env.DATABASE_URL) {
        return new PrismaClient();
    }

    // If missing (likely build time), use dummy to pass validation
    if (process.env.NODE_ENV === 'production') {
        process.env.DATABASE_URL = "postgresql://dummy:dummy@localhost:5432/dummy";
        console.warn("⚠️ DATABASE_URL is missing in production build. Using dummy connection.");
    }

    // We can also just return new PrismaClient() now that we set the env var above
    // This avoids using the 'datasources' property which can be flaky across versions
    return new PrismaClient();
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
