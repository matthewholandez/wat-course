import axios from "axios";

const COURSES_URL = "https://uwaterloocm.kuali.co/api/v1/catalog/courses/67e557ed6ed2fe2bd3a38956?q=";

export type Course = {
    __catalogCourseId: string;
    __passedCatalogQuery: boolean;
    courseLevel: {
        name: string;
        id: string;
    }
    dateStart: string;
    pid: string;
    id: string;
    title: string;
    subjectCode: {
        name: string;
        description: string;
        id: string;
    }
    catalogActivationDate: string;
    _score: Number;
}

let data: Course[] = []

try {
    const response = await axios.get<Course[]>(COURSES_URL);
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

console.log(data);