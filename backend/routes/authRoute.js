import express from "express";
import {
    registerUser,
    loginUser,
    refreshAccessToken,
    getProfile,
    updateUserProfile,
    logoutUser,
    forgotPassword,
    resetPassword,
    changePassword,
} from "../controller/authController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { uploadProfilePic } from "../middlewares/uploadMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
    registerSchema,
    loginSchema,
    updateProfileSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    changePasswordSchema,
} from "../middlewares/validationSchemas.js";

const router = express.Router();

// Public routes
router.post("/register",        validate(registerSchema),       registerUser);
router.post("/login",           validate(loginSchema),          loginUser);
router.post("/refresh",                                         refreshAccessToken);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password/:token", validate(resetPasswordSchema), resetPassword);

// Protected routes
router.post("/logout",          protect,                        logoutUser);
router.get( "/profile",         protect,                        getProfile);
router.put( "/profile",         protect, uploadProfilePic, validate(updateProfileSchema), updateUserProfile);
router.put( "/change-password", protect, validate(changePasswordSchema), changePassword);

export default router;
