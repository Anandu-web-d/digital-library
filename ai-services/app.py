from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
import io
from sentence_transformers import SentenceTransformer
import numpy as np
import faiss
import json
from datetime import datetime
import pymongo
from openai import OpenAI

# PDF parsing setup
try:
    import PyPDF2
    PDF_PARSER = 'PyPDF2'
except:
    try:
        import pdfplumber
        PDF_PARSER = 'pdfplumber'
    except:
        PDF_PARSER = None

load_dotenv()

app = FastAPI(title="IntelliLib AI Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize models
print("Loading AI models...")
try:
    model = SentenceTransformer('all-MiniLM-L6-v2')
    print("Sentence transformer model loaded successfully")
except Exception as e:
    print(f"Error loading sentence transformer: {e}")
    model = None

# Initialize OpenAI client (optional, for advanced features)
openai_client = None
if os.getenv("OPENAI_API_KEY"):
    try:
        openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        print("OpenAI client initialized")
    except Exception as e:
        print(f"OpenAI initialization error: {e}")

# MongoDB connection
mongo_client = None
db = None
try:
    mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/intellib")
    mongo_client = pymongo.MongoClient(mongo_uri)
    db = mongo_client.intellib
    print("MongoDB connected")
except Exception as e:
    print(f"MongoDB connection error: {e}")

# In-memory vector store (for demo - use Pinecone/FAISS in production)
vector_store = {}
document_embeddings = {}
index = None
dimension = 384  # Dimension for all-MiniLM-L6-v2

# Initialize FAISS index
try:
    index = faiss.IndexFlatL2(dimension)
    print("FAISS index initialized")
except Exception as e:
    print(f"FAISS initialization error: {e}")

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None
    userId: Optional[str] = None
    userRole: Optional[str] = None

class SearchRequest(BaseModel):
    query: str
    userId: Optional[str] = None

class SummarizeRequest(BaseModel):
    documentId: str
    text: Optional[str] = None

def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF file"""
    try:
        pdf_file = io.BytesIO(file_content)
        text = ""
        
        if PDF_PARSER == 'PyPDF2':
            import PyPDF2
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        elif PDF_PARSER == 'pdfplumber':
            import pdfplumber
            with pdfplumber.open(pdf_file) as pdf:
                for page in pdf.pages:
                    text += page.extract_text() + "\n"
        else:
            # Fallback: return placeholder
            text = "PDF text extraction not available. Please install PyPDF2 or pdfplumber."
        
        return text
    except Exception as e:
        print(f"PDF extraction error: {e}")
        return ""

def generate_embedding(text: str) -> np.ndarray:
    """Generate embedding for text"""
    if model is None:
        raise HTTPException(status_code=500, detail="AI model not loaded")
    embedding = model.encode(text, convert_to_numpy=True)
    return embedding

@app.get("/")
def root():
    return {"message": "IntelliLib AI Service", "status": "running"}

@app.post("/api/ai/process-document")
async def process_document(file: UploadFile = File(...), documentId: str = Form(None)):
    """Process uploaded document: extract text and generate embeddings"""
    try:
        if not documentId:
            raise HTTPException(status_code=400, detail="documentId is required")

        # Read file content
        file_content = await file.read()

        # Extract text from PDF
        text = extract_text_from_pdf(file_content)
        if not text:
            return {"success": False, "message": "Could not extract text from PDF"}

        # Generate embedding
        embedding = generate_embedding(text[:1000])  # Use first 1000 chars for embedding

        # Store embedding in FAISS index
        if index is not None:
            embedding_2d = embedding.reshape(1, -1)
            index.add(embedding_2d.astype('float32'))
            vector_store[documentId] = len(vector_store)
            document_embeddings[documentId] = {
                "embedding": embedding.tolist(),
                "text": text[:500],  # Store preview
                "timestamp": datetime.now().isoformat()
            }

        # Update MongoDB document
        if db:
            db.documents.update_one(
                {"_id": documentId},
                {
                    "$set": {
                        "extractedText": text,
                        "status": "processed",
                        "updatedAt": datetime.now()
                    }
                }
            )

        return {
            "success": True,
            "message": "Document processed successfully",
            "textLength": len(text),
            "documentId": documentId
        }
    except Exception as e:
        print(f"Processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/semantic-search")
async def semantic_search(request: SearchRequest):
    """Perform semantic search using embeddings"""
    try:
        if not model:
            raise HTTPException(status_code=500, detail="AI model not loaded")

        # Generate query embedding
        query_embedding = generate_embedding(request.query)
        query_embedding_2d = query_embedding.reshape(1, -1).astype('float32')

        # Search in FAISS index
        document_ids = []
        if index is not None and index.ntotal > 0:
            k = min(10, index.ntotal)  # Return top 10 results
            distances, indices = index.search(query_embedding_2d, k)

            # Get document IDs from vector store
            reverse_map = {v: k for k, v in vector_store.items()}
            for idx in indices[0]:
                if idx in reverse_map:
                    document_ids.append(reverse_map[idx])

        # Fallback: search MongoDB by text if no vector results
        if not document_ids and db:
            # Simple keyword-based fallback
            results = db.documents.find(
                {"$text": {"$search": request.query}, "status": "published"}
            ).limit(10)
            document_ids = [str(doc["_id"]) for doc in results]

        return {
            "success": True,
            "documentIds": document_ids,
            "query": request.query
        }
    except Exception as e:
        print(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/chat")
async def chat(request: ChatRequest):
    """AI chatbot for academic queries"""
    try:
        message = request.message
        context = request.context or ""

        # Use OpenAI if available, otherwise simple response
        if openai_client:
            try:
                response = openai_client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {
                            "role": "system",
                            "content": "You are an AI research assistant for IntelliLib, an academic digital library. Help users with research questions, explain concepts, and suggest relevant academic resources. Always provide accurate, scholarly information."
                        },
                        {
                            "role": "user",
                            "content": f"{context}\n\nUser question: {message}"
                        }
                    ],
                    max_tokens=500,
                    temperature=0.7
                )
                return {
                    "success": True,
                    "response": response.choices[0].message.content,
                    "message": response.choices[0].message.content
                }
            except Exception as e:
                print(f"OpenAI error: {e}")

        # Fallback response
        return {
            "success": True,
            "response": f"I understand you're asking about: {message}. For detailed academic assistance, please ensure OpenAI API key is configured. In the meantime, you can search our document library for relevant resources.",
            "message": f"I understand you're asking about: {message}. For detailed academic assistance, please ensure OpenAI API key is configured."
        }
    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/summarize")
async def summarize(request: SummarizeRequest):
    """Summarize document using AI"""
    try:
        document_id = request.documentId
        text = request.text

        # Get text from MongoDB if not provided
        if not text and db:
            doc = db.documents.find_one({"_id": document_id})
            if doc:
                text = doc.get("extractedText", "")

        if not text:
            raise HTTPException(status_code=400, detail="No text available for summarization")

        # Use OpenAI for summarization if available
        if openai_client:
            try:
                response = openai_client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {
                            "role": "system",
                            "content": "You are an academic summarization assistant. Provide concise, accurate summaries of academic documents."
                        },
                        {
                            "role": "user",
                            "content": f"Please summarize the following academic document:\n\n{text[:3000]}"
                        }
                    ],
                    max_tokens=300,
                    temperature=0.5
                )
                summary = response.choices[0].message.content
                return {
                    "success": True,
                    "summary": summary
                }
            except Exception as e:
                print(f"OpenAI summarization error: {e}")

        # Simple extractive summarization fallback
        sentences = text.split('.')
        summary = '. '.join(sentences[:3]) + '.'
        if len(summary) > 500:
            summary = summary[:500] + '...'

        return {
            "success": True,
            "summary": summary
        }
    except Exception as e:
        print(f"Summarization error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ai/recommendations")
async def get_recommendations(userId: str = None):
    """Get personalized document recommendations"""
    try:
        document_ids = []

        # Simple recommendation: return recent documents
        # In production, use collaborative filtering or content-based filtering
        if db:
            # Get user's search history for personalization
            if userId:
                user = db.users.find_one({"_id": userId})
                if user and user.get("searchHistory"):
                    # Use recent searches to find similar documents
                    recent_query = user["searchHistory"][-1].get("query", "")
                    if recent_query:
                        query_embedding = generate_embedding(recent_query)
                        query_embedding_2d = query_embedding.reshape(1, -1).astype('float32')
                        
                        if index is not None and index.ntotal > 0:
                            k = min(5, index.ntotal)
                            distances, indices = index.search(query_embedding_2d, k)
                            reverse_map = {v: k for k, v in vector_store.items()}
                            for idx in indices[0]:
                                if idx in reverse_map:
                                    document_ids.append(reverse_map[idx])

            # Fallback: get recent published documents
            if not document_ids:
                results = db.documents.find({"status": "published"}).sort("createdAt", -1).limit(10)
                document_ids = [str(doc["_id"]) for doc in results]

        return {
            "success": True,
            "documentIds": document_ids
        }
    except Exception as e:
        print(f"Recommendations error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

