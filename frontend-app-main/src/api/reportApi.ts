import axios from 'axios';
import { REPORTS_API_BASE_URL } from './reportConfig';

const reportsApi = axios.create({
    baseURL: REPORTS_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default reportsApi; 