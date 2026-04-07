from rest_framework import serializers
from .models import User, OvertimeRequest, Log

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'role', 'email']


class OvertimeRequestSerializer(serializers.ModelSerializer):
    employee_details = UserSerializer(source='employee', read_only=True)
    employee_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='employee', write_only=True)

    class Meta:
        model = OvertimeRequest
        fields = ['id', 'employee_id', 'employee_details', 'date', 'hours', 'reason', 'status', 'created_at', 'updated_at']
        read_only_fields = ['status', 'created_at', 'updated_at']


class LogSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)

    class Meta:
        model = Log
        fields = ['id', 'user_details', 'action', 'timestamp', 'details']
