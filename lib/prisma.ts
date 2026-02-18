import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
    // Graceful fallback for build time if env var is missing
    const url = process.env.DATABASE_URL;

    if (!url && process.env.NODE_ENV === 'production') {
        console.warn("⚠️ DATABASE_URL is missing in production build. Prisma Client might fail if used.");
    }

    // If DATABASE_URL is missing in production (e.g. during build), use a dummy valid URL to satisfy Prisma validation
    // This prevents the build from crashing, but obviously won't work for runtime data fetching (which is fine during build)
    const connectionUrl = url || "postgresql://dummy:dummy@localhost:5432/dummy";

    return new PrismaClient({
        datasources: {
            db: {
                url: connectionUrl,
            },
        },
    });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
