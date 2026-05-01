"use client";

import { useState, useEffect } from "react";
import type { Message } from "@/app/chat/MessageArea";
import type { CreateIdResponse } from "@/app/api/chat/createId/route";

/**
 * A request containing a user message to be sent to the API.
 */
type MessageRequest = {
    conversationId: string,
    content: string,
};

export default function useChatEngine() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [currentConversationId, setCurrentConversationId] = useState("");

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;
        
        const userMessage = inputValue;
        const uMsg: MessageRequest = {
            conversationId: "lol",
            content: "lol"
        }
        setInputValue("");
        setIsLoading(true);
        
        // Optimistically add user message
        // TODO: Type this as well
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage }),
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

    // Run once - on start
    useEffect(() => {
        const savedConversationId: string | null = localStorage.getItem("conversationId");

        const handleIdCheck = async (id: string | null) => {
            let validId: string;
            if (id) {
                const response = await fetch('api/chat/validateId', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: id }),
                });

                if (!response.ok || !response.body) {
                    throw new Error("Failed to verify conversationId via API");
                }

                const data = await response.json()
                console.log(data)
                validId = data.conversationId;
            } else {
                const response = await fetch('api/chat/createId', {
                    method: 'GET',
                });

                if (!response.ok || !response.body) {
                    throw new Error("Failed to create conversationId via API");
                }

                const data: CreateIdResponse = await response.json();
                validId = data.id;
            }
            setTimeout(() => {
                setCurrentConversationId(validId);
                localStorage.setItem("conversationId", validId);
            }, 0)
        }

        handleIdCheck(savedConversationId);
    }, [])

    return {
        messages,
        inputValue, setInputValue,
        isLoading, setIsLoading,
        handleSendMessage
    };
}