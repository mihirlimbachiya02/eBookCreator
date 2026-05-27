import express from "express";
import {
    getBooks,
    getBookById,
    createBook,
    updateBookCover,
    updateBook,
    deleteBook,
} from "../controller/bookController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { uploadCoverImage } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// Routes
router.get("/", protect, getBooks);
router.get("/:id", protect, getBookById);

// Ensure the frontend passes the correct key in FormData
router.post("/", protect, uploadCoverImage, createBook);
router.put("/cover/:id", protect, uploadCoverImage, updateBookCover);

// Standard JSON routes
router.put("/:id", protect, updateBook);
router.delete("/:id", protect, deleteBook);

export default router;
