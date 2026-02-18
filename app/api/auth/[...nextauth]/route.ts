import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Forces the route to be dynamic, avoiding static generation issues during build
export const dynamic = 'force-dynamic';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
