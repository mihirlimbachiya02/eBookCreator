import { Lightbulb, BookOpen, Download, Library } from "lucide-react";

// Added a constant for image base URL if you ever switch to a self-hosted CDN
const IMAGE_BASE = "https://images.unsplash.com";

export const FEATURES = [
    {
        title: "AI-Powered Writing",
        description:
            "Overcome writer's block with our smart assistant that helps you generate ideas, outlines, and content.",
        icon: Lightbulb,
        gradient: "from-violet-500 to-purple-600",
    },
    {
        title: "Immersive Reader",
        description:
            "Preview your ebook in a clean, read-only format. Adjust font sizes for a comfortable reading experience.",
        icon: BookOpen,
        gradient: "from-blue-500 to-cyan-600",
    },
    {
        title: "One-Click Export",
        description:
            "Export your ebook to PDF, and DOCX formats instantly, ready for publishing.",
        icon: Download,
        gradient: "from-emerald-500 to-teal-600",
    },
    {
        title: "eBook Management",
        description:
            "Organize all your ebook projects in a personal dashboard. Easily track progress, edit drafts, and manage your assets.",
        icon: Library,
        gradient: "from-pink-500 to-rose-600",
    },
];

export const TESTIMONIALS = [
    {
        quote: "This platform made it so easy to write and publish my first ebook. The AI assistant is a game-changer!",
        author: "Jane Doe",
        title: "Bestselling Author",
        avatar: `${IMAGE_BASE}/photo-1508214751196-bcfd4ca60f91?w=100&h=100&fit=crop`,
        rating: 5,
    },
    {
        quote: "I love the customizable templates. I was able to create a beautiful ebook that matches my brand perfectly.",
        author: "John Smith",
        title: "Marketing Expert",
        avatar: `${IMAGE_BASE}/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop`,
        rating: 4,
    },
    {
        quote: "The one-click export feature saved me so much time. I was able to publish my ebook on multiple platforms seamlessly.",
        author: "Peter Jones",
        title: "Indie Publisher",
        avatar: `${IMAGE_BASE}/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop`,
        rating: 5,
    },
];
