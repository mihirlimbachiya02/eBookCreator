<div align="center">

# 📚 eBook Creator

### AI-Powered eBook Creation Platform

Create, write, and publish professional eBooks with the power of AI.  
Generate outlines, write chapters, design covers, and export in multiple formats.

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)

</div>

---

## ✨ Features

- 🤖 **AI Outline Generation** — Generate complete book outlines using Google Gemini
- ✍️ **Chapter Editor** — Full markdown editor with live preview and syntax highlighting
- 🎨 **AI Cover Generation** — Generate professional book covers using Stability AI
- 📤 **One-Click Export** — Export your book as PDF or DOCX with proper formatting
- 🖼️ **Cover Upload** — Upload custom cover images stored on Cloudinary
- 👤 **User Authentication** — Secure JWT-based auth with session management
- 📱 **Responsive Design** — Works on desktop and mobile
- 🔒 **Secure** — Rate limiting, input validation, XSS protection, and more

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

### External Services
| Service | Purpose |
|---|---|
| Google Gemini API | AI Text Generation |
| Stability AI | AI Cover Image Generation |
| Cloudinary | Image Storage |
| MongoDB Atlas | Cloud Database |

---

## 📁 Project Structure

eBookCreator/
├── backend/
│   ├── config/
│   │   ├── cloudinary.js
│   │   └── db.js
│   ├── controller/
│   │   ├── aiController.js
│   │   ├── authController.js
│   │   ├── bookController.js
│   │   └── exportController.js
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── models/
│   │   ├── Book.js
│   │   └── User.js
│   ├── routes/
│   │   ├── aiRoute.js
│   │   ├── authRoute.js
│   │   ├── bookRoute.js
│   │   └── exportRoutes.js
│   ├── .env.example
│   └── server.js
│
└── frontend/
└── src/
├── components/
│   ├── auth/
│   ├── cards/
│   ├── editor/
│   ├── landing/
│   ├── layout/
│   ├── modals/
│   ├── ui/
│   └── view/
├── context/
├── pages/
└── utils/


---

## 🚀 Getting Started

### Prerequisites

- Node.js 22+
- MongoDB Atlas account
- Google Gemini API key
- Stability AI API key
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

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here
AI_MODEL=gemini-2.5-flash

# Stability AI (for cover image generation)
STABILITY_API_KEY=your_stability_api_key_here

# Cloudinary (image storage)
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

# Server
PORT=your_port
FRONTEND_URL=your_frontend_URL
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:8000
```

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

### Books
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/books` | Get all books for user |
| POST | `/api/books` | Create new book |
| GET | `/api/books/:id` | Get book by ID |
| PUT | `/api/books/:id` | Update book |
| DELETE | `/api/books/:id` | Delete book |
| PUT | `/api/books/cover/:id` | Update book cover |

### AI
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ai/generate-outline` | Generate book outline |
| POST | `/api/ai/generate-chapter-content` | Generate chapter content |
| POST | `/api/ai/generate` | Generate custom text |
| POST | `/api/ai/generate-cover` | Generate AI cover image |

### Export
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/export/:id/pdf` | Export book as PDF |
| GET | `/api/export/:id/doc` | Export book as DOCX |

---

## 🔒 Security Features

- ✅ JWT authentication with token versioning
- ✅ Rate limiting on all routes
- ✅ Input validation with Zod
- ✅ XSS protection with DOMPurify
- ✅ Helmet security headers with CSP
- ✅ CORS restricted to frontend URL
- ✅ File upload validation (type and size limits)
- ✅ bcrypt password hashing (cost factor 12)
- ✅ No sensitive data in error responses
- ✅ MongoDB injection prevention via Mongoose ORM
- ✅ Token invalidation on logout

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
- [Stability AI](https://stability.ai/) for AI image generation
- [Cloudinary](https://cloudinary.com/) for image storage
- [MongoDB Atlas](https://www.mongodb.com/atlas) for cloud database

---

<div align="center">

</div>
