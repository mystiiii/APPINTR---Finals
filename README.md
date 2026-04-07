# TimeSync

TimeSync is a fully decoupled Overtime & Timesheet Approval System built with a Django API backend and a lightweight HTML/JS/Tailwind frontend. It aims to solve manual time-tracking challenges natively through an API-based architecture.

## Architecture Structure

- **Backend**: Django & Django REST Framework (DRF) serving JSON responses.
- **Frontend** (Phase 3 pending): HTML, vanilla JavaScript (using native Fetch API), and Tailwind CSS for minimalist corporate styling.
- **Database**: SQLite (Development) easily configurable to MySQL/MariaDB for production mapping.

## User Roles

1. **Employee**: Can submit overtime hours including exact dates and reasons.
2. **Line Manager**: Can dashboard and approve pending overtime requests.
3. **Payroll Officer**: Can fetch approved overtime timesheets to determine pay scaling.

## Setup Instructions

### 1. Prerequisites
- Python 3.8+ installed on your machine.

### 2. Environment Setup

Open terminal in the project directory, then create and activate a virtual environment:

```bash
# MacOS / Linux
python3 -m venv venv
source venv/bin/activate

# Windows (Command Prompt / PowerShell)
venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Run Migrations & Setup Database

Generate and apply the SQLite data structure schemas:

```bash
python manage.py makemigrations
python manage.py migrate
```

> **Note:** A `seed.py` file has been provided and run to pre-seed the database with ready-to-test accounts: `employee1`, `manager1`, and `payroll1` (Password for all: `password@123`).

### 5. Running the Backend Server

Start up the Django development environment:

```bash
python manage.py runserver
```

The REST API will now be aggressively accessible starting at `http://127.0.0.1:8000/api/`. Be sure to set up your frontend (Live Server etc) and access the endpoints directly without hitting any CORS barriers (which operate wide open locally to un-hinder development).

## API Documentation

| Endpoint | Method | Expected Payload | Returns | Description |
| -------- | ------ | ---------------- | ------- | ----------- |
| `/api/users/` | `GET` | None | `[{id, username, role...}]` | Returns list of structured Users |
| `/api/overtime/` | `GET` | None | `[{id, employee_details, hours...}]`| Grabs all timesheets in system |
| `/api/overtime/submit/`| `POST`| `{"employee_id": 1, "date": "2024-05-12", "hours": 4.5, "reason": "Deadline"}` | New object dict | Logs a completely unapproved entry |
| `/api/overtime/approve/<id>/`| `PATCH` | `{"manager_id": 2}` (Optional for logs) | Approved object | Flips overtime token to 'APPROVED' |
