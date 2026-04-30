import { OpenRouter } from "@openrouter/sdk";

export const runtime = "edge";

const openRouter = new OpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY || ""
})

export async function POST(req: Request) {
    try {
        const { message } = await req.json();

        if (!process.env.OPENROUTER_API_KEY) {
            return new Response("Missing OPENROUTER_API_KEY from .env.local", { status: 500 });
        }
        
        if (!process.env.MODEL) {
            return new Response("Missing MODEL from .env", { status: 500 });
        }

        const stream = await openRouter.chat.send({
            chatRequest: {
                maxTokens: 1000,
                messages: [{
                    content: message,
                    role: "user"
                }],
                model: process.env.MODEL,
                temperature: 0.7,
                stream: true
            }
        });

        const readableStream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    for await (const chunk of stream) {
                        const content = chunk.choices?.[0]?.delta?.content;
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
        })

        return new Response(readableStream, {
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