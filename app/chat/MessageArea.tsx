export type Message = {
    role: "user" | "assistant";
    content: string;
};

interface MessageAreaProps { messages: Message[] }

export default function MessageArea({ messages }: MessageAreaProps) {
    return (
        <div className="overflow-y-auto px-6 pt-8 pb-36 flex flex-col items-center">
            <div className="w-full max-w-[720px] flex flex-col gap-5">
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[90%]${msg.role === "user" ? " wc-bubble-user" : ""}`}
                            style={{
                                padding: '12px 16px',
                                borderRadius: msg.role === "user" ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                fontSize: '15px',
                                lineHeight: '1.6',
                                fontFamily: 'var(--font-sans)',
                                ...(msg.role !== "user"
                                    ? {
                                        background: 'var(--wc-elev-1)',
                                        color: 'var(--wc-fg)',
                                        border: '1px solid var(--wc-border)',
                                    }
                                    : {}
                                ),
                            }}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
