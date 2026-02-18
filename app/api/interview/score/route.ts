import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { answers, jobRole, experience } = await req.json();

        const prompt = `
      You are an expert Technical Interviewer having an interview for a ${jobRole} role (Experience: ${experience} years).
      
      Score the following candidate answers.
      
      Input Data:
      ${JSON.stringify(answers)}
      
      Output JSON format:
      {
        "scores": {
            "technical": number (1-10),
            "communication": number (1-10),
            "confidence": number (1-10) // infer from transcript clarity and length
        },
        "questionFeedback": [
            {
                "question": "string",
                "userAnswer": "string",
                "feedback": "string (critique)",
                "improvement": "string (better sample answer)"
            }
        ]
      }
    `;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: "You are a helpful assistant that outputs JSON." }, { role: "user", content: prompt }],
            model: "gpt-3.5-turbo",
            response_format: { type: "json_object" },
        });

        const data = JSON.parse(completion.choices[0].message.content || "{}");

        // Save result to DB (Skipped for MVP speed, but good to have)

        return NextResponse.json(data);

    } catch (error) {
        console.error("Scoring error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
