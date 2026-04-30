"use client";

import { useState, useEffect } from "react";

import { useTheme } from "next-themes";

import HomeIcon from "@/components/HomeIcon";
import SetupScreen from "./SetupScreen";
import SettingsDropdown from "./SettingsDropdown";
import SettingsDrawer from "./SettingsDrawer";
import MessageArea from "./MessageArea";
import MessageInputBar from "./MessageInputBar";

import type { Message } from "./MessageArea";

/**
 * Da Chat
 */
export function Chat() {
    const { theme, setTheme } = useTheme();
    const [isSetupComplete, setIsSetupComplete] = useState<boolean | null>(null);
    const [selectedProgram, setSelectedProgram] = useState<string>("");
    const [currentConversationId, setCurrentConversationId] = useState<string>("");
    const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
    
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // States for the edit sheet to handle unsaved changes
    const [editProgram, setEditProgram] = useState<string>("");
    const [editCourses, setEditCourses] = useState<string[]>([]);

    // Runs on component load (initial load / after refresh)
    useEffect(() => {
        // Check if user has already set up
        const savedProgram = localStorage.getItem("userProgram");
        const savedCourses = localStorage.getItem("userCourses");

        // We update state in a timeout to avoid cascading renders warning in React 18+ strict mode
        // Though it's standard to do this in useEffect for hydration mismatches on Next.js client components.
        setTimeout(() => {
            if (savedProgram && savedCourses) {
                setSelectedProgram(savedProgram);
                try {
                    setSelectedCourses(JSON.parse(savedCourses));
                } catch {
                    setSelectedCourses([]);
                }
                setIsSetupComplete(true);
                setCurrentConversationId(self.crypto.randomUUID());
            } else {
                setIsSetupComplete(false);
            }
        }, 0);
    }, []);

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
