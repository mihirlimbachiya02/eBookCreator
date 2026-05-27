import express from "express";
import {
    generateOutline,
    generateChapterContent,
    generateText,
    generateCoverImage,
} from "../controller/aiController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect); 

router.post("/generate-outline", generateOutline);
router.post("/generate-chapter-content", generateChapterContent);
router.post("/generate", generateText); 
router.post("/generate-cover", generateCoverImage);
export default router;
