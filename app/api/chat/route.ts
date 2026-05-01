import { OpenRouter } from "@openrouter/sdk";
import RedisSingleton from "@/lib/redis";

import type { MessageRequest } from "@/hooks/useChatEngine";

export const runtime = "nodejs";

const openRouterClient = new OpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY || ""
})

export async function POST(req: Request) {
    try {
        const { conversationId, content }: MessageRequest = await req.json();

        if (!process.env.OPENROUTER_API_KEY) {
            return new Response("Missing OPENROUTER_API_KEY from .env.local", { status: 500 });
        }
        
        if (!process.env.MODEL) {
            return new Response("Missing MODEL from .env", { status: 500 });
        }

        const redis = await RedisSingleton.getInstance();

        const stream = await openRouterClient.chat.send({
            chatRequest: {
                maxTokens: 1000,
                messages: [
                    {
                        content: "You are a Student Advisor at the University of Waterloo. Also, you're a goose. Respond to the student's question, concisely, and do not use any markdown. You may use humour conservatively.",
                        role: "system"
                    },
                    {
                        content: content,
                        role: "user"
                    }
                ],
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
        console.log(error)
        return new Response(error.message || "Internal Server Error", { status: 500 });
    }
}