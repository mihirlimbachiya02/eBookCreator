// 1. Keep BASE_URL as just the host (the server address)
export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const API_PATHS = {
    AUTH: {
        REGISTER: `${BASE_URL}/api/auth/register`,
        LOGIN: `${BASE_URL}/api/auth/login`,
        LOGOUT: `${BASE_URL}/api/auth/logout`,
        GET_PROFILE: `${BASE_URL}/api/auth/profile`,
        UPDATE_PROFILE: `${BASE_URL}/api/auth/profile`,
    },
    BOOKS: {
        CREATE_BOOK: `${BASE_URL}/api/books`,
        GET_BOOKS: `${BASE_URL}/api/books`,
        GET_BOOK_BY_ID: (id) => `${BASE_URL}/api/books/${id}`,
        UPDATE_BOOK: (id) => `${BASE_URL}/api/books/${id}`,
        DELETE_BOOK: (id) => `${BASE_URL}/api/books/${id}`,
        UPDATE_COVER: (id) => `${BASE_URL}/api/books/cover/${id}`,
        GET_CLOUDINARY_COVERS: `${BASE_URL}/api/books/cloudinary/covers`,
    },
    AI: {
        GENERATE_OUTLINE: `${BASE_URL}/api/ai/generate-outline`,
        GENERATE_CHAPTER_CONTENT: `${BASE_URL}/api/ai/generate-chapter-content`,
        GENERATE_TEXT: `${BASE_URL}/api/ai/generate`,
    },
    EXPORT: {
        PDF: (id) => `${BASE_URL}/api/export/${id}/pdf`,
        DOC: (id) => `${BASE_URL}/api/export/${id}/doc`,
    },
};
