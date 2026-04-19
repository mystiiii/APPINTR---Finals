"""
Custom DRF permission classes for role-based access control.
Each class checks the authenticated user's `role` field against
the required role for the view.
"""

from rest_framework.permissions import BasePermission


class IsEmployee(BasePermission):
    """Grants access only to users with the EMPLOYEE role."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'EMPLOYEE'
        )


class IsManager(BasePermission):
    """Grants access only to users with the MANAGER role."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'MANAGER'
        )


class IsPayroll(BasePermission):
    """Grants access only to users with the PAYROLL role."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'PAYROLL'
        )


class IsManagerOrPayroll(BasePermission):
    """Grants access to users with either MANAGER or PAYROLL role."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ('MANAGER', 'PAYROLL')
        )
