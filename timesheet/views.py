from rest_framework import generics, serializers, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.shortcuts import get_object_or_404

from .models import User, OvertimeRequest, Log
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    OvertimeRequestSerializer,
)
from .permissions import IsEmployee, IsManager, IsPayroll


# ---------------------------------------------------------------------------
# Authentication Views
# ---------------------------------------------------------------------------

class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/
    Creates a new user account and returns JWT tokens so the
    user is immediately logged in after registration.
    """

    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Issue JWT tokens for the newly created user
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
            },
            status=status.HTTP_201_CREATED,
        )


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Extends the default JWT login response to include user profile data."""

    def validate(self, attrs):
        data = super().validate(attrs)

        # Block superusers/staff from the frontend — they should use /admin/
        if self.user.is_superuser or self.user.is_staff:
            raise serializers.ValidationError(
                'Admin accounts cannot log in here. Please use the admin panel.'
            )

        data['user'] = UserSerializer(self.user).data
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    POST /api/auth/login/
    Authenticates credentials and returns JWT tokens + user profile.
    """

    serializer_class = CustomTokenObtainPairSerializer


class MeView(APIView):
    """
    GET /api/auth/me/
    Returns the profile of the currently authenticated user.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


# ---------------------------------------------------------------------------
# Overtime Views — RBAC Enforced
# ---------------------------------------------------------------------------

class OvertimeListView(generics.ListAPIView):
    """
    GET /api/overtime/
    Returns overtime requests filtered by the authenticated user's role:
      - EMPLOYEE  → only their own requests
      - MANAGER   → only PENDING requests
      - PAYROLL   → only APPROVED requests
    """

    serializer_class = OvertimeRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == 'EMPLOYEE':
            return OvertimeRequest.objects.filter(
                employee=user
            ).order_by('-created_at')

        if user.role == 'MANAGER':
            return OvertimeRequest.objects.filter(
                status='PENDING'
            ).exclude(
                employee__is_superuser=True
            ).exclude(
                employee__is_staff=True
            ).order_by('-created_at')

        if user.role == 'PAYROLL':
            return OvertimeRequest.objects.filter(
                status='APPROVED'
            ).exclude(
                employee__is_superuser=True
            ).exclude(
                employee__is_staff=True
            ).order_by('-created_at')

        return OvertimeRequest.objects.none()


class OvertimeSubmitView(generics.CreateAPIView):
    """
    POST /api/overtime/submit/
    Employees submit overtime requests. The employee field is automatically
    set to the authenticated user — no need to pass employee_id.
    """

    serializer_class = OvertimeRequestSerializer
    permission_classes = [IsEmployee]

    def perform_create(self, serializer):
        instance = serializer.save(employee=self.request.user)
        Log.objects.create(
            user=self.request.user,
            action='Submitted Overtime Request',
            overtime_request=instance,
            details=f'{instance.hours} hours on {instance.date}',
        )


class OvertimeApproveView(APIView):
    """
    PATCH /api/overtime/approve/<pk>/
    Managers approve a pending overtime request.
    """

    permission_classes = [IsManager]

    def patch(self, request, pk):
        overtime_request = get_object_or_404(OvertimeRequest, pk=pk)

        if overtime_request.status != 'PENDING':
            return Response(
                {'detail': 'Only PENDING requests can be approved.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        overtime_request.status = 'APPROVED'
        overtime_request.save()

        Log.objects.create(
            user=request.user,
            action='Approved Overtime Request',
            overtime_request=overtime_request,
            details=f'Approved request ID {overtime_request.id}',
        )

        return Response(
            OvertimeRequestSerializer(overtime_request).data,
            status=status.HTTP_200_OK,
        )


class OvertimeDisapproveView(APIView):
    """
    PATCH /api/overtime/disapprove/<pk>/
    Managers reject a pending overtime request.
    """

    permission_classes = [IsManager]

    def patch(self, request, pk):
        overtime_request = get_object_or_404(OvertimeRequest, pk=pk)

        if overtime_request.status != 'PENDING':
            return Response(
                {'detail': 'Only PENDING requests can be rejected.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        overtime_request.status = 'REJECTED'
        overtime_request.save()

        Log.objects.create(
            user=request.user,
            action='Rejected Overtime Request',
            overtime_request=overtime_request,
            details=f'Rejected request ID {overtime_request.id}',
        )

        return Response(
            OvertimeRequestSerializer(overtime_request).data,
            status=status.HTTP_200_OK,
        )
