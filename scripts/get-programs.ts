import axios from "axios";
import { mkdir, writeFile } from 'node:fs/promises';

const PROG_URL = "https://uwaterloocm.kuali.co/api/v1/catalog/programs/67e557ed6ed2fe2bd3a38956?q="
const PROG_DETAIL_URL = "https://uwaterloocm.kuali.co/api/v1/catalog/program/67e557ed6ed2fe2bd3a38956/"

export type Program = {
    code: string;
    __passedCatalogQuery: boolean;
    undergraduateCredentialType: {
        name: string;
        id: string;
    }
    dateStart: string;
    pid: string;
    id: string;
    title: string
    fieldOfStudy: {
        name: string;
        id: string;
        customFields: object;
    }
    catalogActivationDate: string;
    _score: Number;
}

let data: Program[] = []

try {
    const response = await axios.get<Program[]>(PROG_URL);
    data = response.data;
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

const majorData = data.filter(program => {
    return program.undergraduateCredentialType.name === 'Major';
})

async function saveProgramData(data: Program[]) {
    try {
        await mkdir('data', { recursive: true });
        await writeFile('data/programs.json', JSON.stringify(data, null, 4), { flag: 'w' });
        console.log("Write complete: data/programs.json");
    } catch (error: Error | unknown) {
        console.error(`Error writing to data/programs.json: ${error instanceof Error ? error.message : error}`);
    }
}

saveProgramData(majorData);