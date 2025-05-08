import axios from 'axios';
import https from 'https';

// Create HTTPS agent that accepts self-signed certificates
const agent = new https.Agent({
    rejectUnauthorized: false
});

// Create an Axios instance using your VITE_BACKEND_URL
const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    httpsAgent: agent
});

export default api;
