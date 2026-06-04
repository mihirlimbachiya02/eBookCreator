import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false,
        },
        avatar: {
            type: String,
            default: "",
        },
        profilePic: {
            type: String,
            default: "",
        },
        isPro: {
            type: Boolean,
            default: false,
        },
        tokenVersion: {
            type: Number,
            default: 0,
        },
        // Hashed refresh token — stored in DB so it can be invalidated on logout
        refreshToken: {
            type: String,
            default: null,
            select: false, // never returned in queries by default
        },
    },
    { timestamps: true },
);

// Hash password before save
userSchema.pre("save", async function () {
    if (!this.isModified("password") || !this.password) return;
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
