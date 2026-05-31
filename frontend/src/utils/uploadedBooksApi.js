import axios from "axios";

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL });

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const fetchUploadedBooks = () => API.get("/api/uploaded-books");
export const uploadBook = (form) =>
    API.post("/api/uploaded-books/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
    });
export const importFromUrl = (data) =>
    API.post("/api/uploaded-books/import-url", data);
export const importFromDrive = (data) =>
    API.post("/api/uploaded-books/import-drive", data);
export const updateUploadedBook = (id, form) =>
    API.put(`/api/uploaded-books/${id}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
    });
export const deleteUploadedBook = (id) =>
    API.delete(`/api/uploaded-books/${id}`);
