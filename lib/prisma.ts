import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
    // Graceful fallback for build time if env var is missing
    const url = process.env.DATABASE_URL;

    if (!url && process.env.NODE_ENV === 'production') {
        console.warn("⚠️ DATABASE_URL is missing in production build. Prisma Client might fail if used.");
    }

    return new PrismaClient({
        ...(url && {
            datasources: {
                db: {
                    url: url,
                },
            },
        }),
    });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
