# TimeSync

TimeSync is a fully decoupled Overtime & Timesheet Approval System built with a Django API backend and a lightweight HTML/JS/Tailwind frontend. It aims to solve manual time-tracking challenges natively through an API-based architecture.

## Architecture Structure

- **Backend**: Django & Django REST Framework (DRF) serving JSON responses with secure JWT Authentication.
- **Frontend**: HTML, vanilla JavaScript (using native Fetch API), and Tailwind CSS for minimalist corporate styling.
- **Database**: SQLite (Development) configured via environment variables, easily scalable to PostgreSQL for production.

## User Roles

1. **Employee**: Can view their own timesheets and submit new overtime hours.
2. **Line Manager**: Can view the dashboard of pending requests and approve them.
3. **Payroll Officer**: Can fetch only the approved overtime timesheets to determine pay scaling.

## Setup & Running Instructions

### 1. Prerequisites
- Python 3.8+ installed on your machine.
- macOS/Linux or Windows environment.

### 2. Initialization (First Time Only)

Open your terminal in the project directory, create your virtual environment, configure your environment variables, and set up your initial database structure:

```bash
# Create the virtual environment
python3 -m venv .venv

# Create a copy of the environment template
cp .env.example .env

# Run database migrations
python3 manage.py makemigrations
python3 manage.py migrate

# Seed the database with dummy test users
python3 seed.py
```
> **Note:** The `seed.py` file creates ready-to-test accounts: `employee1`, `manager1`, and `payroll1` (The password for all accounts is `password@123`).

### 3. Quick Start (Running the Application)

We have provided a unified script to run the entire backend and frontend concurrently! 

**For macOS/Linux:**
Run the included bash script. It will automatically securely activate your virtual environment, install needed dependencies from `requirements.txt`, spin up the Django backend API, and spin up the frontend UI static server:

```bash
# Make it executable (only needed once)
chmod +x run.sh

# Start the servers!
./run.sh
```

**For Windows:**
Simply run the included batch script from your command prompt or by double-clicking it:

```cmd
run.bat
```

- **Frontend Application:** Access via `http://localhost:5500/index.html`
- **Backend API:** Access via `http://127.0.0.1:8000/api/`

When you are finished testing the app:
- **macOS/Linux**: Click into your terminal and press `Ctrl+C` to cleanly shut down both servers at exactly the same time.
- **Windows**: Close the two terminal windows that opened for the Frontend and Backend.

## API Documentation

All protected endpoints require a valid JSON Web Token (JWT) sent in the `Authorization` header: `Authorization: Bearer <your_access_token>`.

| Endpoint | Method | Expected Payload | Returns | Description |
| -------- | ------ | ---------------- | ------- | ----------- |
| `/api/auth/register/` | `POST` | `{"username", "password", "password2", "role"...}` | User obj & JWT tokens | Registers a new user account and returns tokens |
| `/api/auth/login/` | `POST` | `{"username", "password"}` | User obj & JWT tokens | Authenticates a user and returns access/refresh tokens |
| `/api/auth/refresh/` | `POST` | `{"refresh": "..."}` | `{"access": "..."}` | Exchanges a valid refresh token for a new access token |
| `/api/auth/me/` | `GET` | None | User obj dict | Returns the profile of the currently authenticated user |
| `/api/overtime/` | `GET` | None | `[{id, employee_details, hours...}]`| Grabs timesheets based on role (Employee: Own, Manager: Pending, Payroll: Approved) |
| `/api/overtime/submit/`| `POST`| `{"date": "2024-05-12", "hours": 4.5, "reason": "Deadline"}` | New object dict | Submits a new unapproved entry (Employee inferred from JWT) |
| `/api/overtime/approve/<id>/`| `PATCH`| None | Approved object dict | Flips overtime status to 'APPROVED' (Managers only) |
| `/api/overtime/disapprove/<id>/`| `PATCH`| None | Rejected object dict | Flips overtime status to 'REJECTED' (Managers only) |
