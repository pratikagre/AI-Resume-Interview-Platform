import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';
export const runtime = "nodejs";

export async function POST(req: Request) {
    // Dynamic import to prevent build-time initialization
    const OpenAI = (await import("openai")).default;

    // Initialize OpenAI only when needed
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }
    const openai = new OpenAI({ apiKey });
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        console.log("[InterviewAPI] Received body:", body);
        const { jobRole, jobDescription, experience } = body;

        // validation: experience can be 0, so check strict null/undefined or empty string for role
        if (!jobRole || experience === undefined || experience === null) {
            console.error("[InterviewAPI] Validation Failed:", { jobRole, experience });
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const prompt = `
      Generate 5 technical interview questions for a ${jobRole} position.
      Experience Level: ${experience} years.
      Job Description Context: ${jobDescription || "N/A"}
      
      Return the response as a JSON object with a "questions" array, where each object has "question" (string).
      Example: { "questions": [{ "question": "Explain React hooks." }] }
    `;

        let data;
        try {
            const completion = await openai.chat.completions.create({
                messages: [{ role: "system", content: "You are a helpful assistant that outputs JSON." }, { role: "user", content: prompt }],
                model: "gpt-3.5-turbo",
                response_format: { type: "json_object" },
            });
            data = JSON.parse(completion.choices[0].message.content || "{}");
        } catch (openaiError: any) {
            console.error("OpenAI API Failed:", openaiError);
            if (openaiError?.status === 429 || openaiError?.status === 500 || openaiError?.code === 'insufficient_quota') {
                console.warn("⚠️ Using MOCK DATA due to OpenAI API Quota Limit");
                data = {
                    questions: [
                        { question: `[MOCK] Explain the core concepts of ${jobRole}.` },
                        { question: "[MOCK] How do you handle state management in complex applications?" },
                        { question: "[MOCK] Describe a challenging bug you fixed recently." },
                        { question: "[MOCK] What is the difference between TCP and UDP?" },
                        { question: "[MOCK] How would you optimize a slow database query?" }
                    ]
                };
            } else {
                throw openaiError; // Re-throw if it's not a quota/server issue
            }
        }

        // In a real app, we would save the interview session to DB here
        // For now, we just return the questions to the client to start the session state
        return NextResponse.json({ questions: data.questions || [] });

    } catch (error) {
        console.error("Generate questions error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
