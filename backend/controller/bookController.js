import Book from "../models/Book.js";
import { cloudinary, uploadToCloudinary } from "../config/cloudinary.js";




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
            // Handle file upload
            const safeTitle =
                title ?
                    title.replace(/[^a-z0-9]/gi, "_").toLowerCase()
                :   "untitled";

            const result = await uploadToCloudinary(req.file.buffer, {
                folder: "ebook-creator/books",
                public_id: `${safeTitle}_${Date.now()}`,
                overwrite: false,
                resource_type: "image",
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
            public_id: `${safeTitle}_${id}`,
            overwrite: true,
        });

        book.coverImage = result.secure_url;
        await book.save();

        res.status(200).json(book);
    } catch (error) {
        console.error("DEBUG - [updateBookCover] Error:", error.message);
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
        console.error("DEBUG - [deleteBook] Error:", error.message);
        res.status(500).json({ message: "Server error during deletion." });
    }
};


// @desc    Get all cover images from Cloudinary for current user's books
export const getCloudinaryCovers = async (req, res) => {
    try {
        // Fetch all images from ebook-creator/books folder
        const result = await cloudinary.search
            .expression("folder:ebook-creator/books")
            .sort_by("created_at", "desc")
            .max_results(50)
            .execute();

        const covers = result.resources.map((resource) => ({
            publicId: resource.public_id,
            url: resource.secure_url,
            name: resource.public_id.split("/").pop(),
            createdAt: resource.created_at,
            width: resource.width,
            height: resource.height,
        }));

        res.status(200).json({ covers });
    } catch (error) {
        console.error("Cloudinary fetch error:", error.message);
        res.status(500).json({ message: "Failed to fetch covers from Cloudinary" });
    }
};
