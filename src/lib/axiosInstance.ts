import axios from 'axios';

const $axios = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export default $axios;