import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
import { sendPasswordResetEmail } from "../config/emailService.js";


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

const hashToken = (token) =>
    crypto.createHash("sha256").update(token).digest("hex");


// ── Register ──────────────────────────────────────────────────────────────────
export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const safeEmail = String(email).toLowerCase().trim();
        const userExists = await User.findOne({ email: safeEmail });
        if (userExists)
            return res.status(400).json({ message: "User already exists" });

        const user = await User.create({
            name: String(name).trim(),
            email: safeEmail,
            password,
        });

        const accessToken  = generateAccessToken(user._id, user.tokenVersion);
        const refreshToken = generateRefreshToken(user._id);
        await User.findByIdAndUpdate(user._id, { refreshToken: hashToken(refreshToken) });

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

        if (!user || !(await user.matchPassword(safePassword)))
            return res.status(401).json({ message: "Invalid email or password" });

        const accessToken  = generateAccessToken(user._id, user.tokenVersion);
        const refreshToken = generateRefreshToken(user._id);
        await User.findByIdAndUpdate(user._id, { refreshToken: hashToken(refreshToken) });

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
    if (!refreshToken)
        return res.status(401).json({ message: "Refresh token required" });

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded.id).select("+refreshToken");

        if (!user || !user.refreshToken)
            return res.status(401).json({ message: "Invalid refresh token" });

        if (hashToken(refreshToken) !== user.refreshToken) {
            await User.findByIdAndUpdate(decoded.id, {
                refreshToken: null,
                $inc: { tokenVersion: 1 },
            });
            return res.status(401).json({ message: "Refresh token reuse detected. Please login again." });
        }

        const newAccessToken  = generateAccessToken(user._id, user.tokenVersion);
        const newRefreshToken = generateRefreshToken(user._id);
        await User.findByIdAndUpdate(user._id, { refreshToken: hashToken(newRefreshToken) });

        res.json({ token: newAccessToken, refreshToken: newRefreshToken });
    } catch (error) {
        console.error("Refresh error:", error.message);
        return res.status(401).json({ message: "Refresh token expired or invalid. Please login again." });
    }
};


// ── Forgot Password ───────────────────────────────────────────────────────────
export const forgotPassword = async (req, res) => {
    try {
        const email = String(req.body.email || "").toLowerCase().trim();
        if (!email)
            return res.status(400).json({ message: "Email is required" });

        const user = await User.findOne({ email });

        // Always return success — prevents email enumeration
        if (!user) {
            return res.status(200).json({
                message: "If that email exists, a reset link has been sent.",
            });
        }

        // Generate raw token (sent in email) and hashed token (stored in DB)
        const rawToken    = crypto.randomBytes(32).toString("hex");
        const hashedToken = hashToken(rawToken);

        await User.findByIdAndUpdate(user._id, {
            passwordResetToken:   hashedToken,
            passwordResetExpires: Date.now() + 15 * 60 * 1000, // 15 minutes
        });

        await sendPasswordResetEmail(user.email, rawToken, user.name);

        res.status(200).json({
            message: "If that email exists, a reset link has been sent.",
        });
    } catch (error) {
        console.error("Forgot password error:", error.message);
        res.status(500).json({ message: "Failed to send reset email. Please try again." });
    }
};


// ── Reset Password ────────────────────────────────────────────────────────────
export const resetPassword = async (req, res) => {
    try {
        const { token }    = req.params;
        const { password } = req.body;

        if (!token || !password)
            return res.status(400).json({ message: "Token and new password are required" });

        if (password.length < 6)
            return res.status(400).json({ message: "Password must be at least 6 characters" });

        const hashedToken = hashToken(token);

        const user = await User.findOne({
            passwordResetToken:   hashedToken,
            passwordResetExpires: { $gt: Date.now() }, // not expired
        }).select("+password");

        if (!user)
            return res.status(400).json({ message: "Reset link is invalid or has expired" });

        // Update password and clear reset token + invalidate all sessions
        user.password             = password;
        user.passwordResetToken   = null;
        user.passwordResetExpires = null;
        user.refreshToken         = null;
        user.tokenVersion         = (user.tokenVersion || 0) + 1;
        await user.save();

        res.status(200).json({ message: "Password reset successfully. Please login with your new password." });
    } catch (error) {
        console.error("Reset password error:", error.message);
        res.status(500).json({ message: "Server error during password reset" });
    }
};


// ── Change Password (logged in) ───────────────────────────────────────────────
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword)
            return res.status(400).json({ message: "Current and new password are required" });

        if (newPassword.length < 6)
            return res.status(400).json({ message: "New password must be at least 6 characters" });

        if (currentPassword === newPassword)
            return res.status(400).json({ message: "New password must be different from current password" });

        const user = await User.findById(req.user._id).select("+password");
        if (!user)
            return res.status(404).json({ message: "User not found" });

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch)
            return res.status(401).json({ message: "Current password is incorrect" });

        user.password = newPassword;
        // Bump tokenVersion to invalidate all other sessions after password change
        user.tokenVersion = (user.tokenVersion || 0) + 1;
        await user.save();

        res.status(200).json({ message: "Password changed successfully. Please login again." });
    } catch (error) {
        console.error("Change password error:", error.message);
        res.status(500).json({ message: "Server error during password change" });
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

        if (req.body.name) user.name = String(req.body.name).trim();

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