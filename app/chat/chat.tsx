"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Settings, User, Moon, Sun } from "lucide-react";

import { useTheme } from "next-themes";
import Link from "next/link";
import Image from "next/image";

import SetupScreen from "./SetupScreen";
import UserProfileForm from "./UserProfileForm";

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

    type Message = { role: "user" | "assistant"; content: string; };
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // States for the edit sheet to handle unsaved changes
    const [editProgram, setEditProgram] = useState<string>("");
    const [editCourses, setEditCourses] = useState<string[]>([]);

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

    const handleOpenSheet = () => {
        setEditProgram(selectedProgram);
        setEditCourses(selectedCourses);
        setIsSheetOpen(true);
    };

    const handleSaveProfileChanges = () => {
        setSelectedProgram(editProgram);
        setSelectedCourses(editCourses);
        localStorage.setItem("userProgram", editProgram);
        localStorage.setItem("userCourses", JSON.stringify(editCourses));
        setIsSheetOpen(false);
    };

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

    if (isSetupComplete === null) {
        return null; // Or a loading spinner
    }

    if (!isSetupComplete) {
        return (
            <SetupScreen
                selectedProgram={selectedProgram}
                setSelectedProgram={setSelectedProgram}
                selectedCourses={selectedCourses}
                setSelectedCourses={setSelectedCourses}
                isSetupComplete={isSetupComplete}
                setIsSetupComplete={setIsSetupComplete}
            />
        );
    }

    return (
        <div className="flex h-screen flex-col">
            <header className="border-b p-4 flex items-center justify-between">
                <Link href="/" className="font-bold text-lg">
                    <Image src="/apple-icon.png" alt="Wat Course" width={32} height={32} className="rounded-md" />
                </Link>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Settings">
                            <Settings className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleOpenSheet}>
                            <User className="mr-2 h-4 w-4" />
                            <span>Edit Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                            {theme === "dark" ? (
                                <Sun className="mr-2 h-4 w-4" />
                            ) : (
                                <Moon className="mr-2 h-4 w-4" />
                            )}
                            <span>Toggle Appearance</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Drawer open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <DrawerContent className="flex flex-col max-h-[85vh]">
                        <div className="w-full max-w-4xl mx-auto flex flex-col h-full">
                            <DrawerHeader>
                                <DrawerTitle>Your Profile</DrawerTitle>
                                <DrawerDescription>
                                    Update your program and courses so the Goose can tailor advice to your situation.
                                </DrawerDescription>
                            </DrawerHeader>
                            <div className="py-6 px-4 flex-1 overflow-y-auto">
                                <UserProfileForm
                                    selectedProgram={editProgram}
                                    setSelectedProgram={setEditProgram}
                                    selectedCourses={editCourses}
                                    setSelectedCourses={setEditCourses}
                                />
                            </div>
                            <DrawerFooter>
                                <DrawerClose asChild>
                                    <Button onClick={handleSaveProfileChanges} disabled={!editProgram}>
                                        Save changes
                                    </Button>
                                </DrawerClose>
                            </DrawerFooter>
                        </div>
                    </DrawerContent>
                </Drawer>
            </header>

            <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 max-w-3xl mx-auto w-full">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-2 text-sm md:text-base ${
                            msg.role === "user" 
                            ? "bg-primary text-primary-foreground rounded-tr-sm" 
                            : "bg-muted text-foreground rounded-tl-sm"
                        }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
            </main>
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
        </div>
    );
}
