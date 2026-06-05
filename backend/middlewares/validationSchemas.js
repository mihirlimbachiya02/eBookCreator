import { z } from "zod";

// ── Auth ──────────────────────────────────────────────────────────────────────
export const registerSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name too long")
        .regex(/^[a-zA-Z\s'-]+$/, "Name contains invalid characters"),
    email:    z.string().email("Invalid email").max(100, "Email too long"),
    password: z.string().min(6, "Password must be at least 6 characters").max(100, "Password too long"),
});

export const loginSchema = z.object({
    email:    z.string().email("Invalid email").max(100),
    password: z.string().min(1, "Password required").max(100),
});

export const updateProfileSchema = z.object({
    name: z
        .string()
        .min(2)
        .max(50)
        .regex(/^[a-zA-Z\s'-]+$/, "Name contains invalid characters")
        .optional(),
    // Email change intentionally excluded — requires separate verification flow
});

// ── Books ─────────────────────────────────────────────────────────────────────
export const createBookSchema = z.object({
    title:    z.string().min(1, "Title required").max(200, "Title too long"),
    author:   z.string().min(1, "Author required").max(100, "Author too long"),
    subtitle: z.string().max(300, "Subtitle too long").optional().default(""),
    coverImage: z
        .string()
        .url()
        .refine((url) => url.startsWith("https://"), "Cover image must be HTTPS")
        .optional(),
    chapters: z.array(z.any()).max(200, "Too many chapters").optional(),
});

export const updateBookSchema = z.object({
    title:    z.string().min(1).max(200).optional(),
    author:   z.string().min(1).max(100).optional(),
    subtitle: z.string().max(300).optional(),
    style:    z.string().max(50).optional(),
    chapters: z
        .array(
            z.object({
                title:       z.string().max(300).optional(),
                content:     z.string().max(100000).optional(),
                description: z.string().max(1000).optional(),
            }),
        )
        .max(200)
        .optional(),
});

// Cover image URL — only allow Cloudinary or known safe domains
const ALLOWED_COVER_DOMAINS = [
    "res.cloudinary.com",
    "images.unsplash.com",
    "oaidalleapiprodscus.blob.core.windows.net",
];

export const updateCoverSchema = z.object({
    bookTitle: z.string().max(200).optional(),
    coverImageUrl: z
        .string()
        .url()
        .refine((url) => {
            try {
                const { hostname } = new URL(url);
                return ALLOWED_COVER_DOMAINS.some(
                    (d) => hostname === d || hostname.endsWith(`.${d}`),
                );
            } catch {
                return false;
            }
        }, "Cover image URL must be from an allowed domain")
        .optional(),
});

// ── Uploaded Books ────────────────────────────────────────────────────────────
export const importUrlSchema = z.object({
    url: z
        .string()
        .url("Invalid URL")
        .refine((url) => {
            try {
                const { protocol, hostname } = new URL(url);
                if (!["http:", "https:"].includes(protocol)) return false;
                const privatePatterns = [
                    /^localhost$/i,
                    /^127\./,
                    /^10\./,
                    /^172\.(1[6-9]|2[0-9]|3[01])\./,
                    /^192\.168\./,
                    /^169\.254\./, // AWS metadata endpoint
                    /^::1$/,
                    /^0\./,
                    /^0$/,
                ];
                return !privatePatterns.some((p) => p.test(hostname));
            } catch {
                return false;
            }
        }, "URL not allowed"),
    title: z.string().max(200).optional(),
});

export const uploadBookSchema = z.object({
    title: z.string().max(200).optional(),
});

// ← NEW: importFromDrive validation
export const importDriveSchema = z.object({
    driveUrl:    z.string().url("Invalid Drive URL").optional(),
    accessToken: z.string().max(500).optional(),
    title:       z.string().max(200).optional(),
    mimeType:    z.string().max(100).optional(),
});

// ── AI ────────────────────────────────────────────────────────────────────────
export const generateOutlineSchema = z.object({
    title: z.string().max(200).optional(),
    topic: z.string().min(1, "Topic required").max(500),
    style: z
        .enum(["Informative", "Creative", "Technical", "Narrative"])
        .optional()
        .default("Informative"),
});

export const generateTextSchema = z.object({
    bookId:         z.string().max(100).optional(),
    chapterTitle:   z.string().max(300).optional(),
    currentContent: z.string().max(50000).optional(),
    instructions:   z.string().max(1000).optional(),
    style:          z.string().max(50).optional(),
});

export const generateChapterSchema = z.object({
    bookId:         z.string().max(100).optional(),
    chapterTitle:   z.string().max(300).optional(),
    currentContent: z.string().max(50000).optional(),
    instructions:   z.string().max(1000).optional(),
    style:          z.string().max(50).optional(),
});
