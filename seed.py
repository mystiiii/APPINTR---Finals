import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'timesync_project.settings')
django.setup()

from timesheet.models import User

# Create employee
if not User.objects.filter(username='employee1').exists():
    User.objects.create_user(
        username='employee1',
        password='password@123',
        role='EMPLOYEE',
        first_name='John',
        last_name='Doe',
        email='john.doe@timesync.local',
    )

# Create manager
if not User.objects.filter(username='manager1').exists():
    User.objects.create_user(
        username='manager1',
        password='password@123',
        role='MANAGER',
        first_name='Jane',
        last_name='Smith',
        email='jane.smith@timesync.local',
    )

# Create payroll
if not User.objects.filter(username='payroll1').exists():
    User.objects.create_user(
        username='payroll1',
        password='password@123',
        role='PAYROLL',
        first_name='Alice',
        last_name='Johnson',
        email='alice.johnson@timesync.local',
    )

print("Seed data created successfully.")
print("")
print("Login credentials:")
print("  Employee  → employee1 / password@123")
print("  Manager   → manager1  / password@123")
print("  Payroll   → payroll1  / password@123")
