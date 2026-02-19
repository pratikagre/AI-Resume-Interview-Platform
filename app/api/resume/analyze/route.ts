import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Force dynamic to prevent static generation attempts
export const dynamic = 'force-dynamic';
// Explicitly set runtime to nodejs to avoid edge compatibility issues with pdf-parse
export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        console.log("[ResumeAPI] Step 1: Check Session");
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log("[ResumeAPI] Step 2: Import Dependencies");
        // Lazy load heavy dependencies to prevent build-time crashes
        const { prisma } = await import("@/lib/prisma");
        const OpenAI = (await import("openai")).default;

        console.log("[ResumeAPI] Step 3: Require pdf2json");
        const PDFParser = (await import("pdf2json")).default;

        console.log("[ResumeAPI] Step 4: Parse Form Data");
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        console.log("[ResumeAPI] Step 5: Convert File to Buffer");
        // Convert file to buffer for pdf-parse
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        console.log("[ResumeAPI] Step 6: Extract Text (using pdf2json)");

        const resumeText = await new Promise<string>((resolve, reject) => {
            const pdfParser = new PDFParser(null, 1); // 1 = text mode

            pdfParser.on("pdfParser_dataError", (errData: any) => {
                console.error("[ResumeAPI] PDF Parser Error:", errData.parserError);
                reject(new Error(errData.parserError));
            });

            pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
                // Extract text from the raw data
                const rawText = pdfParser.getRawTextContent();
                resolve(rawText);
            });

            pdfParser.parseBuffer(buffer);
        });

        if (!resumeText) {
            return NextResponse.json({ error: "Could not extract text from PDF" }, { status: 400 });
        }
        console.log(`[ResumeAPI] Extracted text length: ${resumeText.length}`);

        console.log("[ResumeAPI] Step 7: Config OpenAI");
        // Initialize OpenAI only when needed and safe
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.error("OPENAI_API_KEY is missing");
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        const openai = new OpenAI({
            apiKey: apiKey,
        });

        console.log("[ResumeAPI] Step 8: Call OpenAI");
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

        console.log("[ResumeAPI] Step 9: Parse OpenAI Response");
        const analysisResult = JSON.parse(completion.choices[0].message.content || "{}");

        console.log("[ResumeAPI] Step 10: Save to DB");
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

        console.log("[ResumeAPI] Success!");
        return NextResponse.json({ resume, analysis: analysisResult });

    } catch (error) {
        console.error("Resume analysis error:", error);
        return NextResponse.json({ error: `Analysis failed: ${(error as any).message}` }, { status: 500 });
    }
}
