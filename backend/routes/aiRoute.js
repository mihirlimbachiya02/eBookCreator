import express from "express";
import {
    generateOutline,
    generateChapterContent,
    generateText,
    generateCoverImage,
} from "../controller/aiController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
    generateOutlineSchema,
    generateTextSchema,
    generateChapterSchema,
} from "../middlewares/validationSchemas.js";

const router = express.Router();

router.use(protect);

router.post("/generate-outline", validate(generateOutlineSchema), generateOutline);
router.post("/generate-chapter-content", validate(generateChapterSchema), generateChapterContent);
router.post("/generate", validate(generateTextSchema), generateText);
router.post("/generate-cover", generateCoverImage); // image gen has its own limiter, no body to validate

export default router;
