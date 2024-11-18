import axios from 'axios';

const api = axios.create({
    //baseURL: 'https://voice-bot-back.onrender.com/',
    baseURL: 'http://localhost:8000/',
    headers: { 'Content-Type': 'application/json' },
});

export default api;