"use client";

import { useState } from "react";
import { useTheme } from "next-themes";

// Components
import HomeIcon from "@/components/HomeIcon";
import SetupScreen from "./SetupScreen";
import SettingsDropdown from "./SettingsDropdown";
import SettingsDrawer from "./SettingsDrawer";
import MessageArea from "./MessageArea";
import MessageInputBar from "./MessageInputBar";

// States
import useUserProfile from "@/hooks/useUserProfile";

// Types
import type { Message } from "./MessageArea";

export function Chat() {
    const { theme, setTheme } = useTheme();
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const { isSetupComplete, setIsSetupComplete, 
        editProgram, setEditProgram, 
        editCourses, setEditCourses, 
        selectedProgram, setSelectedProgram, 
        selectedCourses, setSelectedCourses, 
        currentConversationId, setCurrentConversationId } = useUserProfile();
    
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;
        
        const userMessage = inputValue;
        setInputValue("");
        setIsLoading(true);
        
        // Optimistically add user message
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

        try {
            console.log(currentConversationId)
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

    return (
        <>
        {/* This only runs if isSetupComplete is false */}
        <SetupScreen
            selectedProgram={selectedProgram}
            setSelectedProgram={setSelectedProgram}
            selectedCourses={selectedCourses}
            setSelectedCourses={setSelectedCourses}
            isSetupComplete={isSetupComplete}
            setIsSetupComplete={setIsSetupComplete}
        />

        <div className="flex h-screen flex-col">
            <header className="border-b p-4 flex items-center justify-between">
                <HomeIcon/>

                <SettingsDropdown
                    selectedProgram={selectedProgram}
                    setEditProgram={setEditProgram}
                    selectedCourses={selectedCourses}
                    setEditCourses={setEditCourses}
                    setIsSheetOpen={setIsSheetOpen}
                    theme={theme}
                    setTheme={setTheme}
                />

                <SettingsDrawer
                    isSheetOpen={isSheetOpen}
                    setIsSheetOpen={setIsSheetOpen}
                    editProgram={editProgram}
                    setEditProgram={setEditProgram}
                    editCourses={editCourses}
                    setEditCourses={setEditCourses}
                    setSelectedProgram={setSelectedProgram}
                    setSelectedCourses={setSelectedCourses}
                />
            </header>

            <main>
                <MessageArea
                    messages={messages}
                />
            </main>

            <MessageInputBar
                inputValue={inputValue}
                setInputValue={setInputValue}
                handleSendMessage={handleSendMessage}
                isLoading={isLoading}
            />
        </div>
        </>
    );
}
