#!/bin/bash

# IntelliLib Development Startup Script
# This script starts all services for development

echo "🚀 Starting IntelliLib Development Environment..."

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB doesn't appear to be running. Please start MongoDB first."
    echo "   Run: mongod"
    exit 1
fi

# Start Backend
echo "📦 Starting Backend..."
cd backend
npm install > /dev/null 2>&1
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start Frontend
echo "⚛️  Starting Frontend..."
cd frontend
npm install > /dev/null 2>&1
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
sleep 2

# Start AI Service
echo "🤖 Starting AI Service..."
cd ai-services

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt > /dev/null 2>&1
python app.py &
AI_PID=$!
cd ..

echo ""
echo "✅ All services started!"
echo ""
echo "📍 Services:"
echo "   Backend:  http://localhost:5000"
echo "   Frontend: http://localhost:3000"
echo "   AI Service: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID $AI_PID; exit" INT
wait

