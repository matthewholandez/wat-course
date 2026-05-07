import axios from "axios";
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from "node:fs";
import { exit } from "node:process";

import type { Course } from "./get-all-courses";

const COURSE_DETAIL_URL = "https://uwaterloocm.kuali.co/api/v1/catalog/course/67e557ed6ed2fe2bd3a38956/"

export type CourseDetail = {
    __catalogCourseId: string,
    __passedCatalogQuery: boolean,
    _score: Number,
    allowMultipleEnrollInATerm?: string,
    antirequisites?: string,
    catalogActivationDate: string,
    corequisites?: string,
    courseLevel: {
        id: string,
        name: string,
    },
    credits: {
        credits: {
            min: string,
            max: string,
        },
        chosen: string,
        value: string,
    },
    crossListedCourses?: {
        __catalogCourseId?: string,
        pid?: string,
        title?: string,
    }[],
    dateStart: string,
    description: string,
    feeStatement?: {
        id?: string,
        name?: string,
    }[],
    id: string,
    notes?: string,
    pid: string,
    prerequisites?: string,
    specialConsentRequiredToAdd?: string,
    specialConsentRequiredToDrop?: string,
    specialGradingBasis?: {
        id?: string,
        name?: string,
    },
    subjectCode: {
        description: string,
        id: string,
        name: string,
    },
    title: string,
    totalCompletionsAllowed?: {
        id?: string,
        name?: string,
    },
}

async function saveCourseDetailData(data: CourseDetail, pid: string) {
    try {
        const fileName = `data/courses/${pid}.json`
        await mkdir('data/courses', { recursive: true });
        await writeFile(fileName, JSON.stringify(data, null, 4), { flag: 'w' });
        console.log(`Write complete: ${fileName}`);
    } catch (error: Error | unknown) {
        console.error(`Error writing: ${error instanceof Error ? error.message : error}`);
    }
}

async function getAllCourseData() {
    try {
        const courseData = await readFile('data/courses.json', { encoding: 'utf-8', flag: 'r' });
        return JSON.parse(courseData);
    } catch (error) {
        return null;
    }
}

const courseData: Course[] | null = await getAllCourseData();

if (!courseData) {
    console.log("Run scripts/scraping/get-all-courses.ts first to load the current list of all courses.")
    exit(1);
}

for (let i = 0; i < courseData?.length; i++) {
    const pid = courseData[i].pid;
    const fileName = `data/courses/${pid}.json`;
    if (existsSync(fileName)) {
        console.log(`Skipping ${fileName}: file already exists`);
        continue;
    }
    let res_data: CourseDetail;
    try {
        const response = await axios.get<CourseDetail>(COURSE_DETAIL_URL+pid);
        res_data = response.data;
        saveCourseDetailData(res_data, pid);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response) {
                console.log(`Status: ${error.response.status}`);
                console.log(`Message: ${error.response.data}`);
            } else if (error.request) {
                console.log(`No response: ${error.request}`)
            } else {
                console.log(`Error in setting up the request: ${error.message}`)
            }
        } else {
            console.error("A non-axios error occurred when running the script.");
        }
    }
    await new Promise(res => setTimeout(res, 1500))
}