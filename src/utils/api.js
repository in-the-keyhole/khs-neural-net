import axios from 'axios'


const URL = window.location.hostname.includes('localhost')
    ? `http://${window.location.hostname}:8000/api/`
    : `https://${window.location.hostname}/api/`;

const instance = axios.create({
    baseURL: URL,
    headers: {'Content-Type': 'application/json'},
    withCredentials: false
});

export default instance
