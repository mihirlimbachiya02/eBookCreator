import mongoose from "mongoose";

const uploadedBookSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        fileUrl: {
            type: String,
            required: true,
        },
        publicId: {
            type: String,
            required: true,
        },
        format: {
            type: String,
            enum: ["pdf", "html", "epub", "mobi", "zip"],
            required: true,
        },
        fileSize: Number,
        source: {
            type: String,
            enum: ["device", "url", "google_drive"],
            default: "device",
        },
        coverImage: {
            type: String,
            default: "",
        },
    },
    { timestamps: true },
);

export default mongoose.model("UploadedBook", uploadedBookSchema);
