import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { openai } from "@/lib/openai";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { jobRole, jobDescription, experience } = await req.json();

        if (!jobRole || !experience) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const prompt = `
      Generate 5 technical interview questions for a ${jobRole} position.
      Experience Level: ${experience} years.
      Job Description Context: ${jobDescription || "N/A"}
      
      Return the response as a JSON object with a "questions" array, where each object has "question" (string).
      Example: { "questions": [{ "question": "Explain React hooks." }] }
    `;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: "You are a helpful assistant that outputs JSON." }, { role: "user", content: prompt }],
            model: "gpt-3.5-turbo",
            response_format: { type: "json_object" },
        });

        const data = JSON.parse(completion.choices[0].message.content || "{}");

        // In a real app, we would save the interview session to DB here
        // For now, we just return the questions to the client to start the session state

        return NextResponse.json({ questions: data.questions || [] });

    } catch (error) {
        console.error("Generate questions error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
