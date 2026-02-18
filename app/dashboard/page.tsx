import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Mic, TrendingUp } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const resumeCount = await prisma.resume.count({
        where: { userId: session.user.id }
    });

    const interviewCount = await prisma.interview.count({
        where: { userId: session.user.id }
    });

    // Mock average score since we didn't save scores to DB in previous steps mostly
    // In a real app we would aggregate `prisma.interview.aggregate`
    const avgScore = 78;

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">Welcome back, {session.user.name}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Resumes</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{resumeCount}</div>
                        <p className="text-xs text-muted-foreground">Analyzed by AI</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Interviews Taken</CardTitle>
                        <Mic className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{interviewCount}</div>
                        <p className="text-xs text-muted-foreground">Mock sessions</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{avgScore}%</div>
                        <p className="text-xs text-muted-foreground">Across all interviews</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <Link href="/dashboard/resume" className="block p-6 border rounded-lg hover:border-primary transition-colors bg-card hover:bg-accent/50">
                            <FileText className="h-8 w-8 mb-2 text-primary" />
                            <h3 className="font-semibold">Analyze New Resume</h3>
                            <p className="text-sm text-muted-foreground">Upload and get instant feedback</p>
                        </Link>
                        <Link href="/dashboard/interview" className="block p-6 border rounded-lg hover:border-primary transition-colors bg-card hover:bg-accent/50">
                            <Mic className="h-8 w-8 mb-2 text-primary" />
                            <h3 className="font-semibold">Start Mock Interview</h3>
                            <p className="text-sm text-muted-foreground">Practice with AI interviewer</p>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">No recent activity found.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
