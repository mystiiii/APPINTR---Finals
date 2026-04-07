from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, OvertimeRequest, Log

# Register your models here.
admin.site.register(User, UserAdmin)
admin.site.register(OvertimeRequest)
admin.site.register(Log)
