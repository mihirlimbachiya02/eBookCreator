import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key:    process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
    secure:     true,
});

// ── Image upload helper (covers and profile pics) ─────────────────────────────
export const uploadToCloudinary = (buffer, options = {}) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(options, (error, result) => {
                if (error) return reject(error);
                resolve(result);
            })
            .end(buffer);
    });
};

// ── Raw file upload helper (uploaded books) ───────────────────────────────────
export const uploadRawToCloudinary = (buffer, options = {}) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(
                {
                    resource_type: "raw",
                    access_mode:   "public",
                    type:          "upload",
                    ...options,
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                },
            )
            .end(buffer);
    });
};

// ── Image upload middleware (covers, profile pics) ────────────────────────────
const IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp"];
const IMAGE_EXTS  = ["jpg", "jpeg", "png", "webp"];

export const uploadImageMiddleware = multer({
    storage: multer.memoryStorage(),
    limits:  { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const ext = file.originalname.split(".").pop().toLowerCase();
        if (!IMAGE_MIMES.includes(file.mimetype)) {
            return cb(new Error("Only JPG, PNG, and WebP images are allowed"), false);
        }
        if (!IMAGE_EXTS.includes(ext)) {
            return cb(new Error("File extension does not match image type"), false);
        }
        cb(null, true);
    },
});

// ── Raw book file upload middleware ───────────────────────────────────────────
const BOOK_MIMES = [
    "application/pdf",
    "application/epub+zip",
    "application/zip",
    "text/html",
    "application/x-mobipocket-ebook",
    "application/octet-stream", // fallback — some browsers send this for all files
];
const BOOK_EXTS = ["pdf", "epub", "zip", "html", "mobi"];

export const uploadRawBook = multer({
    storage: multer.memoryStorage(),
    limits:  { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => {
        const ext = file.originalname.split(".").pop().toLowerCase();

        // Extension is the primary check — MIME can be unreliable for books
        if (!BOOK_EXTS.includes(ext)) {
            return cb(new Error(`Format .${ext} not supported`), false);
        }

        // Secondary MIME check — allow octet-stream as fallback
        if (!BOOK_MIMES.includes(file.mimetype)) {
            return cb(new Error(`MIME type ${file.mimetype} not allowed`), false);
        }

        cb(null, true);
    },
});

export { cloudinary };
