import express from "express";
import {
    getBooks,
    getBookById,
    createBook,
    updateBookCover,
    updateBook,
    deleteBook,
    getCloudinaryCovers,
} from "../controller/bookController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { uploadCoverImage } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// Static routes MUST come before dynamic /:id routes
router.get("/cloudinary/covers", protect, getCloudinaryCovers);
router.get("/", protect, getBooks);
router.get("/:id", protect, getBookById);
router.post("/", protect, uploadCoverImage, createBook);
router.put("/cover/:id", protect, uploadCoverImage, updateBookCover);
router.put("/:id", protect, updateBook);
router.delete("/:id", protect, deleteBook);

export default router;
