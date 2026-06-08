import path from "path";
import axios from "axios";
import {
    cloudinary,
    uploadRawToCloudinary,
    uploadToCloudinary,
} from "../config/cloudinary.js";
import UploadedBook from "../models/UploadedBook.js";

const ALLOWED = ["pdf", "html", "epub", "mobi", "zip"];


// @desc    Upload a book file from user's device
export const uploadBook = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const ext = path
            .extname(req.file.originalname)
            .replace(".", "")
            .toLowerCase();

        if (!ALLOWED.includes(ext)) {
            return res
                .status(400)
                .json({ message: `Format .${ext} not supported` });
        }

        const result = await uploadRawToCloudinary(req.file.buffer, {
            folder: "ebook-creator/uploaded-books",
            public_id: `book_${Date.now()}`,
            format: ext,
        });

        const book = await UploadedBook.create({
            user: req.user._id,
            title:
                req.body.title ||
                req.file.originalname.replace(/\.[^/.]+$/, ""),
            fileUrl: result.secure_url,
            publicId: result.public_id,
            format: ext,
            fileSize: req.file.size,
            source: "device",
        });

        res.status(201).json(book);
    } catch (err) {
        console.error("uploadBook error:", err.message);
        res.status(500).json({ message: "Upload failed" });
    }
};

// @desc    Import a book file from a URL
export const importFromUrl = async (req, res) => {
    try {
        const { url, title } = req.body;
        if (!url) return res.status(400).json({ message: "URL is required" });

        const parsed = new URL(url);
        if (!["http:", "https:"].includes(parsed.protocol)) {
            return res.status(400).json({ message: "Invalid URL" });
        }

        const ext = parsed.pathname.split(".").pop().toLowerCase();
        if (!ALLOWED.includes(ext)) {
            return res
                .status(400)
                .json({ message: `Format .${ext} not supported` });
        }

        const response = await axios.get(url, {
            responseType: "arraybuffer",
            timeout: 30000,
            maxContentLength: 50 * 1024 * 1024,
        });

        const buffer = Buffer.from(response.data);

        const result = await uploadRawToCloudinary(buffer, {
            folder: "ebook-creator/uploaded-books",
            public_id: `book_${Date.now()}`,
            format: ext,
        });

        const book = await UploadedBook.create({
            user: req.user._id,
            title: title || `Imported Book ${Date.now()}`,
            fileUrl: result.secure_url,
            publicId: result.public_id,
            format: ext,
            source: "url",
        });

        res.status(201).json(book);
    } catch (err) {
        console.error("importFromUrl error:", err.message);
        res.status(500).json({ message: "Import failed" });
    }
};


// @desc    Import a book file from Google Drive
export const importFromDrive = async (req, res) => {
    try {
        const { driveUrl, accessToken, title, mimeType } = req.body;  // ← driveUrl not fileId
        if (!driveUrl || !accessToken) {
            return res.status(400).json({ message: "driveUrl and accessToken are required" });
        }

        const MIME_TO_EXT = {
            "application/pdf":      "pdf",
            "application/epub+zip": "epub",
            "application/zip":      "zip",
            "text/html":            "html",
        };

        const ext = MIME_TO_EXT[mimeType] || "pdf";

        const response = await axios.get(driveUrl, {  
            responseType:     "arraybuffer",
            headers:          { Authorization: `Bearer ${accessToken}` },
            timeout:          60000,
            maxContentLength: 50 * 1024 * 1024,
        });

        const buffer = Buffer.from(response.data);

        const result = await uploadRawToCloudinary(buffer, {
            folder:    "ebook-creator/uploaded-books",
            public_id: `book_${Date.now()}`,
            format:    ext,
        });

        const book = await UploadedBook.create({
            user:     req.user._id,
            title:    title || `Drive Book ${Date.now()}`,
            fileUrl:  result.secure_url,
            publicId: result.public_id,
            format:   ext,
            source:   "google_drive", 
        });

        res.status(201).json(book);
    } catch (err) {
        console.error("importFromDrive error:", err.message);
        res.status(500).json({ message: "Drive import failed" });
    }
};


// @desc    Get all uploaded books for the user
export const getUploadedBooks = async (req, res) => {
    try {
        const books = await UploadedBook.find({ user: req.user._id }).sort({
            createdAt: -1,
        });
        res.status(200).json(books);
    } catch (err) {
        console.error("getUploadedBooks error:", err.message);
        res.status(500).json({ message: "Failed to fetch books" });
    }
};


// @desc    Delete an uploaded book
export const deleteUploadedBook = async (req, res) => {
    try {
        const book = await UploadedBook.findOne({
            _id: req.params.id,
            user: req.user._id,
        });
        if (!book) return res.status(404).json({ message: "Book not found" });

        // Delete from Cloudinary
        try {
            await cloudinary.uploader.destroy(book.publicId, {
                resource_type: "raw",
            });
        } catch (cloudErr) {
            console.error("Cloudinary delete error:", cloudErr.message);
        }

        await book.deleteOne();
        res.status(200).json({ message: "Book deleted successfully" });
    } catch (err) {
        console.error("deleteUploadedBook error:", err.message);
        res.status(500).json({ message: "Delete failed" });
    }
};


// @desc    Proxy an uploaded book file
export const proxyBookFile = async (req, res) => {
    try {
        const book = await UploadedBook.findOne({
            _id: req.params.id,
            user: req.user._id,
        });
        if (!book) return res.status(404).json({ message: "Not found" });

        const response = await axios.get(book.fileUrl, {
            responseType: "stream",
            timeout: 60000,
        });

        res.setHeader(
            "Content-Type",
            response.headers["content-type"] || "application/pdf",
        );
        res.setHeader(
            "Access-Control-Allow-Origin",
            process.env.FRONTEND_URL || "http://localhost:5173",
        ); 
        res.setHeader("Access-Control-Allow-Credentials", "true"); 
        res.setHeader("Cache-Control", "private, max-age=3600");

        response.data.pipe(res);
    } catch (err) {
        console.error("Proxy error:", err.message);
        res.status(500).json({ message: "Proxy failed", error: err.message });
    }
};


// @desc    Update an uploaded book's metadata and its cover image
export const updateUploadedBook = async (req, res) => {
    try {
        const book = await UploadedBook.findOne({
            _id:  req.params.id,
            user: req.user._id,
        });
        if (!book) return res.status(404).json({ message: "Not found" });

        const { title, format, source, coverImage } = req.body;

        if (title)      book.title      = title;
        if (format)     book.format     = format;
        if (source)     book.source     = source;
        if (coverImage !== undefined) book.coverImage = coverImage;

        // Handle cover image file upload 
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, {
                folder:        "ebook-creator/books",
                public_id:     `cover_${book._id}_${Date.now()}`,
                resource_type: "image",
            });
            book.coverImage = result.secure_url;
        }

        await book.save();
        res.json(book);
    } catch (err) {
        console.error("updateUploadedBook error:", err);
        res.status(500).json({ message: "Update failed", error: err.message });
    }
};