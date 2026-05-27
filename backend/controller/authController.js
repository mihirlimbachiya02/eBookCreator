import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

// Helper: Generate JWT
const generateToken = (id, tokenVersion) => {
    return jwt.sign({ id, tokenVersion }, process.env.JWT_SECRET, {
        expiresIn: "2h",
    });
};


// @desc    Register new user
export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please fill all fields" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({ name, email, password });

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
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }).select("+password");
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id, user.tokenVersion),
            });
        } else {
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



// @desc    Update user profile
export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

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

// @desc    Logout user - invalidate all tokens
export const logoutUser = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, {
            $inc: { tokenVersion: 1 }
        });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error during logout" });
    }
};