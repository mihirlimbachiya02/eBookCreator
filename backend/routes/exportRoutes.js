import express from "express";
import {
    exportAsPDF,
    exportAsDocument,
} from "../controller/exportController.js"; 
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Route definitions for exporting books
router.get("/:id/pdf", protect, exportAsPDF);
router.get("/:id/doc", protect, exportAsDocument);

export default router;
