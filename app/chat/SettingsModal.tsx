"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { ChevronDown, Monitor, Moon, Sun, X } from "lucide-react";
import programsData from "@/data/programs.json";
import coursesData from "@/data/courses.json";

interface SettingsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedProgram: string;
    setSelectedProgram: (program: string) => void;
    selectedCourses: string[];
    setSelectedCourses: (courses: string[]) => void;
    theme: string | undefined;
    setTheme: (theme: string) => void;
}

type Course = { id: string; __catalogCourseId: string; title: string };

export default function SettingsModal({
    open,
    onOpenChange,
    selectedProgram,
    setSelectedProgram,
    selectedCourses,
    setSelectedCourses,
    theme,
    setTheme,
}: SettingsModalProps) {
    const [draftProgram, setDraftProgram] = useState(selectedProgram);
    const [draftCourses, setDraftCourses] = useState<string[]>(selectedCourses);
    const [draftTheme, setDraftTheme] = useState<string>(theme ?? "system");
    const [addCodeInput, setAddCodeInput] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (open) {
            setDraftProgram(selectedProgram);
            setDraftCourses(selectedCourses);
            setDraftTheme(theme ?? "system");
            setAddCodeInput("");
            setHighlightedIndex(0);
        }
    }, [open, selectedProgram, selectedCourses, theme]);

    const courseById = useMemo(() => {
        const m = new Map<string, Course>();
        (coursesData as Course[]).forEach((c) => m.set(c.id, c));
        return m;
    }, []);

    const matches = useMemo<Course[]>(() => {
        const q = addCodeInput.trim().replace(/\s+/g, "").toUpperCase();
        if (!q) return [];
        const all = coursesData as Course[];
        const seen = new Set(draftCourses);
        return all
            .filter((c) => !seen.has(c.id))
            .filter((c) => c.__catalogCourseId.toUpperCase().startsWith(q))
            .slice(0, 5);
    }, [addCodeInput, draftCourses]);

    useEffect(() => {
        if (highlightedIndex >= matches.length) setHighlightedIndex(0);
    }, [matches.length, highlightedIndex]);

    const formatCode = (catalogId: string) => {
        const m = catalogId.match(/^([A-Z]+)(\d+.*)$/i);
        return m ? `${m[1]} ${m[2]}` : catalogId;
    };

    const highlightMatch = (catalogId: string) => {
        const q = addCodeInput.trim().replace(/\s+/g, "");
        if (!q) return formatCode(catalogId);
        const display = formatCode(catalogId);
        const compact = display.replace(/\s+/g, "");
        const idxCompact = compact.toUpperCase().indexOf(q.toUpperCase());
        if (idxCompact !== 0) return display;
        let consumed = 0;
        let cut = 0;
        for (let i = 0; i < display.length && consumed < q.length; i++) {
            if (display[i] !== " ") consumed++;
            cut = i + 1;
        }
        return (
            <>
                <mark>{display.slice(0, cut)}</mark>
                {display.slice(cut)}
            </>
        );
    };

    const addCourse = (course: Course) => {
        if (draftCourses.includes(course.id)) return;
        setDraftCourses([...draftCourses, course.id]);
        setAddCodeInput("");
        setHighlightedIndex(0);
        inputRef.current?.focus();
    };

    const removeCourse = (id: string) => {
        setDraftCourses(draftCourses.filter((c) => c !== id));
    };

    const handleSave = () => {
        setSelectedProgram(draftProgram);
        setSelectedCourses(draftCourses);
        setTheme(draftTheme);
        localStorage.setItem("userProgram", draftProgram);
        localStorage.setItem("userCourses", JSON.stringify(draftCourses));
        onOpenChange(false);
    };

    return (
        <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="settings-modal-overlay" />
                <DialogPrimitive.Content className="settings-modal" aria-describedby={undefined}>
                    <div className="settings-modal-header">
                        <DialogPrimitive.Title className="settings-modal-title">Settings</DialogPrimitive.Title>
                        <DialogPrimitive.Close asChild>
                            <button className="settings-modal-close" aria-label="Close">
                                <X size={18} />
                            </button>
                        </DialogPrimitive.Close>
                    </div>

                    <div className="settings-modal-body">
                        <div className="settings-section">
                            <label className="field-label" htmlFor="settings-program">Program</label>
                            <div className="select-wrap">
                                <select
                                    id="settings-program"
                                    value={draftProgram}
                                    onChange={(e) => setDraftProgram(e.target.value)}
                                >
                                    {!draftProgram && <option value="">Select a program…</option>}
                                    {programsData.map((p) => (
                                        <option key={p.id} value={p.id}>{p.title}</option>
                                    ))}
                                </select>
                                <span className="select-chevron"><ChevronDown size={16} /></span>
                            </div>
                        </div>

                        <div className="settings-section">
                            <label className="field-label">Courses taken</label>
                            <span className="field-hint">Add courses you&apos;ve completed or are enrolled in.</span>
                            <div className="course-chips">
                                {draftCourses.map((id) => {
                                    const c = courseById.get(id);
                                    const label = c ? formatCode(c.__catalogCourseId) : id;
                                    return (
                                        <span key={id} className="course-chip">
                                            {label}
                                            <button
                                                className="course-chip-remove"
                                                onClick={() => removeCourse(id)}
                                                aria-label={`Remove ${label}`}
                                            >
                                                <X size={12} />
                                            </button>
                                        </span>
                                    );
                                })}
                                <div className="course-input-wrap">
                                    <input
                                        ref={inputRef}
                                        className="add-course-input"
                                        placeholder="+ Add code"
                                        value={addCodeInput}
                                        onChange={(e) => {
                                            setAddCodeInput(e.target.value);
                                            setHighlightedIndex(0);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "ArrowDown") {
                                                e.preventDefault();
                                                setHighlightedIndex((i) => Math.min(i + 1, matches.length - 1));
                                            } else if (e.key === "ArrowUp") {
                                                e.preventDefault();
                                                setHighlightedIndex((i) => Math.max(i - 1, 0));
                                            } else if (e.key === "Enter" && matches[highlightedIndex]) {
                                                e.preventDefault();
                                                addCourse(matches[highlightedIndex]);
                                            } else if (e.key === "Escape" && addCodeInput) {
                                                e.preventDefault();
                                                setAddCodeInput("");
                                            }
                                        }}
                                    />
                                    {matches.length > 0 && (
                                        <div className="autocomplete-list" role="listbox">
                                            {matches.map((c, i) => (
                                                <div
                                                    key={c.id}
                                                    role="option"
                                                    aria-selected={i === highlightedIndex}
                                                    className={`autocomplete-item${i === highlightedIndex ? " highlighted" : ""}`}
                                                    onMouseEnter={() => setHighlightedIndex(i)}
                                                    onMouseDown={(e) => { e.preventDefault(); addCourse(c); }}
                                                >
                                                    <span className="ac-code">{highlightMatch(c.__catalogCourseId)}</span>
                                                    <span className="ac-name">{c.title}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="settings-section">
                            <label className="field-label">Theme</label>
                            <div className="theme-toggle" role="radiogroup">
                                {[
                                    { v: "light", icon: <Sun size={16} />, label: "Light" },
                                    { v: "dark", icon: <Moon size={16} />, label: "Dark" },
                                    { v: "system", icon: <Monitor size={16} />, label: "System" },
                                ].map((opt) => (
                                    <button
                                        key={opt.v}
                                        role="radio"
                                        aria-checked={draftTheme === opt.v}
                                        className={`theme-option${draftTheme === opt.v ? " active" : ""}`}
                                        onClick={() => setDraftTheme(opt.v)}
                                        type="button"
                                    >
                                        {opt.icon} {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="settings-modal-footer">
                        <DialogPrimitive.Close asChild>
                            <button className="wc-btn wc-btn-secondary" type="button">Cancel</button>
                        </DialogPrimitive.Close>
                        <button
                            className="wc-btn wc-btn-primary"
                            type="button"
                            onClick={handleSave}
                            disabled={!draftProgram}
                        >
                            Save
                        </button>
                    </div>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}
