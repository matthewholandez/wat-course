import { v4 as uuidv4 } from 'uuid';

export type CreateIdResponse = {
    conversationId: string;
}

export async function GET() {
    try {
        const newId = uuidv4();
        return Response.json({ conversationId: newId });
    } catch (error: any) {
        return Response.json(error.message || "Internal server error", { status: 500 });
    }  
}