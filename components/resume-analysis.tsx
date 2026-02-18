"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
} from "recharts";

interface AnalysisResult {
    resume: {
        id: string;
        fileName: string;
        atsScore: number;
    };
    analysis: {
        atsScore: number;
        skills: string[];
        missingKeywords: string[];
        profileSummary: string;
        improvementTips: string[];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        radarChartData: any[];
    };
}

export function ResumeAnalysis({ data }: { data: AnalysisResult }) {
    const { analysis } = data;

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-500";
        if (score >= 60) return "text-yellow-500";
        return "text-red-500";
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                {/* ATS Score Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>ATS Score</CardTitle>
                        <CardDescription>
                            Your resume&apos;s compatibility with Applicant Tracking Systems
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center pt-6">
                        <div className="relative flex items-center justify-center">
                            <div className={`text-6xl font-bold ${getScoreColor(analysis.atsScore)}`}>
                                {analysis.atsScore}
                            </div>
                            <span className="text-xl text-muted-foreground absolute -right-6 top-0">/100</span>
                        </div>
                        <Progress
                            value={analysis.atsScore}
                            className="w-full mt-6 h-3"
                        />
                    </CardContent>
                </Card>

                {/* Radar Chart */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Skill Analysis</CardTitle>
                        <CardDescription>Breakdown of your resume&apos;s strengths</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={analysis.radarChartData}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="subject" />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                    <Radar
                                        name="Resume"
                                        dataKey="A"
                                        stroke="#8884d8"
                                        fill="#8884d8"
                                        fillOpacity={0.6}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Skills Found */}
                <Card>
                    <CardHeader>
                        <CardTitle>Identified Skills</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {analysis.skills.map((skill, index) => (
                                <Badge key={index} variant="secondary">{skill}</Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Missing Keywords */}
                <Card>
                    <CardHeader>
                        <CardTitle>Missing Keywords</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {analysis.missingKeywords.map((keyword, index) => (
                                <Badge key={index} variant="destructive">{keyword}</Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Improvement Tips */}
            <Card>
                <CardHeader>
                    <CardTitle>Improvement Tips</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc pl-5 space-y-2">
                        {analysis.improvementTips.map((tip, index) => (
                            <li key={index} className="text-muted-foreground">{tip}</li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
