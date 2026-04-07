#!/bin/bash

# Navigate to the project directory
cd "$(dirname "$0")"
BASE_DIR=$(pwd)

# 1. Identify the virtual environment and set the Python path explicitly
if [ -d ".venv" ]; then
    echo "Using virtual environment (.venv)..."
    PYTHON_EXE="$BASE_DIR/.venv/bin/python"
elif [ -d "venv" ]; then
    echo "Using virtual environment (venv)..."
    PYTHON_EXE="$BASE_DIR/venv/bin/python"
else
    echo "❌ Error: No virtual environment (.venv or venv) found."
    echo "Please create one using: python3 -m venv .venv"
    exit 1
fi

# 2. Ensure dependencies are installed using the VENV's pip
echo "Ensuring all required Python packages are installed..."
$PYTHON_EXE -m pip install -q -r requirements.txt

# 3. Start Django backend server
echo "Starting Django backend server..."
$PYTHON_EXE manage.py runserver &
BACKEND_PID=$!

# 4. Start frontend server
# We use the absolute path to PYTHON_EXE so we don't have to worry about the 'cd'
echo "Starting frontend server on port 5500..."
if [ -d "frontend" ]; then
    cd frontend
    $PYTHON_EXE -m http.server 5500 &
    FRONTEND_PID=$!
    cd ..
else
    echo "⚠️  Warning: 'frontend' directory not found."
fi

echo ""
echo "========================================================="
echo "✅ Both servers are now running!"
echo "➡️  Frontend available at: http://localhost:5500/index.html"
echo "➡️  Backend available at:  http://127.0.0.1:8000/api/"
echo "========================================================="
echo "Press Ctrl+C to stop both servers."

# Trap Ctrl+C (SIGINT) to elegantly kill both servers
trap 'echo -e "\nStopping both servers..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' SIGINT

# Keep the script running
wait $BACKEND_PID $FRONTEND_PID