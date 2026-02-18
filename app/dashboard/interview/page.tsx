"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';

export default function InterviewSetupPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [jobRole, setJobRole] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [experience, setExperience] = useState([2]);

    const handleStartInterview = async () => {
        if (!jobRole) {
            toast({
                variant: "destructive",
                title: "Job Role Required",
                description: "Please enter the job position you are interviewing for.",
            });
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/interview/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jobRole,
                    jobDescription,
                    experience: experience[0],
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to generate questions");
            }

            const data = await response.json();

            // Store questions in localStorage to access them in the interview session
            // In a real app, we'd store this in the DB and redirect to /interview/[id]
            // mocking an ID for now
            const interviewId = uuidv4();
            localStorage.setItem(`interview_${interviewId}`, JSON.stringify({
                questions: data.questions,
                jobRole,
                experience: experience[0]
            }));

            router.push(`/dashboard/interview/${interviewId}`);

        } catch {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not generate interview questions.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-10 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>AI Mock Interview Setup</CardTitle>
                    <CardDescription>
                        Tell us about the role you&apos;re applying for, and our AI will generate relevant questions.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="role">Job Role / Job Title</Label>
                        <Input
                            id="role"
                            placeholder="e.g. Senior React Developer"
                            value={jobRole}
                            onChange={(e) => setJobRole(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="desc">Job Description (Optional)</Label>
                        <Textarea
                            id="desc"
                            placeholder="Paste the job description here for more tailored questions..."
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            className="h-32"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <Label>Years of Experience</Label>
                            <span className="text-sm font-medium">{experience[0]} Years</span>
                        </div>
                        <Slider
                            value={experience}
                            onValueChange={setExperience}
                            max={20}
                            step={1}
                        />
                    </div>

                    <Button
                        className="w-full"
                        size="lg"
                        onClick={handleStartInterview}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating Questions...
                            </>
                        ) : (
                            "Start Interview"
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
