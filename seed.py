import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'timesync_project.settings')
django.setup()

from timesheet.models import User

# Create employee
if not User.objects.filter(username='employee1').exists():
    User.objects.create_user(username='employee1', password='password@123', role='EMPLOYEE', first_name='John', last_name='Doe')

# Create manager
if not User.objects.filter(username='manager1').exists():
    User.objects.create_user(username='manager1', password='password@123', role='MANAGER', first_name='Jane', last_name='Smith')

# Create payroll
if not User.objects.filter(username='payroll1').exists():
    User.objects.create_user(username='payroll1', password='password@123', role='PAYROLL', first_name='Alice', last_name='Johnson')

print("Users created successfully.")
