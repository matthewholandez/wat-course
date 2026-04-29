import OpenAI from "openai";

export const runtime = "edge";

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY || "",
});

export async function POST(req: Request) {
    try {
        const { message } = await req.json();

        if (!process.env.OPENROUTER_API_KEY) {
            return new Response("Missing OPENROUTER_API_KEY", { status: 500 });
        }

        const response = await openai.chat.completions.create({
            model: "google/gemini-3.1-flash-lite-preview",
            messages: [{ role: "user", content: message }],
            stream: true,
        });

        // Convert the OpenAI AsyncIterable to a standard Web Streams API ReadableStream
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    for await (const chunk of response) {
                        const content = chunk.choices[0]?.delta?.content || "";
                        if (content) {
                            controller.enqueue(encoder.encode(content));
                        }
                    }
                } catch (error) {
                    controller.error(error);
                } finally {
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });
    } catch (error: any) {
        return new Response(error.message || "Internal Server Error", { status: 500 });
    }
}