import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import multer from "multer";
import mongoose from "mongoose";
import helmet from "helmet";


import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";
import uploadedBookRoutes from "./routes/uploadedBookRoutes.js";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoute.js";
import bookRoutes from "./routes/bookRoute.js";
import aiRoutes from "./routes/aiRoute.js";
import exportRoutes from "./routes/exportRoutes.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Environment Check ────────────────────────────────────────────────────────
if (
    !process.env.JWT_SECRET ||
    !process.env.MONGO_URI ||
    !process.env.GEMINI_API_KEY ||
    !process.env.CLOUD_NAME ||
    !process.env.CLOUD_API_KEY ||
    !process.env.CLOUD_API_SECRET ||
    !process.env.FRONTEND_URL
) {
    console.error("FATAL ERROR: Required environment variables are missing.");
    process.exit(1);
}

// ─── Security Middleware ──────────────────────────────────────────────────────
// CSP disabled so Cloudinary images load correctly; all other helmet protections active
app.use(
    helmet({
        contentSecurityPolicy: false,
    }),
);

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Allows: production URL (from env), all Vercel preview deployments, localhost dev
const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.PREVIEW_URL,
    "http://localhost:5173",
    "http://localhost:3000",
].filter(Boolean);

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow server-to-server / curl requests (no Origin header)
            if (!origin) return callback(null, true);

            const allowed = allowedOrigins.some((o) =>
                typeof o === "string" ? o === origin : o.test(origin),
            );

            if (allowed) {
                callback(null, true);
            } else {
                console.warn(`CORS blocked origin: ${origin}`);
                callback(new Error(`CORS policy: origin not allowed`));
            }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }),
);

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));



// ─── Rate Limiters ────────────────────────────────────────────────────────────
app.set("trust proxy", 1);
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: { message: "Too many attempts, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
});

const aiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: { message: "Too many AI requests, please slow down" },
    standardHeaders: true,
    legacyHeaders: false,
});

const imageLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 3,
    message: { message: "Too many image generation requests. Please wait." },
    standardHeaders: true,
    legacyHeaders: false,
});

const generalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60,
    message: { message: "Too many requests" },
    standardHeaders: true,
    legacyHeaders: false,
});

// ─── Database ─────────────────────────────────────────────────────────────────
connectDB();
mongoose.set("returnDocument", "after");

// ─── Rate Limiting per Route ──────────────────────────────────────────────────
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/ai/generate-cover", imageLimiter);
app.use("/api/ai", aiLimiter);
app.use("/api", generalLimiter);

/// ─── Health Check Endpoint ─────────────────────────────────────────────────
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "Server is awake" });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/uploaded-books", uploadedBookRoutes);

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: err.message });
    }
    console.error("Unhandled error:", err);
    res.status(500).json({ message: "An unexpected error occurred" });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
