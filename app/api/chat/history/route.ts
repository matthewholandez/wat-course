import RedisSingleton from '@/lib/redis';
import type { Message } from '@/app/chat/MessageArea';

export type MessageHistoryResponse = {
    messageHistory: Message[];
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) {
            return Response.json({ error: "Missing id" }, { status: 400 });
        }
        const redis = await RedisSingleton.getInstance();
        const exists = await redis.exists(`messages:${id}`);
        if (exists) {
            const history = await redis.lRange(`messages:${id}`, 0, -1);
            const parsedHistory: Message[] = history.map(msg => JSON.parse(msg));
            return Response.json({ messageHistory: parsedHistory })
        } else {
            return Response.json({ messageHistory: [] })
        }
    } catch (error: any) {
        return Response.json(error.message || "Internal server error", { status: 500 });
    }  
}