// src/api/http.js
import axios from 'axios'

const http = axios.create({
    baseURL: '/api', // 由 Vite 代理轉發至後端
    headers: { 'Content-Type': 'application/json' }
})

export default http
