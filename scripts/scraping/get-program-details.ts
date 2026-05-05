import axios from "axios";
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from "node:fs";
import { exit } from "node:process";

import type { Program } from "./get-all-programs";

const PROG_DETAIL_URL = "https://uwaterloocm.kuali.co/api/v1/catalog/program/67e557ed6ed2fe2bd3a38956/"

export type ProgramDetail = {
    __passedCatalogQuery: boolean,
    _score: number,
    additionalConstraints: string,
    admissionRequirements?: string,
    catalogActivationDate: string,
    code: string,
    coOperativeRequirementsUndergraduate?: string,
    courseListsNew?: string,
    courseRequirementsNoUnits?: string,
    dateStart: string,
    declarationRequirements?: string,
    detailsAndNotes?: string,
    facultyCalendarDisplay: {
        name: string,
        id: string,
    },
    fieldOfStudy: {
        name: string,
        id: string,
        customFields: object,
    },
    graduationRequirements: string,
    id: string,
    minimumAverageSRequired: string,
    pid: string,
    requiredCoursesTermByTerm?: string,
    requirements?: string,
    specializations: string[],
    specializationDetails?: string,
    specializationsList?: string,
    systemsOfStudy?: {
        coOperative?: boolean,
        regular?: boolean,
    },
    title: string,
    undergraduateCredentialType: {
        name: string,
        id: string,
    },
}

async function saveProgramDetailData(data: ProgramDetail, pid: string) {
    try {
        const fileName = `data/programs/${pid}.json`
        await mkdir('data/programs', { recursive: true });
        await writeFile(fileName, JSON.stringify(data, null, 4), { flag: 'w' });
        console.log(`Write complete: ${fileName}`);
    } catch (error: Error | unknown) {
        console.error(`Error writing: ${error instanceof Error ? error.message : error}`);
    }
}

async function getAllProgramData() {
    try {
        const majorData = await readFile('data/programs.json', { encoding: 'utf-8', flag: 'r' });
        return JSON.parse(majorData);
    } catch (error) {
        return null;
    }
}

const majorData: Program[] | null = await getAllProgramData();

if (!majorData) {
    console.log("Run scripts/scraping/get-all-programs.ts first to load the current list of all courses.")
    exit(1);
}

for (let i = 0; i < majorData?.length; i++) {
    const pid = majorData[i].pid;
    const fileName = `data/programs/${pid}.json`;
    if (existsSync(fileName)) {
        console.log(`Skipping ${fileName}: file already exists`);
        continue;
    }
    let res_data: ProgramDetail;
    try {
        const response = await axios.get<ProgramDetail>(PROG_DETAIL_URL+pid);
        res_data = response.data;
        saveProgramDetailData(res_data, pid);
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