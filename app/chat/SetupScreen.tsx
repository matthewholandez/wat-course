import UserProfileForm from "./UserProfileForm";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SetupScreenProps {
    selectedProgram: string;
    setSelectedProgram: (program: string) => void;
    selectedCourses: string[];
    setSelectedCourses: (courses: string[]) => void;
    isSetupComplete: boolean;
    setIsSetupComplete: (isComplete: boolean) => void;
}

export default function SetupScreen({
    selectedProgram,
    setSelectedProgram,
    selectedCourses,
    setSelectedCourses,
    isSetupComplete,
    setIsSetupComplete
}: SetupScreenProps) {

    const handleCompleteSetup = () => {
        if (selectedProgram) {
            localStorage.setItem("userProgram", selectedProgram);
            localStorage.setItem("userCourses", JSON.stringify(selectedCourses));
            setIsSetupComplete(true);
        }
    };

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