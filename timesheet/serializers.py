from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, OvertimeRequest, Log


class UserSerializer(serializers.ModelSerializer):
    """Public-facing user representation (no sensitive fields)."""

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'role', 'email']


class RegisterSerializer(serializers.Serializer):
    """
    Handles new user registration with password confirmation
    and Django's built-in password validators.
    """

    username = serializers.CharField(max_length=150)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES)
    password = serializers.CharField(
        write_only=True, validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('A user with this username already exists.')
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {'password2': 'Passwords do not match.'}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class OvertimeRequestSerializer(serializers.ModelSerializer):
    """
    Overtime request serializer.
    On read: includes nested employee details.
    On write: employee is set automatically from request.user in the view.
    """

    employee_details = UserSerializer(source='employee', read_only=True)

    class Meta:
        model = OvertimeRequest
        fields = [
            'id', 'employee_details', 'date', 'hours',
            'reason', 'status', 'created_at', 'updated_at',
        ]
        read_only_fields = ['status', 'created_at', 'updated_at']


class LogSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)

    class Meta:
        model = Log
        fields = ['id', 'user_details', 'action', 'timestamp', 'details']
