"use client";

import { useState, useEffect } from "react";
import type { Message } from "@/app/chat/MessageArea";

export default function useChatEngine() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [currentConversationId, setCurrentConversationId] = useState("");

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;
        
        const userMessage = inputValue;
        setInputValue("");
        setIsLoading(true);
        
        // Optimistically add user message
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage, conversationId: currentConversationId }),
            });

            if (!response.ok || !response.body) {
                throw new Error("Failed to send message");
            }

            // Add an empty assistant message that we will stream into
            setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let assistantMessage = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                // Since our backend now returns plain text chunks via the OpenAI SDK,
                // we can just append the decoded text directly.
                assistantMessage += decoder.decode(value, { stream: true });
                setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].content = assistantMessage;
                    return newMessages;
                });
            }
        } catch (error) {
            console.error(error);
            setMessages((prev) => [...prev, { role: "assistant", content: "HONK! I encountered an error. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Run once
    useEffect(() => {
        const savedConversationId = localStorage.getItem("conversationId");
        if (savedConversationId) {
            fetch('/api/chat/validate') //how
        }
    })

    return {
        messages,
        inputValue, setInputValue,
        isLoading, setIsLoading,
        handleSendMessage
    };
}