import Book from "../models/Book.js";
import { uploadToCloudinary, cloudinary } from "../config/cloudinary.js";


// @desc    Create a new book
export const createBook = async (req, res) => {
    try {
        const { title, author, subtitle, chapters } = req.body;
        if (!title || !author) {
            return res
                .status(400)
                .json({ message: "Please provide a title and author" });
        }
        let parsedChapters = [];
        if (chapters) {
            try {
                parsedChapters =
                    typeof chapters === "string" ?
                        JSON.parse(chapters)
                    :   chapters;
            } catch (e) {
                return res
                    .status(400)
                    .json({ message: "Invalid chapter data format" });
            }
        }

        let coverImage =
            "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=600&auto=format&fit=crop";

        // If AI-generated cover URL is provided directly
        if (req.body.coverImage && req.body.coverImage.startsWith("http")) {
            coverImage = req.body.coverImage;
        } else if (req.file) {
            const safeTitle =
                title ?
                    title.replace(/[^a-z0-9]/gi, "_").toLowerCase()
                :   "untitled";

            const result = await uploadToCloudinary(req.file.buffer, {
                folder: "ebook-creator/books",
                public_id: `${safeTitle}_${Date.now()}`,
                overwrite: false,
                resource_type: "image",
                tags: [`user_${req.user._id}`],
            });
            coverImage = result.secure_url;
        }

        const book = await Book.create({
            userId: req.user._id,
            title: title.trim(),
            author: author.trim(),
            subtitle: (subtitle || "").trim(),
            chapters: parsedChapters,
            coverImage,
        });
        res.status(201).json(book);
    } catch (error) {
        console.error("DEBUG - [createBook] Error:", error.message);
        res.status(500).json({
            message: "An unexpected error occurred during creation.",
        });
    }
};


// @desc    Get all books for a user
export const getBooks = async (req, res) => {
    try {
        const books = await Book.find({ userId: req.user._id }).sort({
            createdAt: -1,
        });
        res.status(200).json(books);
    } catch (error) {
        console.error("DEBUG - [getBooks] Error:", error.message);
        res.status(500).json({ message: "Server error fetching books." });
    }
};


// @desc    Get a single book by ID
export const getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book || book.userId.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: "Book not found." });
        }
        res.status(200).json(book);
    } catch (error) {
        console.error("DEBUG - [getBookById] Error:", error.message);
        res.status(500).json({ message: "Server error." });
    }
};


// @desc    Update book text data
export const updateBook = async (req, res) => {
    try {
        const { id } = req.params;

        const updatedBook = await Book.findOneAndUpdate(
            { _id: id, userId: req.user._id },
            {
                $set: {
                    ...(req.body.title && { title: req.body.title.trim() }),
                    ...(req.body.subtitle !== undefined && {
                        subtitle: req.body.subtitle.trim(),
                    }),
                    ...(req.body.author && { author: req.body.author.trim() }),
                    ...(req.body.chapters && { chapters: req.body.chapters }),
                    ...(req.body.style && { style: req.body.style }),
                },
            },
            { returnDocument: "after", runValidators: true },
        );

        if (!updatedBook) {
            return res.status(404).json({
                message: "Book not found or unauthorized access.",
            });
        }
        res.status(200).json(updatedBook);
    } catch (error) {
        console.error("DEBUG - [updateBook] Error:", error.message);
        res.status(500).json({ message: "Update failed due to server error." });
    }
};


// @desc    Update book cover image
export const updateBookCover = async (req, res) => {
    try {
        const { id } = req.params;
        const { bookTitle, coverImageUrl } = req.body;

        const book = await Book.findById(id);
        if (!book || book.userId.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: "Book not found." });
        }

        // Handle AI-generated cover URL directly
        if (coverImageUrl) {
            book.coverImage = coverImageUrl;
            await book.save();
            return res.status(200).json(book);
        }

        // Handle file upload
        if (!req.file) {
            return res.status(400).json({ message: "No image file provided." });
        }

        const safeTitle =
            bookTitle ?
                bookTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()
            :   "untitled";

        const result = await uploadToCloudinary(req.file.buffer, {
            folder: "ebook-creator/books",
            public_id: `${safeTitle}_${Date.now()}`,
            overwrite: false,
            resource_type: "image",
            tags: [`user_${req.user._id}`],
        });
        book.coverImage = result.secure_url;
        await book.save();

        res.status(200).json(book);
    } catch (error) {
        res.status(500).json({ message: "Cover update failed." });
    }
};


// @desc    Delete a book
export const deleteBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book || book.userId.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: "Book not found." });
        }
        await book.deleteOne();
        res.status(200).json({ message: "Book deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Server error during deletion." });
    }
};


// @desc    Get all cover images from Cloudinary for current user's books
export const getCloudinaryCovers = async (req, res) => {
    try {
        const userId = req.user._id.toString();

        // 1. Fetch tagged images directly from Cloudinary (new uploads)
        const cloudinaryResult = await cloudinary.search
            .expression(`folder:ebook-creator/books AND tags:user_${userId}`)
            .sort_by("created_at", "desc")
            .max_results(100)
            .execute();

        const cloudinaryCovers = cloudinaryResult.resources.map((r) => ({
            url: r.secure_url,
            name: r.public_id.split("/").pop(),
            publicId: r.public_id,
        }));

        // 2. Fetch from MongoDB as fallback (old uploads without tags)
        const books = await Book.find(
            { userId: req.user._id, coverImage: { $exists: true, $ne: "" } },
            { coverImage: 1, title: 1, _id: 0 },
        );

        const mongoCovers = books
            .filter((b) => b.coverImage?.startsWith("http"))
            .map((b) => ({
                url: b.coverImage,
                name: b.title,
                publicId: b.coverImage.split("/").pop(),
            }));

        // 3. Merge both, deduplicate by URL
        const seen = new Set();
        const covers = [...cloudinaryCovers, ...mongoCovers].filter((c) => {
            if (seen.has(c.url)) return false;
            seen.add(c.url);
            return true;
        });

        res.status(200).json({ covers });
    } catch (error) {
        console.error("Cover fetch error:", error.message);
        res.status(500).json({ message: "Failed to fetch covers" });
    }
};


// @desc    Upload an image for use inside chapter content (not a book cover)
export const uploadContentImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image file provided" });
        }
        const result = await uploadToCloudinary(req.file.buffer, {
            folder:        "ebook-creator/content-images",
            public_id:     `content_${req.user._id}_${Date.now()}`,
            overwrite:     false,
            resource_type: "image",
        });
        res.status(200).json({ url: result.secure_url });
    } catch (error) {
        console.error("[uploadContentImage] Error:", error.message);
        res.status(500).json({ message: "Image upload failed" });
    }
};