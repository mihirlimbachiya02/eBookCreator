<div align="center">

# 📚 eBook Creator

### AI-Powered eBook Creation & Book Management Platform

Create, write, and publish professional eBooks with the power of AI.  
Generate outlines, write chapters, design covers, export in multiple formats,  
and manage your entire personal book library in one place.

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)

</div>

---

## ✨ Features

### AI eBook Creation
- 🤖 **AI Outline Generation** — Generate complete book outlines using Google Gemini
- ✍️ **Chapter Editor** — Full markdown editor with live preview and syntax highlighting
- 🎨 **AI Cover Generation** — Generate professional book covers using Pollinations AI (free, unlimited)
- 📤 **One-Click Export** — Export your book as PDF or DOCX with proper formatting
- 🖼️ **Cover Management** — Upload custom covers from device, pick from Cloudinary library, or generate with AI

### Book Upload & Library
- 📁 **Upload from Device** — Upload books directly from your local machine
- 🔗 **Import from URL** — Import books from any direct download link
- ☁️ **Google Drive Import** — Pick files directly from your Google Drive
- 📖 **Built-in PDF Viewer** — Read PDFs in-browser with page navigation, zoom, and auto-fit
- 📥 **Download Support** — Download EPUB, MOBI, ZIP files with a single click
- ✏️ **Edit Book Details** — Update title, format, source, and cover image for uploaded books
- 🗂️ **Supported Formats** — PDF, EPUB, MOBI, HTML, ZIP

### Dashboard & Navigation
- 📊 **Unified Dashboard** — Separate sections for AI-created and uploaded books
- 🔤 **Quick Navigation** — Navbar links to jump between AI eBooks and Uploaded Books sections
- 🃏 **Book Cards** — Immersive 2:3 ratio cards with hover actions, cover images, and format badges
- 🗑️ **Safe Deletion** — Confirmation modals before deleting any book

### Platform
- 👤 **User Authentication** — Secure JWT-based auth with token versioning and session management
- 📱 **Responsive Design** — Works on desktop and mobile
- 🔒 **Secure** — Rate limiting, input validation, XSS protection, CORS, and more

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI Framework |
| Vite 8 | Build Tool |
| TailwindCSS | Styling |
| Axios | API Calls |
| DOMPurify | XSS Protection |
| md-editor-rt | Markdown Editor |
| DnD Kit | Drag & Drop |
| pdfjs-dist | In-browser PDF Rendering |

### Backend
| Technology | Purpose |
|---|---|
| Node.js 22 | Runtime |
| Express 5 | Web Framework |
| MongoDB + Mongoose | Database |
| JWT | Authentication |
| Helmet | Security Headers |
| Zod | Input Validation |
| PDFKit | PDF Generation |
| docx | DOCX Generation |
| multer-storage-cloudinary | File Upload to Cloudinary |
| axios | Server-side file streaming/proxy |

### External Services
| Service | Purpose |
|---|---|
| Google Gemini API | AI Text Generation |
| Pollinations AI | AI Cover Image Generation (free) |
| Cloudinary | Image & Book File Storage |
| MongoDB Atlas | Cloud Database |
| Google Drive API | Drive file import (optional) |
| Google Picker API | Drive file picker UI (optional) |

---

## 📁 Project Structure

```text
eBookCreator/
├── backend/
│   ├── config/
│   │   ├── cloudinary.js          # Image + raw file upload config
│   │   └── db.js
│   ├── controller/
│   │   ├── aiController.js        # Gemini + Pollinations AI
│   │   ├── authController.js
│   │   ├── bookController.js
│   │   ├── exportController.js
│   │   └── uploadedBookController.js  
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── models/
│   │   ├── Book.js
│   │   ├── UploadedBook.js        
│   │   └── User.js
│   ├── routes/
│   │   ├── aiRoute.js
│   │   ├── authRoute.js
│   │   ├── bookRoute.js
│   │   ├── exportRoutes.js
│   │   └── uploadedBookRoutes.js  
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── public/
    │   ├── apple-touch-icon.png
    │   ├── favicon.ico
    │   └── favicon.svg
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── index.css
    │   ├── assets/
    │   │   ├── hero-img.png
    │   │   └── icon.png
    │   ├── components/
    │   │   ├── auth/
    │   │   │   └── ProtectedRoute.jsx
    │   │   ├── cards/
    │   │   │   ├── BookCard.jsx
    │   │   │   └── UploadedBookCard.jsx  
    │   │   ├── editor/
    │   │   │   ├── BookDetailsTab.jsx
    │   │   │   ├── ChapterEditorTab.jsx
    │   │   │   ├── ChapterSidebar.jsx
    │   │   │   ├── SimpleMDEEditor.jsx
    │   │   │   └── simpleMDEEditor.css
    │   │   ├── landing/
    │   │   │   ├── Features.jsx
    │   │   │   ├── Footer.jsx
    │   │   │   ├── Hero.jsx
    │   │   │   └── Testimonials.jsx
    │   │   ├── layout/
    │   │   │   ├── DasboardLayout.jsx    
    │   │   │   ├── Navbar.jsx
    │   │   │   └── ProfileDropdown.jsx
    │   │   ├── modals/
    │   │   │   ├── CreateBookModal.jsx
    │   │   │   ├── EditUploadedBookModal.jsx  
    │   │   │   └── UploadBookModal.jsx        
    │   │   ├── ui/
    │   │   │   ├── Button.jsx
    │   │   │   ├── Dropdown.jsx
    │   │   │   ├── index.js
    │   │   │   ├── InputField.jsx
    │   │   │   ├── Modal.jsx
    │   │   │   ├── SelectField.jsx
    │   │   │   └── TextareaField.jsx
    │   │   └── view/
    │   │       ├── ViewBook.jsx
    │   │       ├── ViewBookSkeleton.jsx
    │   │       └── ViewChapterSidebar.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   ├── AuthProvider.jsx
    │   │   └── useAuth.js
    │   ├── pages/
    │   │   ├── DashboardPage.jsx           # AI books + uploaded books sections
    │   │   ├── EditorPage.jsx
    │   │   ├── LandingPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── ProfilePage.jsx
    │   │   ├── SignupPage.jsx
    │   │   ├── ViewBookPage.jsx
    │   │   └── ViewUploadedBookPage.jsx    
    │   └── utils/
    │       ├── apiPaths.js
    │       ├── axiosInstance.js
    │       ├── data.js
    │       ├── helper.js
    │       └── uploadedBooksApi.js
    ├── .env.example 
    ├── index.html       
    ├── eslint.config.js
    ├── package.json
    └── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 22+
- MongoDB Atlas account
- Google Gemini API key
- Cloudinary account


### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Fill in your environment variables in .env
# Then start the server
node server.js
```

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Fill in your environment variables in .env
# Then start the dev server
npm run dev
```

---

## ⚙️ Environment Variables

### Backend `.env`

```env
# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/yourdbname

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=set_you_token_expire_here

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here
AI_MODEL=your_ai_model

# Cloudinary (image + book file storage)
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

# Server
PORT=your_port_number
FRONTEND_URL=your_frontend_url_here
```

### Frontend `.env`

```env
VITE_API_URL=your_backend_url_here
---

## 📖 API Routes

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout and invalidate token |
| GET | `/api/auth/profile` | Get current user profile |
| PUT | `/api/auth/profile` | Update user profile |

### AI eBooks
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/books` | Get all AI books for user |
| POST | `/api/books` | Create new book |
| GET | `/api/books/:id` | Get book by ID |
| PUT | `/api/books/:id` | Update book |
| DELETE | `/api/books/:id` | Delete book |
| PUT | `/api/books/cover/:id` | Update book cover |
| GET | `/api/books/cloudinary/covers` | List covers from Cloudinary library |

### AI Features
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ai/generate-outline` | Generate book outline |
| POST | `/api/ai/generate-chapter-content` | Generate chapter content |
| POST | `/api/ai/generate` | Generate custom text |
| POST | `/api/ai/generate-cover` | Generate AI cover (Pollinations AI) |

### Export
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/export/:id/pdf` | Export book as PDF |
| GET | `/api/export/:id/doc` | Export book as DOCX |

### Uploaded Books (NEW)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/uploaded-books` | Get all uploaded books for user |
| POST | `/api/uploaded-books/upload` | Upload book from device |
| POST | `/api/uploaded-books/import-url` | Import book from URL |
| POST | `/api/uploaded-books/import-drive` | Import book from Google Drive |
| GET | `/api/uploaded-books/proxy/:id` | Proxy stream book file (for PDF viewer) |
| PUT | `/api/uploaded-books/:id` | Update book metadata + cover |
| DELETE | `/api/uploaded-books/:id` | Delete book |

---

## 🗂️ Cloudinary Folder Structure

```
cloudinary/
└── ebook-creator/
    ├── books/           ← AI book cover images
    ├── profiles/        ← User profile pictures
    └── uploaded-books/  ← Uploaded book files (raw: PDF, EPUB, MOBI, HTML, ZIP)
```

---

## 🔒 Security Features

- ✅ JWT authentication with token versioning 
- ✅ Rate limiting on all routes
- ✅ Input validation with Zod
- ✅ XSS protection with DOMPurify
- ✅ Helmet security headers with CSP
- ✅ CORS restricted to frontend URL
- ✅ File upload validation (type and size limits — 50MB for books, 10MB for covers)
- ✅ bcrypt password hashing (cost factor 12)
- ✅ No sensitive data in error responses
- ✅ MongoDB injection prevention via Mongoose ORM
- ✅ Token invalidation on logout
- ✅ Authenticated proxy for book file access

---

## 📦 Build for Production

```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
node server.js
```

---

## Acknowledgements

- [Google Gemini](https://ai.google.dev/) for AI text generation
- [Pollinations AI](https://pollinations.ai/) for free AI image generation
- [Cloudinary](https://cloudinary.com/) for image and file storage
- [MongoDB Atlas](https://www.mongodb.com/atlas) for cloud database
- [PDF.js](https://mozilla.github.io/pdf.js/) for in-browser PDF rendering

---
