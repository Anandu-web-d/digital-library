# IntelliLib - AI-Powered Digital Library System

An advanced digital library platform enhanced with Artificial Intelligence to support intelligent search, semantic discovery, personalized recommendations, academic assistance, and research analytics.

## 🎯 Features

- **Smart Semantic Search**: NLP-based search that understands meaning, not just keywords
- **AI Research Assistant**: Chat-based AI assistant for academic queries
- **Document Summarization**: Automatic AI-powered document summaries
- **Personalized Recommendations**: Content-based filtering and user behavior analysis
- **Citation Generator**: Generate citations in APA, MLA, and Chicago formats
- **Role-Based Access**: Student, Researcher, and Admin roles
- **PDF Management**: Upload, store, and manage academic documents

## 🏗️ Architecture

```
Frontend (React + Tailwind CSS)
    ↓
Backend (Node.js + Express)
    ↓
AI Services (Python + FastAPI)
    ↓
Database (MongoDB + Vector DB)
```

## 📋 Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

**Windows:**
```bash
start-dev.bat
```

**Mac/Linux:**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

### Option 2: Manual Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd unidot
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:3000`

### 4. AI Services Setup

```bash
cd ai-services
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your MongoDB URI and OpenAI API key (optional)
python app.py
```

The AI service will run on `http://localhost:8000`

### 5. MongoDB Setup

Make sure MongoDB is running on your system:

```bash
# Start MongoDB (varies by OS)
mongod
```

Or use MongoDB Atlas (cloud) and update the connection string in `.env` files.

## 📁 Project Structure

```
unidot/
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth middleware
│   │   └── server.js       # Entry point
│   └── package.json
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context
│   │   └── App.jsx         # Main app component
│   └── package.json
├── ai-services/             # Python FastAPI service
│   ├── app.py              # FastAPI application
│   └── requirements.txt     # Python dependencies
└── README.md
```

## 🔐 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/intellib
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
AI_SERVICE_URL=http://localhost:8000
```

### AI Services (.env)
```env
MONGODB_URI=mongodb://localhost:27017/intellib
OPENAI_API_KEY=your_openai_api_key_here
PORT=8000
```

## 🎮 Usage

### User Roles

1. **Student**: Can search, read, summarize, and save documents
2. **Researcher**: Advanced search capabilities and citation help
3. **Admin**: Upload and manage documents

### Key Features

1. **Register/Login**: Create an account with your preferred role
2. **Upload Documents** (Admin only): Upload PDF documents with metadata
3. **Semantic Search**: Search documents using natural language queries
4. **AI Chat**: Ask questions to the AI research assistant
5. **Document Summarization**: Generate AI-powered summaries
6. **Citations**: Generate citations in multiple formats

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Documents
- `GET /api/documents` - Get all documents
- `GET /api/documents/:id` - Get single document
- `POST /api/documents/upload` - Upload document (Admin)
- `POST /api/documents/search` - Semantic search
- `GET /api/documents/recommendations` - Get recommendations

### AI Services
- `POST /api/ai/chat` - Chat with AI assistant
- `POST /api/ai/summarize/:documentId` - Summarize document
- `POST /api/ai/citation` - Generate citation

## 🧪 Development Phases

### Phase 1: Core System ✅
- User authentication
- PDF upload & storage
- Metadata management
- Basic UI

### Phase 2: Semantic Search ✅
- Text extraction from PDFs
- Generate embeddings
- Vector database setup
- Semantic search API

### Phase 3: AI Intelligence Layer ✅
- AI chatbot integration
- Summarization engine
- Recommendation logic

### Phase 4: Optimization & Research Features (In Progress)
- Analytics dashboard
- Advanced citation generator
- Performance tuning
- Deployment

## 🛠️ Technology Stack

### Frontend
- React.js
- Tailwind CSS
- Axios
- React Router

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication

### AI/ML
- Python
- FastAPI
- Sentence-BERT (all-MiniLM-L6-v2)
- FAISS (Vector DB)
- OpenAI API (optional)

## 📝 Notes

- The AI service uses Sentence-BERT for embeddings (no GPU required for inference)
- OpenAI API is optional but recommended for better chat and summarization
- FAISS is used for vector similarity search (CPU version included)
- For production, consider using Pinecone or similar managed vector DB

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Sentence-Transformers by UKP Lab
- FAISS by Facebook Research
- OpenAI for GPT models

