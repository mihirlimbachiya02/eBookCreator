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
import { validate } from "../middlewares/validateMiddleware.js";
import {
    registerSchema,
    loginSchema,
    updateProfileSchema,
} from "../middlewares/validationSchemas.js";

const router = express.Router();

// Public routes
router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);
router.post("/logout", protect, logoutUser);

// Protected routes
router.get("/profile", protect, getProfile);
router.put(
    "/profile",
    protect,
    uploadProfilePic,
    validate(updateProfileSchema),
    updateUserProfile,
);

export default router;
