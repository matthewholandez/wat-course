"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserProfileForm } from "./user-profile-form";
import { Settings, User, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import Image from "next/image";

export function Chat() {
    const { theme, setTheme } = useTheme();
    const [isSetupComplete, setIsSetupComplete] = useState<boolean | null>(null);
    const [selectedProgram, setSelectedProgram] = useState<string>("");
    const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
    
    const [isSheetOpen, setIsSheetOpen] = useState(false);

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
            } else {
                setIsSetupComplete(false);
            }
        }, 0);
    }, []);

    const handleCompleteSetup = () => {
        if (selectedProgram) {
            localStorage.setItem("userProgram", selectedProgram);
            localStorage.setItem("userCourses", JSON.stringify(selectedCourses));
            setIsSetupComplete(true);
        }
    };

    const handleOpenSheet = () => {
        // Populate the sheet with current saved state
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

    if (isSetupComplete === null) {
        return null; // Or a loading spinner
    }

    if (!isSetupComplete) {
        return (
            <div className="flex h-screen w-full items-center justify-center p-4">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle>Welcome! Let&apos;s get you set up.</CardTitle>
                        <CardDescription>
                            Please tell us about your program and the courses you&apos;ve taken to personalize your experience.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <UserProfileForm
                            selectedProgram={selectedProgram}
                            setSelectedProgram={setSelectedProgram}
                            selectedCourses={selectedCourses}
                            setSelectedCourses={setSelectedCourses}
                        />
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full"
                            onClick={handleCompleteSetup}
                            disabled={!selectedProgram}
                        >
                            Continue to Chat
                        </Button>
                    </CardFooter>
                </Card>
            </div>
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

                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetContent className="flex flex-col">
                        <SheetHeader>
                            <SheetTitle>Your Profile</SheetTitle>
                            <SheetDescription>
                                Update your program and courses so we can give you better advice.
                            </SheetDescription>
                        </SheetHeader>
                        <div className="py-6 flex-1 overflow-y-auto">
                            <UserProfileForm
                                selectedProgram={editProgram}
                                setSelectedProgram={setEditProgram}
                                selectedCourses={editCourses}
                                setSelectedCourses={setEditCourses}
                            />
                        </div>
                        <SheetFooter>
                            <SheetClose asChild>
                                <Button onClick={handleSaveProfileChanges} disabled={!editProgram}>
                                    Save changes
                                </Button>
                            </SheetClose>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            </header>

            <main className="flex-1 overflow-auto p-4 flex flex-col items-center justify-center">
                <p className="text-muted-foreground">Chat interface will go here.</p>
            </main>
            <div className="p-4 border-t w-full max-w-3xl mx-auto">
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Ask a question..."
                        className="flex-1 rounded-md border p-2"
                        disabled
                    />
                    <Button disabled>Send</Button>
                </div>
            </div>
        </div>
    );
}
