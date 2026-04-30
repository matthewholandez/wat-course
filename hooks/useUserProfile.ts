"use client";

import { useState, useEffect } from "react";

export default function useUserProfile() {
    // Setup
    const [isSetupComplete, setIsSetupComplete] = useState<boolean | null>(null);
    
    // Draft Program/Courses
    const [editProgram, setEditProgram] = useState<string>("");
    const [editCourses, setEditCourses] = useState<string[]>([]);

    // Active Program/Courses
    const [selectedProgram, setSelectedProgram] = useState<string>("");
    const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

    // Active Conversation ID
    const [currentConversationId, setCurrentConversationId] = useState<string>("");

    // Run On Start
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

    return {
        isSetupComplete, setIsSetupComplete,
        editProgram, setEditProgram,
        editCourses, setEditCourses,
        selectedProgram, setSelectedProgram,
        selectedCourses, setSelectedCourses,
        currentConversationId, setCurrentConversationId
    }
}