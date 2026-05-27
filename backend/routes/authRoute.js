import express from "express";
import {
    registerUser,
    loginUser,
    getProfile,
    updateUserProfile,
    logoutUser,
} from "../controller/authController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { uploadProfilePic } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

//public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", protect, logoutUser);

//protected routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, uploadProfilePic, updateUserProfile);

export default router;
