import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Force dynamic to prevent static generation attempts
export const dynamic = 'force-dynamic';
// Explicitly set runtime to nodejs to avoid edge compatibility issues with pdf-parse
export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Lazy load heavy dependencies to prevent build-time crashes
        const { prisma } = await import("@/lib/prisma");
        const OpenAI = (await import("openai")).default;
        // Polyfill Promise.withResolvers for Node < 22 (required by recent pdf.js versions)
        if (typeof Promise.withResolvers === 'undefined') {
            // @ts-ignore - Polyfill for Node.js environments
            Promise.withResolvers = function () {
                let resolve, reject;
                const promise = new Promise((res, rej) => {
                    resolve = res;
                    reject = rej;
                });
                return { promise, resolve, reject };
            };
        }

        // Polyfill DOMMatrix for Node.js environments (required by pdf.js)
        if (typeof global.DOMMatrix === 'undefined') {
            console.log("Polyfilling DOMMatrix for pdf-parse...");
            // @ts-ignore - Polyfill
            global.DOMMatrix = class DOMMatrix {
                constructor() { }
            };
        }

        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdf = require("pdf-parse");

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

        // Initialize OpenAI only when needed and safe
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.error("OPENAI_API_KEY is missing");
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        const openai = new OpenAI({
            apiKey: apiKey,
        });

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
        const resume = await prisma.resume.create({
            data: {
                userId: session.user.id,
                fileUrl: "https://example.com/placeholder.pdf", // Placeholder for now
                fileName: file.name,
                atsScore: analysisResult.atsScore || 0,
                feedback: analysisResult,
            },
        });

        return NextResponse.json({ resume, analysis: analysisResult });

    } catch (error) {
        console.error("Resume analysis error:", error);
        return NextResponse.json({ error: `Analysis failed: ${(error as any).message}` }, { status: 500 });
    }
}
