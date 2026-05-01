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
        handleSendMessage
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
