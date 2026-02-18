import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { prisma } = await import("@/lib/prisma");

        // 1. Check if Env Var exists (masked)
        const dbUrl = process.env.DATABASE_URL;
        const isSet = !!dbUrl;
        const isDummy = dbUrl?.includes("dummy");

        if (!isSet) {
            return NextResponse.json({
                status: "ERROR",
                message: "DATABASE_URL environment variable is NOT set in Vercel."
            }, { status: 500 });
        }

        if (isDummy) {
            return NextResponse.json({
                status: "ERROR",
                message: "DATABASE_URL is set to the dummy build fallback. Please set the real connection string in Vercel Settings."
            }, { status: 500 });
        }

        // 2. Test Connection
        await prisma.$connect();

        // 3. Simple Query
        const userCount = await prisma.user.count();

        return NextResponse.json({
            status: "OK",
            message: "Successfully connected to Database!",
            userCount: userCount
        });

    } catch (error: any) {
        console.error("DB Test Error:", error);
        return NextResponse.json({
            status: "ERROR",
            message: "Failed to connect to database.",
            details: error.message
        }, { status: 500 });
    }
}
