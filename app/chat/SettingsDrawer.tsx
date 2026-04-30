import UserProfileForm from "./UserProfileForm";

import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

interface SettingsDrawerProps {
    isSheetOpen: boolean;
    setIsSheetOpen: (isOpen: boolean) => void;
    editProgram: string;
    setEditProgram: (program: string) => void;
    editCourses: string[];
    setEditCourses: (courses: string[]) => void;
    setSelectedProgram: (program: string) => void;
    setSelectedCourses: (courses: string[]) => void;
}

export default function SettingsDrawer({
    isSheetOpen,
    setIsSheetOpen,
    editProgram,
    setEditProgram,
    editCourses,
    setEditCourses,
    setSelectedProgram,
    setSelectedCourses
}: SettingsDrawerProps) {
    const handleSaveProfileChanges = () => {
        setSelectedProgram(editProgram);
        setSelectedCourses(editCourses);
        localStorage.setItem("userProgram", editProgram);
        localStorage.setItem("userCourses", JSON.stringify(editCourses));
        setIsSheetOpen(false);
    };
    return (
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
    )
}