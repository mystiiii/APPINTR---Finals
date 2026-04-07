#!/bin/bash

# Navigate to the project directory
cd "$(dirname "$0")"

# Activate the virtual environment if it exists (checks for .venv and venv)
if [ -d ".venv" ]; then
    echo "Activating virtual environment (.venv)..."
    source .venv/bin/activate
elif [ -d "venv" ]; then
    echo "Activating virtual environment (venv)..."
    source venv/bin/activate
fi

# Install dependencies just to ensure we never get a ModuleNotFoundError
echo "Ensuring all required Python packages are installed..."
pip install -q -r requirements.txt

echo "Starting Django backend server..."
# Run the backend in the background
python3 manage.py runserver &
BACKEND_PID=$!

echo "Starting frontend server on port 5500..."
# Move to frontend directory and start the Python static file server
cd frontend
python3 -m http.server 5500 &
FRONTEND_PID=$!

echo ""
echo "========================================================="
echo "✅ Both servers are now running!"
echo "➡️  Frontend available at: http://localhost:5500/index.html"
echo "➡️  Backend available at:  http://127.0.0.1:8000/api/"
echo "========================================================="
echo "Press Ctrl+C to stop both servers."

# Trap Ctrl+C (SIGINT) to elegantly kill both servers when you exit
trap 'echo -e "\nStopping both servers..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' SIGINT

# Keep the script running to listen for Ctrl+C
wait $BACKEND_PID $FRONTEND_PID
