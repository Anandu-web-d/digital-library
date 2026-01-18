# IntelliLib Project Structure

## Directory Overview

```
unidot/
├── backend/                    # Node.js/Express Backend API
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   │   └── database.js    # MongoDB connection
│   │   ├── controllers/       # Route controllers
│   │   │   ├── authController.js
│   │   │   ├── documentController.js
│   │   │   └── aiController.js
│   │   ├── models/            # MongoDB models
│   │   │   ├── User.js
│   │   │   └── Document.js
│   │   ├── routes/            # API routes
│   │   │   ├── authRoutes.js
│   │   │   ├── documentRoutes.js
│   │   │   └── aiRoutes.js
│   │   ├── middleware/        # Express middleware
│   │   │   └── auth.js         # JWT authentication
│   │   ├── utils/             # Utility functions
│   │   │   └── generateToken.js
│   │   └── server.js          # Entry point
│   ├── uploads/               # Uploaded PDF files (gitignored)
│   ├── package.json
│   └── .env                   # Environment variables (gitignored)
│
├── frontend/                   # React Frontend Application
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   └── PrivateRoute.jsx
│   │   ├── pages/             # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Documents.jsx
│   │   │   ├── DocumentDetail.jsx
│   │   │   ├── Upload.jsx
│   │   │   └── AIChat.jsx
│   │   ├── context/           # React Context
│   │   │   └── AuthContext.jsx
│   │   ├── App.jsx            # Main app component
│   │   ├── main.jsx           # Entry point
│   │   └── index.css          # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── ai-services/                # Python FastAPI AI Service
│   ├── app.py                 # FastAPI application
│   ├── requirements.txt       # Python dependencies
│   ├── venv/                  # Virtual environment (gitignored)
│   └── .env                   # Environment variables (gitignored)
│
├── database/                   # Database scripts (if any)
├── docs/                       # Documentation
├── README.md                   # Main documentation
├── SETUP.md                    # Setup instructions
├── PROJECT_STRUCTURE.md        # This file
├── start-dev.sh               # Startup script (Mac/Linux)
├── start-dev.bat              # Startup script (Windows)
└── .gitignore                 # Git ignore rules
```

## Key Files Explained

### Backend (`backend/`)

- **server.js**: Main Express server, sets up routes and middleware
- **models/**: Mongoose schemas for User and Document
- **controllers/**: Business logic for each route
- **routes/**: API endpoint definitions
- **middleware/auth.js**: JWT authentication middleware

### Frontend (`frontend/`)

- **App.jsx**: Main React component with routing
- **pages/**: Individual page components
- **context/AuthContext.jsx**: Global authentication state
- **components/**: Reusable UI components

### AI Services (`ai-services/`)

- **app.py**: FastAPI application with AI endpoints
- Handles semantic search, summarization, chat, and recommendations
- Uses Sentence-BERT for embeddings
- FAISS for vector similarity search

## Data Flow

1. **User Registration/Login**: Frontend → Backend → MongoDB
2. **Document Upload**: Frontend → Backend → Local Storage → AI Service (processing)
3. **Semantic Search**: Frontend → Backend → AI Service → Vector DB → MongoDB
4. **AI Chat**: Frontend → Backend → AI Service → OpenAI (optional)
5. **Document Summarization**: Frontend → Backend → AI Service → OpenAI/MLLM

## API Flow

```
Frontend (React)
    ↓ HTTP Requests
Backend (Express)
    ↓ Business Logic
MongoDB (Metadata) + AI Service (Embeddings)
    ↓
Response to Frontend
```

## Environment Variables

### Backend `.env`
- `PORT`: Backend server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT tokens
- `AI_SERVICE_URL`: URL of AI service

### AI Services `.env`
- `MONGODB_URI`: MongoDB connection string
- `OPENAI_API_KEY`: OpenAI API key (optional)
- `PORT`: AI service port (default: 8000)

## Database Schema

### Users Collection
- `_id`: ObjectId
- `name`: String
- `email`: String (unique)
- `password`: String (hashed)
- `role`: Enum ['student', 'researcher', 'admin']
- `savedDocuments`: Array of Document IDs
- `searchHistory`: Array of search queries
- `preferences`: Object

### Documents Collection
- `_id`: ObjectId
- `title`: String
- `description`: String
- `author`: String
- `category`: String
- `tags`: Array of Strings
- `fileUrl`: String
- `extractedText`: String
- `summary`: String
- `embeddingId`: String (reference to vector DB)
- `uploadedBy`: ObjectId (User reference)
- `status`: Enum ['pending', 'processed', 'published', 'archived']

## Vector Database

- Uses FAISS (Facebook AI Similarity Search) for in-memory vector storage
- Each document embedding is 384 dimensions (all-MiniLM-L6-v2)
- For production, consider Pinecone or similar managed service

