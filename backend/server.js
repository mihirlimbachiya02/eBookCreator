import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import multer from "multer";
import mongoose from "mongoose";
import helmet from "helmet";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoute.js";
import bookRoutes from "./routes/bookRoute.js";
import aiRoutes from "./routes/aiRoute.js";
import exportRoutes from "./routes/exportRoutes.js";

dotenv.config();

const app = express(); // Declared only once
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security Middleware
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                // Combined your custom rules here for a single source of truth
                imgSrc: [
                    "'self'",
                    "images.unsplash.com",
                    "res.cloudinary.com",
                    "data:",
                ],
                scriptSrc: ["'self'"],
                connectSrc: [
                    "'self'",
                    ...(process.env.NODE_ENV !== "production" ?
                        ["http://localhost:5173"]
                    :   []),
                ],
            },
        },
    }),
);

// Rate Limiters
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { message: "Too many attempts, please try again later" }
});

const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { message: "Too many AI requests, please slow down" },
});

// Stricter limit for image generation 
const imageLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 3,
    message: { message: "Too many image generation requests. Please wait." },
});

const generalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    message: { message: "Too many requests" }
});

// Verify critical environment variables
if (
    !process.env.JWT_SECRET ||
    !process.env.MONGO_URI ||
    !process.env.GEMINI_API_KEY ||
    !process.env.CLOUD_NAME ||
    !process.env.CLOUD_API_KEY ||
    !process.env.CLOUD_API_SECRET
) {
    console.error("FATAL ERROR: Required environment variables are missing.");
    process.exit(1);
}

if (!process.env.STABILITY_API_KEY) {
    console.warn(
        "WARNING: STABILITY_API_KEY is not set. AI cover generation will not work.",
    );
}

app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
    }),
);


// Body parsers
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// MongoDB connection
connectDB();
mongoose.set("returnDocument", "after");

// Rate limiting rules applied per route group
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/ai/generate-cover", imageLimiter);
app.use("/api/ai", aiLimiter);
app.use("/api", generalLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/export", exportRoutes);

// Error Handler
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: err.message });
    }
    console.error("Unhandled error:", err);
    res.status(500).json({ message: "An unexpected error occurred" });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
