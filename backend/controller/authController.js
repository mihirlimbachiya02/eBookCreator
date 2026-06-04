import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

// ── Token Generators ──────────────────────────────────────────────────────────

const generateAccessToken = (id, tokenVersion) => {
    return jwt.sign({ id, tokenVersion }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    });
};

const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
    });
};

// Hash refresh token before storing in DB
// We never store raw tokens — if DB is leaked, tokens are useless
const hashToken = (token) => {
    return crypto.createHash("sha256").update(token).digest("hex");
};

// ── Register ──────────────────────────────────────────────────────────────────

export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
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

        if (!user) {
            return res.status(400).json({ message: "Invalid user data" });
        }

        const accessToken  = generateAccessToken(user._id, user.tokenVersion);
        const refreshToken = generateRefreshToken(user._id);

        await User.findByIdAndUpdate(user._id, {
            refreshToken: hashToken(refreshToken),
        });

        res.status(201).json({
            message: "User registered successfully",
            token: accessToken,
            refreshToken,
        });
    } catch (error) {
        console.error("Registration error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

// ── Login ─────────────────────────────────────────────────────────────────────

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const safeEmail    = String(email).toLowerCase().trim();
        const safePassword = String(password);

        const user = await User.findOne({ email: safeEmail }).select("+password");

        if (!user || !(await user.matchPassword(safePassword))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const accessToken  = generateAccessToken(user._id, user.tokenVersion);
        const refreshToken = generateRefreshToken(user._id);

        await User.findByIdAndUpdate(user._id, {
            refreshToken: hashToken(refreshToken),
        });

        res.json({
            _id:          user._id,
            name:         user.name,
            email:        user.email,
            token:        accessToken,
            refreshToken,
        });
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

// ── Refresh ───────────────────────────────────────────────────────────────────

export const refreshAccessToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token required" });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decoded.id).select("+refreshToken");
        if (!user || !user.refreshToken) {
            return res.status(401).json({ message: "Invalid refresh token" });
        }

        const incomingHash = hashToken(refreshToken);
        if (incomingHash !== user.refreshToken) {
            // Token reuse detected — invalidate all sessions
            await User.findByIdAndUpdate(decoded.id, {
                refreshToken: null,
                $inc: { tokenVersion: 1 },
            });
            return res.status(401).json({ message: "Refresh token reuse detected. Please login again." });
        }

        // Rotate — issue new tokens, replace old refresh token
        const newAccessToken  = generateAccessToken(user._id, user.tokenVersion);
        const newRefreshToken = generateRefreshToken(user._id);

        await User.findByIdAndUpdate(user._id, {
            refreshToken: hashToken(newRefreshToken),
        });

        res.json({
            token:        newAccessToken,
            refreshToken: newRefreshToken,
        });
    } catch (error) {
        console.error("Refresh error:", error.message);
        return res.status(401).json({ message: "Refresh token expired or invalid. Please login again." });
    }
};

// ── Get Profile ───────────────────────────────────────────────────────────────

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({
            _id:        user._id,
            name:       user.name,
            email:      user.email,
            profilePic: user.profilePic || "",
            avatar:     user.avatar || "",
            isPro:      user.isPro || false,
        });
    } catch (error) {
        console.error("Profile error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

// ── Update Profile ────────────────────────────────────────────────────────────

export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (req.body.name) {
            user.name = String(req.body.name).trim();
        }

        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, {
                folder:          "ebook-creator/profiles",
                allowed_formats: ["jpg", "png", "webp"],
            });
            user.profilePic = result.secure_url;
        }

        await user.save();

        res.status(200).json({
            _id:        user._id,
            name:       user.name,
            email:      user.email,
            profilePic: user.profilePic,
        });
    } catch (error) {
        console.error("Update profile error:", error.message);
        res.status(500).json({ message: "Server error updating profile" });
    }
};

// ── Logout ────────────────────────────────────────────────────────────────────

export const logoutUser = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, {
            refreshToken: null,
            $inc: { tokenVersion: 1 },
        });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error during logout" });
    }
};
