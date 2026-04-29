"use client";

import { useState } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import programsData from "@/data/programs.json";
import coursesData from "@/data/courses.json";

interface UserProfileFormProps {
    selectedProgram: string;
    setSelectedProgram: (program: string) => void;
    selectedCourses: string[];
    setSelectedCourses: (courses: string[]) => void;
}

export function UserProfileForm({
    selectedProgram,
    setSelectedProgram,
    selectedCourses,
    setSelectedCourses,
}: UserProfileFormProps) {
    const [programOpen, setProgramOpen] = useState(false);
    const [courseOpen, setCourseOpen] = useState(false);

    const handleRemoveCourse = (courseId: string) => {
        setSelectedCourses(selectedCourses.filter((id) => id !== courseId));
    };

    return (
        <div className="space-y-6 w-full">
            <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Your Program</label>
                <Popover open={programOpen} onOpenChange={setProgramOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={programOpen}
                            className="w-full justify-between h-auto py-2"
                        >
                            <span className="text-left font-normal whitespace-normal block">
                                {selectedProgram
                                    ? programsData.find((program) => program.id === selectedProgram)?.title
                                    : "Select a program..."}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                            <CommandInput placeholder="Search program..." />
                            <CommandList>
                                <CommandEmpty>No program found.</CommandEmpty>
                                <CommandGroup>
                                    {programsData.map((program) => (
                                        <CommandItem
                                            key={program.id}
                                            value={program.title}
                                            onSelect={() => {
                                                setSelectedProgram(program.id);
                                                setProgramOpen(false);
                                            }}
                                            className="whitespace-normal break-words py-2 flex items-start"
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4 shrink-0 mt-1",
                                                    selectedProgram === program.id ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <span className="flex-1">{program.title}</span>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Courses Taken</label>
                <Popover open={courseOpen} onOpenChange={setCourseOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={courseOpen}
                            className="w-full justify-between"
                        >
                            Select courses...
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                            <CommandInput placeholder="Search course..." />
                            <CommandList>
                                <CommandEmpty>No course found.</CommandEmpty>
                                <CommandGroup>
                                    {coursesData
                                        .filter((course) => !selectedCourses.includes(course.id))
                                        .map((course) => (
                                            <CommandItem
                                                key={course.id}
                                                value={course.__catalogCourseId + " " + course.title}
                                                onSelect={() => {
                                                    setSelectedCourses([...selectedCourses, course.id]);
                                                    setCourseOpen(false);
                                                }}
                                                className="whitespace-normal break-words py-2 flex items-start"
                                            >
                                                <Check className="mr-2 h-4 w-4 opacity-0 shrink-0 mt-1" />
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">{course.__catalogCourseId}</span>
                                                    <span className="text-sm text-muted-foreground">{course.title}</span>
                                                </div>
                                            </CommandItem>
                                        ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>

                {selectedCourses.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {selectedCourses.map((courseId) => {
                            const course = coursesData.find((c) => c.id === courseId);
                            if (!course) return null;
                            return (
                                <Badge key={courseId} variant="secondary" className="px-2 py-1">
                                    {course.__catalogCourseId}
                                    <button
                                        className="ml-2 hover:bg-muted rounded-full focus:outline-none"
                                        onClick={() => handleRemoveCourse(courseId)}
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
