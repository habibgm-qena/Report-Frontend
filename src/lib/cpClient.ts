import axios, { AxiosRequestConfig } from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || '';

export const cpClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const cpClientRequest = (config: AxiosRequestConfig) => cpClient(config); 