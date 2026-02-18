"use client";

import { useState } from "react";
import { ResumeUpload } from "@/components/resume-upload";
import { ResumeAnalysis } from "@/components/resume-analysis";

export default function ResumePage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [analysisData, setAnalysisData] = useState<any>(null);

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">AI Resume Analyzer</h2>
                <p className="text-muted-foreground">
                    Upload your resume to get an instant ATS score and improvement tips.
                </p>
            </div>

            {!analysisData ? (
                <ResumeUpload onAnalysisComplete={setAnalysisData} />
            ) : (
                <div className="space-y-6">
                    <ResumeAnalysis data={analysisData} />
                    <div className="flex justify-center">
                        <button
                            onClick={() => setAnalysisData(null)}
                            className="text-sm text-muted-foreground hover:underline"
                        >
                            Analyze another resume
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
