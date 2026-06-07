import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { z } from "zod";
import { uploadToCloudinary } from "../config/cloudinary.js";
import fetch from "node-fetch";

dotenv.config();

// ── Gemini client ─────────────────────────────────────────────────────────────
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ── Retry helper for Gemini API ───────────────────────────────────────────────
const generateWithRetry = async (ai, params, retries = 3, delayMs = 1000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await ai.models.generateContent(params);
        } catch (error) {
            const isRetryable = error.status === 503 || error.status === 429;
            if (isRetryable && attempt < retries) {
                console.warn(
                    `Gemini attempt ${attempt} failed (${error.status}), retrying in ${delayMs * attempt}ms...`,
                );
                await new Promise((res) => setTimeout(res, delayMs * attempt));
            } else {
                throw error;
            }
        }
    }
};

// ── Shared Gemini error handler ───────────────────────────────────────────────
const handleGeminiError = (error, res, context) => {
    console.error(`Error in ${context}:`, error);
    if (error.status === 503) {
        return res.status(503).json({
            message: "AI service is temporarily unavailable. Please try again.",
        });
    }
    if (error.status === 429) {
        return res.status(429).json({
            message: "AI request limit reached. Please wait a moment.",
        });
    }
    return res.status(500).json({ message: `Server error during ${context}` });
};

// ── Generate outline ──────────────────────────────────────────────────────────
const outlineSchema = z.object({
    topic:       z.string().min(1).max(300).trim(),
    style:       z.string().min(1).max(100).trim(),
    numChapters: z.coerce.number().int().min(1).max(20).optional().default(5),
    description: z.string().max(500).trim().optional(),
});

export const generateOutline = async (req, res) => {
    try {
        const parsed = outlineSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: "Invalid input" });
        }
        const { topic, style, numChapters, description } = parsed.data;

        const prompt = `You are an expert book outline generator. Create a comprehensive book outline based on the following requirements:

Topic: "${topic}"
${description ? `Description: ${description}` : ""}
Writing Style: ${style}
Number of Chapters: ${numChapters}

Requirements:
1. Generate exactly ${numChapters} chapters
2. Each chapter title should be clear, engaging, and follow a logical progression
3. Each chapter description should be 2-3 sentences explaining what the chapter covers
4. Ensure chapters build upon each other coherently
5. Match the "${style}" writing style in your titles and descriptions

Output Format:
Return ONLY a valid JSON array with no additional text, markdown, or formatting. Each object must have exactly two keys: "title" and "description".

Example structure:
[
    {
        "title": "Chapter 1: Introduction to the Topic",
        "description": "A comprehensive overview introducing the main concepts. Sets the foundation for understanding the subject matter."
    }
]

Generate the outline now:`;

        const response = await generateWithRetry(ai, {
            model:             process.env.AI_MODEL || "gemini-2.5-flash",
            contents:          prompt,
            generationConfig:  { maxOutputTokens: 4096 },
        });

        const text       = response.text;
        const startIndex = text.indexOf("[");
        const endIndex   = text.lastIndexOf("]");

        if (startIndex === -1 || endIndex === -1) {
            console.error("No JSON array in AI response:", text);
            return res.status(500).json({
                message: "Failed to parse AI response.",
            });
        }

        try {
            const outline = JSON.parse(text.substring(startIndex, endIndex + 1));
            res.status(200).json({ outline });
        } catch {
            res.status(500).json({
                message: "AI returned invalid JSON. Please try again.",
            });
        }
    } catch (error) {
        handleGeminiError(error, res, "outline generation");
    }
};

// ── Generate chapter content ──────────────────────────────────────────────────
const chapterSchema = z.object({
    chapterTitle:       z.string().min(1).max(300).trim(),
    chapterDescription: z.string().max(500).trim().optional(),
    style:              z.string().min(1).max(100).trim(),
});

export const generateChapterContent = async (req, res) => {
    try {
        const parsed = chapterSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: "Invalid input" });
        }
        const { chapterTitle, chapterDescription, style } = parsed.data;

        const prompt = `You are an expert writer specializing in ${style} content. Write a complete chapter for a book with the following specifications:

Chapter Title: "${chapterTitle}"
${chapterDescription ? `Chapter Description: ${chapterDescription}` : ""}
Writing Style: ${style}
Target Length: Comprehensive and detailed (aim for 1500-2500 words)

Requirements:
1. Write in a ${style.toLowerCase()} tone throughout
2. Structure the content with clear sections and smooth transitions
3. Include relevant examples, explanations, or anecdotes appropriate for the style
4. Ensure the content flows logically from introduction to conclusion
5. Make the content engaging and valuable to readers
${chapterDescription ? `6. Cover all points mentioned in the chapter description` : ""}

Format Guidelines:
- Start with a compelling opening paragraph
- Use clear paragraph breaks for readability
- Include subheadings if appropriate
- End with a strong conclusion or transition
- Write in plain text without markdown formatting

Begin writing now:`;

        const response = await generateWithRetry(ai, {
            model:            process.env.AI_MODEL || "gemini-2.5-flash",
            contents:         prompt,
            generationConfig: { maxOutputTokens: 4096 },
        });

        res.status(200).json({ content: response.text });
    } catch (error) {
        handleGeminiError(error, res, "chapter content generation");
    }
};

// ── Generate generic text ─────────────────────────────────────────────────────
const generateTextSchema = z.object({
    chapterTitle:   z.string().min(1).max(300).trim(),
    currentContent: z.string().max(2000).trim().optional(),
    instructions:   z.string().min(1).max(500).trim(),
    style:          z.string().min(1).max(100).trim(),
});

export const generateText = async (req, res) => {
    try {
        const parsed = generateTextSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: "Invalid input" });
        }
        const { chapterTitle, currentContent, instructions, style } = parsed.data;

        const prompt = `You are a professional book editor and writer.
Context: The book is written in a ${style} style.
Current Chapter Title: ${chapterTitle}
Existing Content: ${currentContent ? currentContent.substring(0, 500) : "None"}

Instructions: ${instructions}

Write the next section of the chapter following the established style.
Return only the generated text without any conversational filler or markdown.`;

        const response = await generateWithRetry(ai, {
            model:            process.env.AI_MODEL || "gemini-2.5-flash",
            contents:         prompt,
            generationConfig: { maxOutputTokens: 2048 },
        });

        res.status(200).json({ content: response.text });
    } catch (error) {
        handleGeminiError(error, res, "text generation");
    }
};

// ── Generate cover image ──────────────────────────────────────────────────────
// Primary: Hugging Face FLUX.1-dev (requires HF_API_KEY env var)
// Fallback: Pollinations flux-schnell (free, no key needed)
export const generateCoverImage = async (req, res) => {
    try {
        const { prompt, title } = req.body;

        if (!prompt && !title) {
            return res.status(400).json({ message: "Please provide a prompt or title" });
        }

        const imagePrompt = prompt?.trim()
            ? `Book cover design: ${prompt.trim()}. Professional publishing quality, high resolution, visually striking, no text`
            : `Professional book cover for "${title}". Modern design, high quality, suitable for publishing, no text`;

        const safeTitle = title
            ? title.replace(/[^a-z0-9]/gi, "_").toLowerCase()
            : "ai_cover";

        let imageBuffer = null;

        // ── Primary: Hugging Face ─────────────────────────────────────────────
        if (process.env.HF_API_KEY) {
            try {
                const hfResponse = await fetch(
                    "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${process.env.HF_API_KEY}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            inputs: imagePrompt,
                            parameters: {
                                width: 832,
                                height: 1216,
                                num_inference_steps: 28,
                                guidance_scale: 3.5,
                            },
                        }),
                        signal: AbortSignal.timeout(120000),
                    },
                );

                if (hfResponse.ok) {
                    imageBuffer = Buffer.from(await hfResponse.arrayBuffer());
                    console.log("Cover generated via Hugging Face");
                } else {
                    const errText = await hfResponse.text();
                    console.warn(`HF failed (${hfResponse.status}):`, errText);
                }
            } catch (hfError) {
                console.warn("HF error, trying Pollinations:", hfError.message);
            }
        }

        // ── Fallback: Pollinations flux-schnell (free) ────────────────────────
        if (!imageBuffer) {
            try {
                const encodedPrompt   = encodeURIComponent(imagePrompt);
                const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=832&height=1216&model=turbo&nologo=true&seed=${Date.now()}`;

                const pollResponse = await fetch(pollinationsUrl, {
                    signal: AbortSignal.timeout(90000),
                });

                if (pollResponse.ok) {
                    imageBuffer = Buffer.from(await pollResponse.arrayBuffer());
                    console.log("Cover generated via Pollinations fallback");
                } else {
                    console.error("Pollinations failed:", pollResponse.status);
                    return res.status(502).json({
                        message: "Image generation failed. Please try again.",
                    });
                }
            } catch (pollError) {
                if (pollError.name === "AbortError" || pollError.name === "TimeoutError") {
                    return res.status(504).json({
                        message: "Image generation timed out. Please try again.",
                    });
                }
                console.error("Pollinations error:", pollError.message);
                return res.status(500).json({
                    message: "Image generation failed. Please try again.",
                });
            }
        }

        // ── Upload result to Cloudinary ───────────────────────────────────────
        const cloudinaryResult = await uploadToCloudinary(imageBuffer, {
            folder: "ebook-creator/books",
            public_id: `ai_${safeTitle}_${Date.now()}`,
            overwrite: false,
            resource_type: "image",
            tags: [`user_${req.user._id}`],
        });

        res.status(200).json({
            imageUrl: cloudinaryResult.secure_url,
            message:  "Cover image generated successfully",
        });
    } catch (error) {
        console.error("Cover generation error:", error.message);
        res.status(500).json({
            message: "Failed to generate cover image. Please try again.",
        });
    }
};
