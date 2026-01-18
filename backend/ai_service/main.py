import logging
import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import uvicorn
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables for models and index
embedding_model = None
faiss_index = None
documents_metadata = [] # In-memory storage for demo purposes, replace with DB in prod

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load model on startup
    global embedding_model, faiss_index
    logger.info("Loading Sentence Transformer model...")
    # Using a small, fast model for CPU inference
    embedding_model = SentenceTransformer('all-MiniLM-L6-v2') 
    
    # Initialize FAISS index
    dimension = 384 # Dimension for all-MiniLM-L6-v2
    faiss_index = faiss.IndexFlatL2(dimension)
    
    logger.info("AI Service Initialized Successfully")
    yield
    # Cleanup on shutdown
    pass

app = FastAPI(title="IntelliLib AI Service", lifespan=lifespan)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], # Adjust ports as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class SearchRequest(BaseModel):
    query: str
    limit: int = 5

class SearchResult(BaseModel):
    id: str
    score: float
    text: str
    metadata: dict

class ChatRequest(BaseModel):
    message: str
    context_docs: List[str] = []

# Endpoints

@app.get("/")
def read_root():
    return {"status": "online", "service": "IntelliLib AI Core"}

@app.post("/api/ai/search", response_model=List[SearchResult])
async def semantic_search(request: SearchRequest):
    if not embedding_model or not faiss_index:
        raise HTTPException(status_code=503, detail="AI Service not fully initialized")

    try:
        # Generate embedding for query
        query_vector = embedding_model.encode([request.query])
        
        # Search in FAISS
        if faiss_index.ntotal == 0:
            return []
            
        k = min(request.limit, faiss_index.ntotal)
        distances, indices = faiss_index.search(np.array(query_vector), k)
        
        results = []
        for i, idx in enumerate(indices[0]):
            if idx == -1: continue
            # In a real app, you'd fetch the doc ID from your mapping/DB
            # For this MVP, we assume documents_metadata aligns with FAISS indices
            if idx < len(documents_metadata):
                doc = documents_metadata[idx]
                results.append(SearchResult(
                    id=doc.get("id", "unknown"),
                    score=float(distances[0][i]),
                    text=doc.get("text", "")[:200] + "...",
                    metadata=doc.get("metadata", {})
                ))
        
        return results
    except Exception as e:
        logger.error(f"Search error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/index-document")
async def index_document(id: str = Form(...), text: str = Form(...), title: str = Form(...)):
    """
    Endpoint to add a document to the vector index.
    In production, this would be called by the Node.js backend when a PDF is uploaded.
    """
    global faiss_index, documents_metadata
    
    if not embedding_model:
         raise HTTPException(status_code=503, detail="AI Service not fully initialized")

    try:
        vector = embedding_model.encode([text])
        faiss_index.add(np.array(vector))
        
        documents_metadata.append({
            "id": id,
            "text": text,
            "metadata": {"title": title}
        })
        
        return {"status": "indexed", "total_documents": faiss_index.ntotal}
    except Exception as e:
        logger.error(f"Indexing error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/chat")
async def chat_assistant(request: ChatRequest):
    """
    Simple mock chat assistant. In Phase 2, connect to OpenAI/LLaMA.
    """
    # Mock response for Phase 1
    return {
        "response": f"I understand you're asking about '{request.message}'. As an AI assistant, I can help you find resources about this topic. Try checking the 'Featured Articles' section.",
        "role": "assistant"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
