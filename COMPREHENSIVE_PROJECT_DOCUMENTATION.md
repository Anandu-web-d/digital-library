# IntelliLib: Complete Project Documentation

This document provides a comprehensive technical and functional overview of the IntelliLib project. It serves as the primary source of truth for understanding, developing, and deploying the application.

---

## 1. Executive Summary

**IntelliLib** is an advanced AI-powered digital library system designed to revolutionize how academic and research documents are managed, discovered, and utilized. Unlike traditional libraries that rely on keyword matching, IntelliLib leverages **Sematic Search (NLP)** to understand the *meaning* behind user queries.

Key differentiators include an **AI Research Assistant** for interactive learning, **Automated Summarization** for quick insights, and a personalized **Recommendation Engine**.

**Design Philosophy**: The application features a strict **Black & White High-Contrast Theme** (WCAG AAA compliant), ensuring a clean, professional, and accessible user experience suitable for academic environments.

---

## 2. System Architecture

IntelliLib follows a modern microservices-inspired 3-tier architecture:

```mermaid
graph TD
    Client[Frontend Client] <-->|HTTP/JSON| Backend[Backend API Gateway]
    Backend <-->|Mongoose| MongoDB[(MongoDB Database)]
    Backend <-->|Internal HTTP| AIService[AI Microservice]
    AIService <-->|Vector Ops| VectorDB[(FAISS/Vector DB)]
    AIService -->|Inference| HuggingFace[HuggingFace Models]
    AIService -.->|External API| OpenAI[OpenAI API (Optional)]
```

### Components:
1.  **Frontend**: Single Page Application (SPA) built with React.js and Tailwind CSS.
2.  **Backend**: Node.js/Express REST API handling business logic, auth, and data persistence.
3.  **AI Service**: Python FastAPI service handling CPU-intensive ML tasks (embeddings, inference).
4.  **Database**: MongoDB for structured data (Users, Metadata) and FAISS for vector similarity.

---

## 3. Technology Stack & Dependencies

### Frontend (`/frontend`)
*   **Framework**: React.js 18+ (Vite)
*   **Styling**: Tailwind CSS (Custom Config)
*   **State Management**: React Context API
*   **Routing**: React Router DOM v6
*   **HTTP Client**: Axios
*   **Key Libraries**: `lucide-react` (icons), `framer-motion` (animations).

### Backend (`/backend`)
*   **Runtime**: Node.js v16+
*   **Framework**: Express.js
*   **Database ODM**: Mongoose
*   **Authentication**: JWT (JSON Web Tokens) + BCrypt
*   **File Handling**: Multer (PDF uploads)
*   **Validation**: Joi (optional/in-progress)

### AI Services (`/ai-services`)
*   **Framework**: FastAPI (Python 3.10+)
*   **ML Libraries**: `sentence-transformers`, `torch`, `scikit-learn`
*   **Vector Search**: `faiss-cpu` (Facebook AI Similarity Search)
*   **PDF Processing**: `pypdf`, `pdfminer`
*   **LLM Interface**: `openai` (optional), `transformers`

### Infrastructure
*   **Database**: MongoDB (Local or Atlas)
*   **Vector Store**: Local FAISS index (saved to disk) or Cloud (Pinecone)

---

## 4. Technical Implementation Details

### A. Authentication & Security
*   **Role-Based Access Control (RBAC)**: Users are assigned roles:
    *   `Student`: Basic search, view, semantic features.
    *   `Researcher`: Adanced citation tools, analytics.
    *   `Admin`: Document upload, user management.
*   **Token Flow**: Access tokens are issued on login (exp: 7d). Protected routes verify the token via middleware (`auth.js`).

### B. The AI Core (Semantic Search)
1.  **Ingestion**: When a PDF is uploaded (Admin), the AI Service extracts text.
2.  **Embedding**: Text is chunked and passed through `all-MiniLM-L6-v2` (Sentence-BERT).
3.  **Vector Storage**: The resulting 384-dimensional vector is stored in FAISS.
4.  **Querying**: User queries are converted to vectors and compared using Cosine Similarity.

### C. UI Theme System (Black & White)
The application enforces a strict monochromatic palette defined in `index.css`:
*   `--bg-primary`: #000000
*   `--text-primary`: #ffffff
*   `--card-bg`: #1a1a1a
*   `--accent`: #fafafa (High contrast interactions)

### D. Database Schema

#### `Users` Collection
| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Display name |
| `email` | String | Unique login identifier |
| `password` | String | Hashed password |
| `role` | Enum | 'student', 'researcher', 'admin' |

#### `Documents` Collection
| Field | Type | Description |
|-------|------|-------------|
| `title` | String | Document title |
| `extractedText`| String | Full text for processing |
| `embeddingId` | String | Reference to Vector DB index |
| `fileUrl` | String | Path to stored PDF |
| `status` | Enum | 'processing', 'ready', 'error' |

---

## 5. Installation & Setup Guide

### Prerequisites
*   Node.js (v18+)
*   Python (v3.10+)
*   MongoDB (Running locally on 27017 or Cloud URI)

### Step 1: Clone & Configure
```bash
git clone <repo_url>
cd unidot
```

### Step 2: Backend Setup
```bash
cd backend
npm install
# Create .env file
echo "PORT=5000" > .env
echo "MONGODB_URI=mongodb://localhost:27017/intellib" >> .env
echo "JWT_SECRET=dev_secret_key_123" >> .env
npm run dev
```

### Step 3: AI Service Setup
```bash
cd ../ai-services
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
# Create .env file
echo "PORT=8000" > .env
python app.py
```

### Step 4: Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

**Quick Start**: You can also use the `start-dev.bat` (Windows) or `./start-dev.sh` (Mac/Linux) scripts in the root directory to launch all services.

---

## 6. Project Structure

```text
unidot/
├── backend/                # Node.js API
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Database Schemas
│   │   ├── routes/         # Endpoint definitions
│   │   └── server.js       # App entry point
│   └── uploads/            # Local storage for PDFs
├── frontend/               # React App
│   ├── src/
│   │   ├── components/     # Reusable UI elements
│   │   ├── pages/          # Route views
│   │   └── context/        # State (Auth)
├── ai-services/            # Python ML Service
│   ├── app.py             # FastAPI entry point
│   └── models/            # ML model logic
└── docs/                   # Additional documentation
```

---

## 7. API Reference

### Auth Endpoints
*   `POST /api/auth/register`: Create account
*   `POST /api/auth/login`: Get JWT token

### Document Endpoints
*   `POST /api/documents/upload`: Multipart form upload (Admin)
*   `GET /api/documents`: List docs with pagination
*   `POST /api/documents/search`: Semantic search payload `{ query: "string" }`

### AI Endpoints (via Backend Proxy)
*   `POST /api/ai/chat`: Interactive chat context
*   `POST /api/ai/summarize`: Generate summary for doc ID

---

## 8. Development Implementation Status

| Feature | Phase | Status | Notes |
|---------|-------|--------|-------|
| Auth & RBAC | 1 | ✅ Complete | Using JWT |
| Doc Upload  | 2 | 🚧 In Progress | Basic multer setup done |
| Semantic Search | 3 | 🚧 Partial | Embeddings logic scaffolded |
| AI Chat | 4 | 📅 Planned | Needs OpenAI/LLM integration |
| Analytics | 4 | 📅 Planned | Future release |

---

## 9. Troubleshooting

**Q: Backend cannot connect to AI Service?**
*   **A**: Ensure the AI service is running on Port 8000. Check `AI_SERVICE_URL` in backend `.env`.

**Q: "Module not found" in Frontend?**
*   **A**: Run `npm install` inside the `frontend` directory again.

**Q: MongoDB Authentication Failed?**
*   **A**: Check your connection string. If using local, ensure `mongod` service is started.
