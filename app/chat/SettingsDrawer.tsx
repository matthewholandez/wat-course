import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Settings, User, Moon, Sun } from "lucide-react";

interface SettingsDrawerProps {
    selectedProgram: string;
    setEditProgram: (program: string) => void;
    selectedCourses: string[];
    setEditCourses: (courses: string[]) => void;
    setIsSheetOpen: (isOpen: boolean) => void;
    theme: string | undefined;
    setTheme: (theme: string) => void;
}

export default function SettingsDrawer({
    selectedProgram,
    setEditProgram,
    selectedCourses,
    setEditCourses,
    setIsSheetOpen,
    theme,
    setTheme
}: SettingsDrawerProps) {

    const handleOpenSheet = () => {
        setEditProgram(selectedProgram);
        setEditCourses(selectedCourses);
        setIsSheetOpen(true);
    };

    return (
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
    )
}