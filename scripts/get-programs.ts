import axios from "axios";
import fs from "fs";

const PROG_URL = "https://uwaterloocm.kuali.co/api/v1/catalog/programs/67e557ed6ed2fe2bd3a38956?q="

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

fs.writeFileSync("data/programs.json", JSON.stringify(majorData, null, 4));
console.log("Data exported to data/programs.json");