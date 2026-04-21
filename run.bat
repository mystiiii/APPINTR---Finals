@echo off
setlocal

:: Navigate to the project directory
cd /d "%~dp0"

:: Activate the virtual environment if it exists (checks for .venv and venv)
if exist ".venv\Scripts\activate.bat" (
    echo Activating virtual environment ^(.venv^)...
    call .venv\Scripts\activate.bat
) else if exist "venv\Scripts\activate.bat" (
    echo Activating virtual environment ^(venv^)...
    call venv\Scripts\activate.bat
)

:: Install dependencies just to ensure we never get a ModuleNotFoundError
echo Ensuring all required Python packages are installed...
pip install -q -r requirements.txt

:: Run migrations
echo Running database migrations...
python manage.py migrate --run-syncdb

echo Starting Django backend server...
:: Run the backend in a new window
start "TimeSync Backend" cmd /k "python manage.py runserver"

echo Starting frontend server on port 5500...
:: Run the frontend in a new window
start "TimeSync Frontend" cmd /k "cd frontend && python -m http.server 5500"

echo.
echo =========================================================
echo [OK] Both servers have been launched in separate windows!
echo ---  Frontend available at: http://localhost:5500/login.html
echo ---  Backend available at:  http://127.0.0.1:8000/api/
echo =========================================================
echo To stop the servers, close their terminal windows.
pause
