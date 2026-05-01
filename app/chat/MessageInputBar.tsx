import { Button } from "@/components/ui/button";

interface MessageInputBarProps {
    inputValue: string;
    setInputValue: (val: string) => void;
    handleSendMessage: () => void;
    isLoading: boolean;
}

export default function MessageInputBar({
    inputValue,
    setInputValue,
    handleSendMessage,
    isLoading
}: MessageInputBarProps) {

    return (
        <div className="p-4 border-t w-full max-w-3xl mx-auto">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask a question..."
                    disabled={isLoading}
                    className="flex-1 rounded-md border bg-background p-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                />
                <Button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()}>
                    {isLoading ? "Sending..." : "Send"}
                </Button>
            </div>
        </div>
    )
}