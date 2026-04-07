# TimeSync

TimeSync is a fully decoupled Overtime & Timesheet Approval System built with a Django API backend and a lightweight HTML/JS/Tailwind frontend. It aims to solve manual time-tracking challenges natively through an API-based architecture.

## Architecture Structure

- **Backend**: Django & Django REST Framework (DRF) serving JSON responses.
- **Frontend**: HTML, vanilla JavaScript (using native Fetch API), and Tailwind CSS for minimalist corporate styling.
- **Database**: SQLite (Development) easily configurable to MySQL/MariaDB for production.

## User Roles

1. **Employee**: Can view their own timesheets and submit new overtime hours.
2. **Line Manager**: Can view the dashboard of pending requests and approve them.
3. **Payroll Officer**: Can fetch only the approved overtime timesheets to determine pay scaling.

## Setup & Running Instructions

### 1. Prerequisites
- Python 3.8+ installed on your machine.
- macOS/Linux environment.

### 2. Initialization (First Time Only)

Open your terminal in the project directory, create your virtual environment, and set up your initial database structure:

```bash
# Create the virtual environment
python3 -m venv .venv

# Run database migrations
python3 manage.py makemigrations
python3 manage.py migrate

# Seed the database with dummy test users
python3 seed.py
```
> **Note:** The `seed.py` file creates ready-to-test accounts: `employee1`, `manager1`, and `payroll1` (The password for all accounts is `password@123`).

### 3. Quick Start (Running the Application)

We have provided a unified script to run the entire backend and frontend concurrently! 

Simply run the included bash script. It will automatically securely activate your virtual environment, install needed dependencies from `requirements.txt`, spin up the Django backend API, and spin up the frontend UI static server:

```bash
# Make it executable (only needed once)
chmod +x run.sh

# Start the servers!
./run.sh
```

- **Frontend Application:** Access via `http://localhost:5500/index.html`
- **Backend API:** Access via `http://127.0.0.1:8000/api/`

When you are finished testing the app, simply click into your terminal and press `Ctrl+C` to cleanly shut down both servers at exactly the same time.

## API Documentation

| Endpoint | Method | Expected Payload | Returns | Description |
| -------- | ------ | ---------------- | ------- | ----------- |
| `/api/users/` | `GET` | None | `[{id, username, role...}]` | Returns list of structured users |
| `/api/overtime/` | `GET` | None | `[{id, employee_details, hours...}]`| Grabs all timesheets in the system |
| `/api/overtime/submit/`| `POST`| `{"employee_id": 1, "date": "2024-05-12", "hours": 4.5, "reason": "Deadline"}` | New object dict | Submits an unapproved entry |
| `/api/overtime/approve/<id>/`| `PATCH`| `{"manager_id": 2}` (Optional for logs) | Approved object | Flips overtime status to 'APPROVED' |
