# IntelliLib Setup Guide

## Quick Start Instructions

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- MongoDB (v4.4+)
- npm/yarn

### Step 1: Backend Setup

```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb://localhost:27017/intellib
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
AI_SERVICE_URL=http://localhost:8000
EOF

# Start backend
npm run dev
```

Backend runs on: http://localhost:5000

### Step 2: Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:3000

### Step 3: AI Services Setup

```bash
cd ai-services

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/intellib
OPENAI_API_KEY=your_openai_api_key_here_optional
PORT=8000
EOF

# Start AI service
python app.py
```

AI Service runs on: http://localhost:8000

### Step 4: MongoDB Setup

**Option A: Local MongoDB**
```bash
# Start MongoDB service (varies by OS)
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update MONGODB_URI in .env files

### Step 5: Test the Application

1. Open http://localhost:3000
2. Register a new account (choose Admin role for upload access)
3. Login
4. Upload a PDF document (Admin only)
5. Search documents semantically
6. Chat with AI assistant

## Troubleshooting

### Backend Issues
- Ensure MongoDB is running
- Check .env file configuration
- Verify port 5000 is available

### Frontend Issues
- Clear browser cache
- Check console for errors
- Verify backend is running

### AI Service Issues
- Install PyPDF2: `pip install PyPDF2`
- Check Python version (3.8+)
- Verify sentence-transformers downloads model on first run
- OpenAI API key is optional but recommended

### Common Errors

**"MongoDB connection error"**
- Ensure MongoDB is running
- Check connection string in .env

**"AI model not loaded"**
- First run downloads model (~80MB)
- Check internet connection
- Wait for model download to complete

**"PDF extraction not available"**
- Install PyPDF2: `pip install PyPDF2`
- Or install pdfplumber: `pip install pdfplumber`

## Development Notes

- Backend API: http://localhost:5000/api
- Frontend: http://localhost:3000
- AI Service: http://localhost:8000
- MongoDB: localhost:27017

## Next Steps

1. Configure OpenAI API key for better AI features
2. Set up production MongoDB
3. Configure cloud storage for PDFs
4. Deploy to cloud platform

