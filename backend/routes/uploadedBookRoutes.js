import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { uploadRawBook } from "../config/cloudinary.js";
import { uploadCoverImage } from "../middlewares/uploadMiddleware.js";
import {
    uploadBook,
    importFromUrl,
    importFromDrive,
    getUploadedBooks,
    deleteUploadedBook,
    proxyBookFile,
    updateUploadedBook,
} from "../controller/uploadedBookController.js";

const router = express.Router();

router.use(protect);

router.post("/upload", uploadRawBook.single("book"), uploadBook);
router.post("/import-url", importFromUrl);
router.post("/import-drive", importFromDrive);
router.get("/", getUploadedBooks);
router.get("/proxy/:id", proxyBookFile);
router.put("/:id", uploadCoverImage, updateUploadedBook); // ← new
router.delete("/:id", deleteUploadedBook);

export default router;
