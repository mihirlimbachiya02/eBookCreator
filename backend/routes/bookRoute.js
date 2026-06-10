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
import { validate } from "../middlewares/validateMiddleware.js";
import {
    createBookSchema,
    updateBookSchema,
    updateCoverSchema,
} from "../middlewares/validationSchemas.js";

const router = express.Router();

// Static routes MUST come before dynamic /:id routes
router.get("/cloudinary/covers",      protect, getCloudinaryCovers);
router.get("/",                        protect, getBooks);
router.get("/:id",                     protect, getBookById);
router.post("/",                       protect, uploadCoverImage, validate(createBookSchema), createBook);
router.put("/cover/:id",               protect, uploadCoverImage, validate(updateCoverSchema), updateBookCover);
router.put("/:id",                     protect, validate(updateBookSchema), updateBook);
router.delete("/:id",                  protect, deleteBook);

export default router;
