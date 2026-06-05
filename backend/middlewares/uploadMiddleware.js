import multer from "multer";

// ── Allowed MIME types and extensions must both match ─────────────────────────
// Prevents: file.exe renamed to file.jpg bypassing MIME check
// Prevents: file with image MIME but non-image extension

const IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp"];
const IMAGE_EXTS  = ["jpg", "jpeg", "png", "webp"];

const imageFileFilter = (req, file, cb) => {
    const ext = file.originalname.split(".").pop().toLowerCase();

    if (!IMAGE_MIMES.includes(file.mimetype)) {
        return cb(new Error("Only JPG, PNG, and WebP images are allowed"), false);
    }
    if (!IMAGE_EXTS.includes(ext)) {
        return cb(new Error("File extension does not match image type"), false);
    }
    cb(null, true);
};

const createUpload = (sizeInMB) =>
    multer({
        storage: multer.memoryStorage(),
        limits:  { fileSize: sizeInMB * 1024 * 1024 },
        fileFilter: imageFileFilter,
    });

export const uploadCoverImage = createUpload(10).single("coverImage");
export const uploadProfilePic = createUpload(5).single("profilePic");
