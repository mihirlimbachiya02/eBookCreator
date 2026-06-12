import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
import { sendPasswordResetEmail } from "../config/emailService.js";
import Book from "../models/Book.js";


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

        // Create a demo book for every new user
        try {
            await Book.create({
                userId: user._id,
                title: "Demo Book",
                author: "eBook Support",
                subtitle: "Your guide to creating amazing eBooks with AI",
                coverImage:
                    "https://res.cloudinary.com/dbk6z4ise/image/upload/v1781248802/ebook-creator/books/my_life_1781248798561.png",
                chapters: [
                    {
                        title: "Chapter 1: Getting Started",
                        description: "Introduction to eBook Creator",
                        content: `Welcome to eBook Creator — your AI-powered platform for writing, designing, and publishing professional eBooks.

This is a **demo book** — just for you to explore. Feel free to click around, edit this text, change things, or delete this whole book later. Nothing here is real, so don't worry about messing it up!

## What is this app for?

eBook Creator helps you write, design, and publish your own eBooks — whether it's a short guide, a story, a recipe book, or anything else you can think of. You can write everything yourself, get help from AI, or even bring in a book you've already started elsewhere.

## A quick look at your dashboard

When you go back to your dashboard, you'll see all your books listed there. From the dashboard you can:

- Create a brand new book
- Open and continue editing any existing book
- Upload a book you already have (more on this in Chapter 4)
- See your demo book — this one!

## How the editor works

Each book is made up of **chapters**, and each chapter has its own text. You write using simple formatting:

- To make text **bold**, put two stars around it, like \`**this**\`
- To make text *italic*, use one star on each side, like \`*this*\`
- Start a line with a dash (\`-\`) to make a bulleted list
- Use numbers like \`1.\` to make a numbered list

There's also a **Preview** button so you can see exactly how your book will look to readers, without all the formatting symbols.

## Give it a try

1. Click anywhere in this text and start typing
2. Try making a word bold or italic
3. Switch to Preview to see how it looks
4. Switch back to keep editing

Ready to learn more? Head to Chapter 2 to learn about adding a cover and book details. →`,
                    },
                    {
                        title: "Chapter 2: Your Book's Details and Cover",
                        description: "Set up the basics of your book",
                        content: `# 📖 Your Book's Details and Cover

Before readers even open your book, the first thing they see is the **cover** and the **title page**. Let's set those up.

## The Details tab

At the top of the editor, click the **Details** tab. Here you can edit:

- **Title** — the name of your book
- **Subtitle** — a short line describing what it's about
- **Author name** — your name, or whatever name you want to publish under

Take a moment to think about your title and subtitle — a clear, interesting title makes people want to read more.

## Adding a cover picture

Still on the Details tab, you can add a cover in a few different ways:

- **Upload from your computer** — pick any image file you already have
- **Choose from your library** — reuse a picture you've uploaded before
- **Generate with AI** — describe what you want (for example, "a cozy illustration of a cup of coffee and a book") and the AI will create a picture for you

## Why this matters

A good cover and a clear title make your book look professional and trustworthy — even if it's your very first one. It's worth spending a few minutes getting this right before you share your book with anyone.

## Try it now

1. Open the **Details** tab
2. Try changing the subtitle of this demo book
3. Try uploading a picture, or generate one with AI, just to see how it works

Next, let's start writing — with a little help from AI. →`,
                    },
                    {
                        title: "Chapter 3: Let AI Help You Write",
                        description: "Get help writing your book",
                        content: `# 🤖 Let AI Help You Write

Don't know where to start, or just want some help moving faster? eBook Creator can help you plan and write your book using AI.

## Step 1: Get a plan for your book

Look for the **AI Assistant** panel on the right side of the screen. Click **"Generate Outline Structure."**

Just tell it:
- What your book is about
- What style you'd like (friendly, professional, fun, etc.)

In a few seconds, you'll get a suggested list of chapters for your whole book — a starting roadmap you can change however you like.

## Step 2: Let AI write a chapter for you

Pick any chapter, then click **"Auto-Write Chapter."**

The AI will write a full chapter for you, based on:
- The chapter's title
- The writing style you chose

This usually gives you a solid first draft — often a page or two of text — that you can then read through and adjust.

## Step 3: Tell it exactly what you want

There's a box called **Custom Directives** where you can type extra instructions before generating, such as:

- "Use simple, everyday language"
- "Keep it friendly and easy to follow"
- "Add a short example or story at the end"
- "Keep each paragraph short"

## A friendly reminder

Think of the AI as a helpful assistant who writes a first draft for you. It's a great way to get past a blank page — but it's still a good idea to read through what it writes afterward and make it sound like *you*. Feel free to rewrite, shorten, or add your own stories and examples.

## Try it now

1. Open the **AI Assistant** panel
2. Try generating an outline for a topic you're interested in
3. Pick one chapter and try "Auto-Write Chapter"

Next, let's look at how to bring in a book you've already started somewhere else. →`,
                    },
                    {
                        title: "Chapter 4: Already Have a Book? Upload It!",
                        description: "Bring in books you've already started",
                        content: `# 📂 Already Have a Book? Upload It!

If you've already written something — a PDF, a document from your computer, or a file saved in Google Drive — you don't have to start from scratch. eBook Creator lets you **upload your existing books** too.

## How to upload a book

From your dashboard, look for the **Upload Book** option. You can bring in a book in a few ways:

- **From your device** — choose a file saved on your computer or phone
- **From a link (URL)** — paste a link to a file hosted online
- **From Google Drive** — connect your Google account and pick a file directly from your Drive

## What happens after you upload

Once your book is uploaded, it will appear on your dashboard alongside the books you create in the editor. You can open it any time to read through it.

For uploaded PDF books, you'll also see a handy **sidebar** with:

- A list of chapters or sections (bookmarks), so you can jump straight to the part you want
- Your **last read page** remembered automatically — so if you close the book and come back later, it picks up right where you left off

## Why this is useful

Maybe you wrote a draft in Word years ago, have an old PDF guide, or have notes sitting in Google Drive. Uploading lets you keep everything — your new AI-assisted books and your older work — all in one place, in your dashboard.

## Try it now

1. Go back to your dashboard
2. Look for the **Upload Book** button
3. If you have a PDF or document handy, try uploading it just to see how it appears on your dashboard

Last but not least — let's talk about sharing your finished book with the world. →`,
                    },
                    {
                        title: "Chapter 5: Sharing Your Book",
                        description: "Save your book as a file",
                        content: `# 📤 Sharing Your Book

Once you're happy with your book — whether you wrote it yourself, used AI to help, or both — you can save it as a file to share with others.

## Save as PDF

This is the easiest way to share your book. It will look neat and ready to read on any device — phone, tablet, computer, or e-reader.

1. Click **Export** at the top of the page
2. Choose **"Export PDF"**
3. Your book will download as a PDF file, ready to send or share

## Save as a Word document

If you'd like to make more changes later in a program like Microsoft Word or Google Docs, choose this option instead.

1. Click **Export**
2. Choose **"Export Document (.docx)"**
3. Open the downloaded file in Word or Google Docs to keep editing

## Before you export, double-check:

- Did you add a title and subtitle in the Details tab?
- Did you add a cover picture?
- Do all your chapters have clear, descriptive titles?
- Have you looked through your book in Preview mode?
- Did you read through any AI-written sections and make them sound like you?

## You're all set!

That's everything you need to know to get started: **set up your details → write (with AI help if you like) → bring in any existing work → review → save and share**.

When you're ready, go back to your dashboard and click **"Create New Book"** to start your own project. Good luck — we're excited to see what you make! 🚀`,
                    },
                ],
            });
        } catch (demoErr) {
            // Non-fatal — don't fail registration if demo book creation fails
            console.error("Demo book creation failed:", demoErr.message);
        }

        const accessToken = generateAccessToken(user._id, user.tokenVersion);
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