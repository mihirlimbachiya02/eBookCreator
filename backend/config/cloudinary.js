import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
    secure: true,
});

// Image upload helper (used for covers and profile pics)
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

// Raw file upload helper (used for uploaded books)
export const uploadRawToCloudinary = (buffer, options = {}) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(
                {
                    resource_type: "raw",
                    access_mode: "public",
                    type: "upload",
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

// Image upload middleware (covers, profile pics)
export const uploadImageMiddleware = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp"];
        if (!allowed.includes(file.mimetype)) {
            return cb(
                new Error("Only JPG, PNG, and WebP images are allowed"),
                false,
            );
        }
        cb(null, true);
    },
});

// Raw book file upload middleware
export const uploadRawBook = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = [
            "application/pdf",
            "application/epub+zip",
            "application/zip",
            "text/html",
            "application/x-mobipocket-ebook",
        ];
        const ext = file.originalname.split(".").pop().toLowerCase();
        const allowedExts = ["pdf", "epub", "zip", "html", "mobi"];
        if (!allowedExts.includes(ext)) {
            return cb(new Error(`Format .${ext} not supported`), false);
        }
        cb(null, true);
    },
});

export { cloudinary };
