import multer from "multer";

const fileFilter = (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
        cb(new Error("Only JPG, PNG, and WebP images are allowed"), false);
    } else {
        cb(null, true);
    }
};

const createUpload = (sizeInMB) =>
    multer({
        storage: multer.memoryStorage(),
        limits: { fileSize: sizeInMB * 1024 * 1024 },
        fileFilter,
    });

export const uploadCoverImage = createUpload(10).single("coverImage");
export const uploadProfilePic = createUpload(5).single("profilePic");
