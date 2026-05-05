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

        <div className="flex h-[100dvh] flex-col overflow-hidden" style={{ background: 'var(--wc-bg)', color: 'var(--wc-fg)' }}>
            <header className="h-14 px-6 shrink-0 flex items-center gap-3" style={{ borderBottom: '1px solid var(--wc-border)', background: 'var(--wc-bg)' }}>
                <HomeIcon/>
                <button
                    onClick={handleNewChat}
                    className="hidden sm:flex items-center gap-2 text-sm font-semibold cursor-pointer transition-all"
                    style={{
                        background: 'var(--wc-accent)',
                        color: 'var(--wc-fg-on-accent)',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '8px 14px',
                        fontFamily: 'var(--font-sans)',
                        transitionTimingFunction: 'var(--wc-ease-out)',
                        transitionDuration: '200ms',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--wc-accent-hover)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--wc-shadow-pop)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--wc-accent)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
                >
                    <Plus className="h-4 w-4" />
                    New Chat
                </button>
                <button
                    onClick={handleNewChat}
                    className="sm:hidden flex items-center justify-center cursor-pointer transition-all"
                    aria-label="New Chat"
                    style={{
                        background: 'var(--wc-accent)',
                        color: 'var(--wc-fg-on-accent)',
                        border: 'none',
                        borderRadius: '10px',
                        width: '36px',
                        height: '36px',
                        transitionTimingFunction: 'var(--wc-ease-out)',
                        transitionDuration: '200ms',
                    }}
                >
                    <Plus className="h-4 w-4" />
                </button>

                <div className="ml-auto flex items-center">
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

            <main className="flex-1 overflow-y-auto" style={{ background: 'var(--wc-bg)' }}>
                <MessageArea
                    messages={messages}
                />
            </main>

            <div className="shrink-0" style={{ background: 'var(--wc-bg)' }}>
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
