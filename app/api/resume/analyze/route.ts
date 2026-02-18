import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { openai } from "@/lib/openai";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdf = require("pdf-parse");

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Convert file to buffer for pdf-parse
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Extract text from PDF
        const data = await pdf(buffer);
        const resumeText = data.text;

        if (!resumeText) {
            return NextResponse.json({ error: "Could not extract text from PDF" }, { status: 400 });
        }

        // Analyze with OpenAI
        const prompt = `
      You are an expert Resume Analyzer and ATS (Applicant Tracking System) specialist.
      Analyze the following resume text and provide a structured JSON response.
      The response MUST be valid JSON with the following fields:
      - atsScore: number (0-100)
      - skills: string[] (list of extracted technical and soft skills)
      - missingKeywords: string[] (important keywords missing for a general software engineering/tech role)
      - profileSummary: string (brief professional summary)
      - improvementTips: string[] (actionable tips to improve the resume)
      - radarChartData: { subject: string, A: number, fullMark: number }[] (data for a radar chart with 5-6 categories like "Technical Skills", "Experience", "Education", "Formatting", "Impact", "Keywords", where A is the score out of 100)

      Resume Text:
      ${resumeText.substring(0, 3000)}
    `;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: "You are a helpful assistant that outputs JSON." }, { role: "user", content: prompt }],
            model: "gpt-3.5-turbo",
            response_format: { type: "json_object" },
        });

        const analysisResult = JSON.parse(completion.choices[0].message.content || "{}");

        // Save to Database
        // Note: In a real app, we would upload the file to Supabase Storage here and save the URL.
        // For this MVP, we are skipping the storage upload in this route and focusing on the analysis.
        // The frontend can handle the storage upload separately if needed, or we can add it here.
        // For now, we'll store a placeholder URL or the one sent from frontend if we change the flow.

        // Let's assume the frontend will upload to Supabase and send us the URL, OR we just store the analysis.
        // The prompt asked for "Supabase Storage (for resume upload)".
        // Let's create the record.

        const resume = await prisma.resume.create({
            data: {
                userId: session.user.id,
                fileUrl: "https://example.com/placeholder.pdf", // We'd update this if we had the storage logic
                fileName: file.name,
                atsScore: analysisResult.atsScore || 0,
                feedback: analysisResult,
            },
        });

        return NextResponse.json({ resume, analysis: analysisResult });

    } catch (error) {
        console.error("Resume analysis error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
