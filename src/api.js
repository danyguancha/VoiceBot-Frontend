import axios from 'axios';

const api = axios.create({
    baseURL: 'https://voice-bot-back.onrender.com/docs#',
    headers: { 'Content-Type': 'application/json' },
});

export default api;