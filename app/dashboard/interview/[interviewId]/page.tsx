"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { VoiceRecorder } from "@/components/voice-recorder";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Question {
    question: string;
}

interface InterviewData {
    questions: Question[];
    jobRole: string;
    experience: number;
}

export default function InterviewSessionPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const interviewId = params.interviewId as string;

    const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<{ question: string; answer: string }[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [feedbackData, setFeedbackData] = useState<any>(null);

    useEffect(() => {
        const storedData = localStorage.getItem(`interview_${interviewId}`);
        if (storedData) {
            setInterviewData(JSON.parse(storedData));
        }
    }, [interviewId, router]);

    const handleAnswerSubmit = (transcript: string) => {
        const currentQuestion = interviewData?.questions[currentQuestionIndex].question;

        if (!currentQuestion) return;

        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = { question: currentQuestion, answer: transcript };
        setAnswers(newAnswers);

        if (currentQuestionIndex < (interviewData?.questions.length || 0) - 1) {
            setTimeout(() => setCurrentQuestionIndex(prev => prev + 1), 500);
        } else {
            finishInterview(newAnswers);
        }
    };

    const finishInterview = async (finalAnswers: { question: string; answer: string }[]) => {
        setIsProcessing(true);
        try {
            const response = await fetch("/api/interview/score", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    answers: finalAnswers,
                    jobRole: interviewData?.jobRole,
                    experience: interviewData?.experience
                }),
            });

            if (!response.ok) throw new Error("Failed to score interview");

            const data = await response.json();
            setFeedbackData(data);
            setIsCompleted(true);

        } catch {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to submit interview.",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const generatePDF = () => {
        if (!feedbackData || !interviewData) return;

        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text("Mock Interview Report", 20, 20);

        doc.setFontSize(12);
        doc.text(`Role: ${interviewData.jobRole}`, 20, 30);
        doc.text(`Experience: ${interviewData.experience} Years`, 20, 36);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 42);

        doc.setFontSize(14);
        doc.text("Scores", 20, 55);

        autoTable(doc, {
            startY: 60,
            head: [['Category', 'Score']],
            body: [
                ['Technical', `${feedbackData.scores.technical}/10`],
                ['Communication', `${feedbackData.scores.communication}/10`],
                ['Confidence', `${feedbackData.scores.confidence}/10`],
            ],
        });

        const finalY = (doc as any).lastAutoTable.finalY || 80;

        doc.text("Detailed Feedback", 20, finalY + 15);

        const rows = feedbackData.questionFeedback.map((item: any) => [
            item.question,
            item.userAnswer,
            item.feedback,
            item.improvement
        ]);

        autoTable(doc, {
            startY: finalY + 20,
            head: [['Question', 'Your Answer', 'Feedback', 'Improvement']],
            body: rows,
            styles: { fontSize: 8, cellPadding: 2 },
            columnStyles: {
                0: { cellWidth: 30 },
                1: { cellWidth: 40 },
                2: { cellWidth: 50 },
                3: { cellWidth: 50 },
            },
        });

        doc.save("interview-report.pdf");
    };

    if (!interviewData) {
        return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
    }

    if (isCompleted && feedbackData) {
        return (
            <div className="container mx-auto py-10 max-w-3xl">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl text-green-600">Interview Completed!</CardTitle>
                        <CardDescription>Here is your feedback summary</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-4 border rounded bg-muted/20">
                                <p className="text-sm text-muted-foreground">Technical</p>
                                <p className="text-2xl font-bold">{feedbackData.scores.technical}/10</p>
                            </div>
                            <div className="p-4 border rounded bg-muted/20">
                                <p className="text-sm text-muted-foreground">Communication</p>
                                <p className="text-2xl font-bold">{feedbackData.scores.communication}/10</p>
                            </div>
                            <div className="p-4 border rounded bg-muted/20">
                                <p className="text-sm text-muted-foreground">Confidence</p>
                                <p className="text-2xl font-bold">{feedbackData.scores.confidence}/10</p>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button onClick={generatePDF} variant="outline">Download PDF Report</Button>
                        </div>

                        <h3 className="font-semibold text-lg">Detailed Feedback</h3>
                        <div className="space-y-4">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {feedbackData.questionFeedback.map((item: any, i: number) => (
                                <Alert key={i}>
                                    <AlertTitle className="mb-2">Q: {item.question}</AlertTitle>
                                    <AlertDescription className="text-sm space-y-2">
                                        <p className="text-muted-foreground italic">&quot; {item.userAnswer} &quot;</p>
                                        <div className="bg-primary/5 p-2 rounded text-sm mt-2">
                                            <p className="font-medium text-primary">Feedback:</p>
                                            {item.feedback}
                                        </div>
                                        <div className="text-green-600 text-sm">
                                            <strong>Better Answer:</strong> {item.improvement}
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={() => router.push("/dashboard/interview")} className="w-full">Start New Interview</Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10 max-w-2xl">
            <div className="mb-6 space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Question {currentQuestionIndex + 1} of {interviewData.questions.length}</span>
                    <span>{interviewData.jobRole}</span>
                </div>
                <Progress value={((currentQuestionIndex) / interviewData.questions.length) * 100} />
            </div>

            <Card className="min-h-[400px] flex flex-col justify-between">
                <CardHeader>
                    <CardTitle className="text-xl leading-relaxed">
                        {interviewData.questions[currentQuestionIndex].question}
                    </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col justify-center">
                    <VoiceRecorder
                        onRecordingComplete={handleAnswerSubmit}
                        isProcessing={isProcessing}
                    />
                </CardContent>

                <CardFooter className="justify-center text-sm text-muted-foreground">
                    <p>Speak clearly and take your time.</p>
                </CardFooter>
            </Card>
        </div>
    );
}
