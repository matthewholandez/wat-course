import RedisSingleton from "@/lib/redis";
import { v4 as uuidv4 } from 'uuid';

export type ValidateIdResponse = {
    exists: boolean,
    conversationId: string
}

export async function POST(req: Request) {
    try {
        const { id } = await req.json();
        if (!id) {
            return Response.json({ error: "Missing id" }, { status: 400 });
        }
        const redis = await RedisSingleton.getInstance();
        const exists = await redis.exists(`messages:${id}`)
        if (exists) {
            return Response.json({
                exists: true,
                conversationId: id
            })
        } else {
            const newId = uuidv4();
            return Response.json({
                exists: false,
                conversationId: newId
            })
        }
    } catch (error: any) {
        return Response.json(error.message || "Internal server error", { status: 500 });
    }  
}