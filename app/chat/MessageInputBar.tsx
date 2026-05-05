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
    isLoading,
}: MessageInputBarProps) {
    return (
        <div className="px-6 pb-6 pt-4 flex justify-center" style={{ background: 'linear-gradient(to top, var(--wc-bg) 60%, transparent)' }}>
            <div
                className="w-full max-w-[720px] flex items-center gap-[10px] transition-[border-color,box-shadow]"
                style={{
                    background: 'var(--wc-elev-1)',
                    border: '1px solid var(--wc-border)',
                    borderRadius: '22px',
                    padding: '6px 6px 6px 18px',
                    boxShadow: 'var(--wc-shadow-md)',
                    transitionDuration: '200ms',
                    transitionTimingFunction: 'var(--wc-ease-out)',
                }}
                onFocusCapture={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = 'var(--wc-accent)';
                    el.style.boxShadow = `var(--wc-shadow-md), 0 0 0 3px var(--wc-accent-ring)`;
                }}
                onBlurCapture={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = 'var(--wc-border)';
                    el.style.boxShadow = 'var(--wc-shadow-md)';
                }}
            >
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                    placeholder="Ask a question..."
                    disabled={isLoading}
                    className="flex-1 border-0 bg-transparent outline-none disabled:opacity-50"
                    style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '15px',
                        color: 'var(--wc-fg)',
                        padding: '12px 0',
                    }}
                />
                <button
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputValue.trim()}
                    className="flex items-center justify-center shrink-0 transition-all cursor-pointer disabled:cursor-not-allowed"
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '999px',
                        border: 'none',
                        background: isLoading || !inputValue.trim() ? 'var(--wc-sunken)' : 'var(--wc-accent)',
                        color: isLoading || !inputValue.trim() ? 'var(--wc-fg-subtle)' : 'var(--wc-fg-on-accent)',
                        fontSize: '18px',
                        fontWeight: 700,
                        transitionDuration: '200ms',
                        transitionTimingFunction: 'var(--wc-ease-out)',
                    }}
                    onMouseEnter={e => {
                        if (!isLoading && inputValue.trim()) {
                            (e.currentTarget as HTMLElement).style.background = 'var(--wc-accent-hover)';
                            (e.currentTarget as HTMLElement).style.boxShadow = 'var(--wc-shadow-pop)';
                        }
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = isLoading || !inputValue.trim() ? 'var(--wc-sunken)' : 'var(--wc-accent)';
                        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                    }}
                >
                    ↑
                </button>
            </div>
        </div>
    );
}
