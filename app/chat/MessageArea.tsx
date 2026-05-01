export type Message = { 
    // conversationId: string;
    // messageId: string;
    role: "user" | "assistant"; 
    content: string; 
};

interface MessageAreaProps { messages: Message[] }

export default function MessageArea({
    messages
}: MessageAreaProps) {
    return (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 max-w-3xl mx-auto w-full">
            {messages.map((msg, i) => (
                <div key={i} className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-2 text-sm md:text-base ${
                        msg.role === "user" 
                        ? "bg-primary text-primary-foreground rounded-tr-sm" 
                        : "bg-muted text-foreground rounded-tl-sm"
                    }`}>
                        {msg.content}
                    </div>
                </div>
            ))}
        </div>
    )
}