import axiosInstance from "./axiosInstance";

export const fetchUploadedBooks = () =>
    axiosInstance.get("/api/uploaded-books");

export const uploadBook = (form) =>
    axiosInstance.post("/api/uploaded-books/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
    });

export const importFromUrl = (data) =>
    axiosInstance.post("/api/uploaded-books/import-url", data);

export const importFromDrive = (data) =>
    axiosInstance.post("/api/uploaded-books/import-drive", data);

export const updateUploadedBook = (id, form) =>
    axiosInstance.put(`/api/uploaded-books/${id}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
    });

export const deleteUploadedBook = (id) =>
    axiosInstance.delete(`/api/uploaded-books/${id}`);
