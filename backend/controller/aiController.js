import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { z } from "zod";
import { uploadToCloudinary } from "../config/cloudinary.js";
import fetch from "node-fetch";

// Retry helper for transient Gemini API errors
const generateWithRetry = async (ai, params, retries = 3, delayMs = 1000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await ai.models.generateContent(params);
        } catch (error) {
            const isRetryable = error.status === 503 || error.status === 429;
            if (isRetryable && attempt < retries) {
                console.warn(
                    `Gemini API attempt ${attempt} failed (${error.status}), retrying in ${delayMs}ms...`,
                );
                await new Promise((res) => setTimeout(res, delayMs * attempt));
            } else {
                throw error;
            }
        }
    }
};

dotenv.config();
// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });



// @desc    Generate a book outline
// Validation schema for outline generation
const outlineSchema = z.object({
    topic: z.string().min(1).max(300).trim(),
    style: z.string().min(1).max(100).trim(),
    numChapters: z.coerce.number().int().min(1).max(20).optional().default(5),
    description: z.string().max(500).trim().optional(),
});



// @desc    Generate a book outline
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
    },
    {
        "title": "Chapter 2: Core Principles",
        "description": "Explores the fundamental principles and theories. Provides detailed examples and real-world applications."
    }
]

Generate the outline now:`;

        const response = await generateWithRetry(ai, {
            model: process.env.AI_MODEL || "gemini-2.5-flash",
            contents: prompt,
            generationConfig: { maxOutputTokens: 4096 },
        });

        const text = response.text;
        const startIndex = text.indexOf("[");
        const endIndex = text.lastIndexOf("]");

        if (startIndex === -1 || endIndex === -1) {
            console.error("Could not find JSON array in AI response:", text);
            return res.status(500).json({
                message: "Failed to parse AI response, no JSON array found.",
            });
        }

        const jsonString = text.substring(startIndex, endIndex + 1);
        try {
            const outline = JSON.parse(jsonString);
            res.status(200).json({ outline });
        } catch (e) {
            console.error("Failed to parse AI response:", jsonString);
            res.status(500).json({
                message:
                    "Failed to generate a valid outline. The AI response was not valid JSON.",
            });
        }
    } catch (error) {
        console.error("Error generating outline:", error);
        if (error.status === 503) {
            return res.status(503).json({
                message:
                    "AI service is temporarily unavailable. Please try again in a moment.",
            });
        }
        if (error.status === 429) {
            return res.status(429).json({
                message:
                    "AI request limit reached. Please wait a moment before trying again.",
            });
        }
        res.status(500).json({
            message: "Server error during AI outline generation",
        });
    }
};



// @desc    Generate content for a chapter
// Validation schema for chapter content generation
const chapterSchema = z.object({
    chapterTitle: z.string().min(1).max(300).trim(),
    chapterDescription: z.string().max(500).trim().optional(),
    style: z.string().min(1).max(100).trim(),
});




// @desc    Generate content for a chapter
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
1. Write in a ${style.toLowerCase()} tone throughout the chapter
2. Structure the content with clear sections and smooth transitions
3. Include relevant examples, explanations, or anecdotes as appropriate for the style
4. Ensure the content flows logically from introduction to conclusion
5. Make the content engaging and valuable to readers
${chapterDescription ? `6. Cover all points mentioned in the chapter description` : ""}

Format Guidelines:
- Start with a compelling opening paragraph
- Use clear paragraph breaks for readability
- Include subheadings if appropriate for the content length
- End with a strong conclusion or transition to the next chapter
- Write in plain text without markdown formatting

Begin writing the chapter content now:`;

        const response = await generateWithRetry(ai, {
            model: process.env.AI_MODEL || "gemini-2.5-flash",
            contents: prompt,
            generationConfig: { maxOutputTokens: 4096 },
        });

        res.status(200).json({ content: response.text });
    } catch (error) {
        console.error("Error generating chapter content:", error);
        if (error.status === 503) {
            return res.status(503).json({
                message:
                    "AI service is temporarily unavailable. Please try again in a moment.",
            });
        }
        if (error.status === 429) {
            return res.status(429).json({
                message:
                    "AI request limit reached. Please wait a moment before trying again.",
            });
        }
        res.status(500).json({
            message: "Server error during AI chapter content generation",
        });
    }
};




// @desc    Generate generic text based on a prompt
const generateTextSchema = z.object({
    chapterTitle: z.string().min(1).max(300).trim(),
    currentContent: z.string().max(2000).trim().optional(),
    instructions: z.string().min(1).max(500).trim(),
    style: z.string().min(1).max(100).trim(),
});

// @desc    Generate generic text based on a prompt
export const generateText = async (req, res) => {
    try {
        const parsed = generateTextSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: "Invalid input" });
        }
        const { chapterTitle, currentContent, instructions, style } =
            parsed.data;

        const prompt = `You are a professional book editor and writer. 
        Context: The book is written in a ${style} style.
        Current Chapter Title: ${chapterTitle}
        Existing Content: ${currentContent ? currentContent.substring(0, 500) : "None"}
        
        Instructions: ${instructions}
        
        Write the next section of the chapter following the established style. 
        Return only the generated text without any conversational filler or markdown.`;

        const response = await generateWithRetry(ai, {
            model: process.env.AI_MODEL || "gemini-2.5-flash",
            contents: prompt,
            generationConfig: { maxOutputTokens: 2048 },
        });

        res.status(200).json({ content: response.text });
    } catch (error) {
        console.error("Error generating text:", error);
        if (error.status === 503) {
            return res.status(503).json({
                message:
                    "AI service is temporarily unavailable. Please try again in a moment.",
            });
        }
        if (error.status === 429) {
            return res.status(429).json({
                message:
                    "AI request limit reached. Please wait a moment before trying again.",
            });
        }
        res.status(500).json({
            message: "Server error during AI text generation",
        });
    }
};




// @desc    Generate AI cover image using Stability AI
export const generateCoverImage = async (req, res) => {
    try {
        const { prompt, title } = req.body;

        if (!prompt && !title) {
            return res.status(400).json({
                message: "Please provide a prompt or title",
            });
        }

        if (!process.env.STABILITY_API_KEY) {
            return res.status(500).json({
                message: "Image generation service is not configured",
            });
        }

        // Build a strong book cover prompt
        const imagePrompt =
            prompt?.trim() ?
                `Book cover design: ${prompt.trim()}. Professional publishing quality, high resolution, visually striking`
            :   `Professional book cover for "${title}". Modern design, high quality, suitable for publishing`;

        // Call Stability AI API
        const stabilityResponse = await fetch(
            "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
                },
                body: JSON.stringify({
                    text_prompts: [
                        {
                            text: imagePrompt,
                            weight: 1,
                        },
                        {
                            text: "blurry, low quality, distorted, watermark, text, ugly, bad anatomy",
                            weight: -1,
                        },
                    ],
                    cfg_scale: 7,
                    height: 1216,
                    width: 832,
                    steps: 30,
                    samples: 1,
                }),
            },
        );

        if (!stabilityResponse.ok) {
            const errorData = await stabilityResponse.json();
            console.error("Stability AI error:", errorData);

            if (stabilityResponse.status === 401) {
                return res.status(401).json({
                    message: "Invalid Stability AI API key",
                });
            }
            if (stabilityResponse.status === 429) {
                return res.status(429).json({
                    message:
                        "Image generation limit reached. Please try again later.",
                });
            }
            return res.status(500).json({
                message: "Failed to generate image",
            });
        }

        const stabilityData = await stabilityResponse.json();

        if (!stabilityData.artifacts || stabilityData.artifacts.length === 0) {
            return res.status(500).json({
                message: "No image was generated",
            });
        }

        // Get base64 image from response
        const base64Image = stabilityData.artifacts[0].base64;
        const imageBuffer = Buffer.from(base64Image, "base64");

        // Upload to Cloudinary
        const safeTitle =
            title ?
                title.replace(/[^a-z0-9]/gi, "_").toLowerCase()
            :   "ai_cover";

        const cloudinaryResult = await uploadToCloudinary(imageBuffer, {
            folder: "ebook-creator/books",
            public_id: `ai_${safeTitle}_${Date.now()}`,
            overwrite: false,
            resource_type: "image",
        });

        res.status(200).json({
            imageUrl: cloudinaryResult.secure_url,
            message: "Cover image generated successfully",
        });
    } catch (error) {
        console.error("Cover generation error:", error.message);
        res.status(500).json({
            message: "Failed to generate cover image. Please try again.",
        });
    }
};
