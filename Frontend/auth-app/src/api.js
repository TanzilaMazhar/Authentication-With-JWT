import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true,
});

// bas error ko throw karo
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
              window.dispatchEvent(new Event("logout"));
        }
        return Promise.reject(err);
    }
);

export default api;
