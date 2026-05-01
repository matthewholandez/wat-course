"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

// Components
import HomeIcon from "@/components/HomeIcon";
import SetupScreen from "./SetupScreen";
import SettingsDropdown from "./SettingsDropdown";
import SettingsDrawer from "./SettingsDrawer";
import MessageArea from "./MessageArea";
import MessageInputBar from "./MessageInputBar";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

// States
import useUserProfile from "@/hooks/useUserProfile";
import useChatEngine from "@/hooks/useChatEngine";

export function Chat() {
    const { theme, setTheme } = useTheme();
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const { isSetupComplete, setIsSetupComplete, 
        editProgram, setEditProgram, 
        editCourses, setEditCourses, 
        selectedProgram, setSelectedProgram, 
        selectedCourses, setSelectedCourses } = useUserProfile();
    
    const {
        messages,
        inputValue, setInputValue,
        isLoading, setIsLoading,
        handleSendMessage,
        handleNewChat
    } = useChatEngine();

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent Radix/Next-Themes hydration mismatch
    if (!mounted) {
        return null; // Or a loading skeleton matching the header
    }

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
        {/* --------- */}

        <div className="flex h-[100dvh] flex-col overflow-hidden">
            <header className="border-b p-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <HomeIcon/>
                    <Button variant="outline" size="sm" onClick={handleNewChat} className="ml-2 hidden sm:flex">
                        <Plus className="mr-2 h-4 w-4" />
                        New Chat
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleNewChat} className="ml-2 sm:hidden" aria-label="New Chat">
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <SettingsDropdown
                        selectedProgram={selectedProgram}
                        setEditProgram={setEditProgram}
                        selectedCourses={selectedCourses}
                        setEditCourses={setEditCourses}
                        setIsSheetOpen={setIsSheetOpen}
                        theme={theme}
                        setTheme={setTheme}
                    />
                </div>

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

            <main className="flex-1 overflow-y-auto">
                <MessageArea
                    messages={messages}
                />
            </main>

            <div className="shrink-0">
                <MessageInputBar
                    inputValue={inputValue}
                    setInputValue={setInputValue}
                    handleSendMessage={handleSendMessage}
                    isLoading={isLoading}
                />
            </div>
        </div>
        </>
    );
}
