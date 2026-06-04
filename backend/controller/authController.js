import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

// Helper: Generate JWT
const generateToken = (id, tokenVersion) => {
    return jwt.sign({ id, tokenVersion }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    });
};

// @desc    Register new user
export const registerUser = async (req, res) => {
    // req.body already validated + sanitized by validateMiddleware
    const { name, email, password } = req.body;
    try {
        // Force email to string — prevents NoSQL injection via object payloads
        const safeEmail = String(email).toLowerCase().trim();

        const userExists = await User.findOne({ email: safeEmail });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({
            name: String(name).trim(),
            email: safeEmail,
            password,
        });

        if (user) {
            res.status(201).json({
                message: "User registered successfully",
                token: generateToken(user._id, user.tokenVersion),
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        console.error("Registration error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Login user
export const loginUser = async (req, res) => {
    // req.body already validated by validateMiddleware
    const { email, password } = req.body;
    try {
        // Force to string — prevents { "$gt": "" } NoSQL injection
        const safeEmail = String(email).toLowerCase().trim();
        const safePassword = String(password);

        const user = await User.findOne({ email: safeEmail }).select("+password");
        if (user && (await user.matchPassword(safePassword))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id, user.tokenVersion),
            });
        } else {
            // Same message for both wrong email and wrong password
            // Prevents user enumeration
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Get current logged-in user
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                profilePic: user.profilePic || "",
                avatar: user.avatar || "",
                isPro: user.isPro || false,
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error("Profile error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Update user profile (name and profile pic only — no email change)
export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Only allow name update — email change removed intentionally.
        // Email change requires a separate verification flow to prevent
        // account takeover via email swap.
        if (req.body.name) {
            user.name = String(req.body.name).trim();
        }

        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, {
                folder: "ebook-creator/profiles",
                allowed_formats: ["jpg", "png", "webp"],
            });
            user.profilePic = result.secure_url;
        }

        await user.save();

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profilePic: user.profilePic,
        });
    } catch (error) {
        console.error("Update profile error:", error.message);
        res.status(500).json({ message: "Server error updating profile" });
    }
};

// @desc    Logout user - invalidate all tokens via tokenVersion bump
export const logoutUser = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, {
            $inc: { tokenVersion: 1 },
        });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error during logout" });
    }
};
