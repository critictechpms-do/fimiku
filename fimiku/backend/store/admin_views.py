
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import generics

from django.db.models import Sum
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

from .models import Order, Product, Category
from .serializers import ProductSerializer, CategorySerializer


# =========================================================
# ADMIN LOGIN AUTHENTICATION
# =========================================================

class AdminTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):

        if not user.is_staff and not user.is_superuser:
            raise AuthenticationFailed(
                "Administrator privileges required."
            )

        token = super().get_token(user)

        token["username"] = user.username
        token["is_staff"] = user.is_staff

        return token

    def validate(self, attrs):

        data = super().validate(attrs)

        if not self.user.is_staff and not self.user.is_superuser:
            raise AuthenticationFailed(
                "Administrator privileges required."
            )

        return data


class AdminTokenObtainPairView(TokenObtainPairView):

    serializer_class = AdminTokenObtainPairSerializer


# =========================================================
# ADMIN DASHBOARD STATISTICS
# =========================================================

@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_dashboard_stats(request):

    total_orders = Order.objects.count()

    successful_orders = Order.objects.filter(
        payment_status="PAID"
    )

    total_revenue = (
        successful_orders.aggregate(
            Sum("total_amount")
        )["total_amount__sum"]
        or 0
    )

    pending_orders = Order.objects.filter(
        order_status="PENDING"
    ).count()

    processing_orders = Order.objects.filter(
        order_status="PROCESSING"
    ).count()

    shipped_orders = Order.objects.filter(
        order_status="SHIPPED"
    ).count()

    delivered_orders = Order.objects.filter(
        order_status="DELIVERED"
    ).count()

    cancelled_orders = Order.objects.filter(
        order_status="CANCELLED"
    ).count()

    total_products = Product.objects.count()

    total_categories = Category.objects.count()

    low_stock_products = Product.objects.filter(
        stock__lte=10
    ).count()

    return Response({
        "revenue": {
            "total": float(total_revenue)
        },

        "orders": {
            "total": total_orders,
            "pending": pending_orders,
            "processing": processing_orders,
            "shipped": shipped_orders,
            "delivered": delivered_orders,
            "cancelled": cancelled_orders,
        },

        "inventory": {
            "total_products": total_products,
            "total_categories": total_categories,
            "low_stock": low_stock_products,
        }
    })


# =========================================================
# ADMIN ACCOUNT SETTINGS
# =========================================================

@api_view(["GET", "PUT"])
@permission_classes([IsAdminUser])
def admin_account_settings(request):

    User = get_user_model()

    user = request.user

    # GET CURRENT ADMIN INFORMATION

    if request.method == "GET":

        return Response({
            "username": user.username,
            "email": user.email,
        })

    # VERIFY CURRENT PASSWORD

    current_password = request.data.get(
        "current_password", ""
    )

    if not current_password:

        return Response(
            {
                "detail": "Current password is required."
            },
            status=400
        )

    if not user.check_password(current_password):

        return Response(
            {
                "detail": "Current password is incorrect."
            },
            status=400
        )

    # GET NEW CREDENTIALS

    new_username = request.data.get(
        "username", ""
    ).strip()

    new_password = request.data.get(
        "new_password", ""
    )

    if not new_username and not new_password:

        return Response(
            {
                "detail": "Enter a new username or password."
            },
            status=400
        )

    # USERNAME VALIDATION

    if new_username:

        if len(new_username) < 3:

            return Response(
                {
                    "detail": "Username must contain at least 3 characters."
                },
                status=400
            )

        if User.objects.exclude(
            pk=user.pk
        ).filter(
            username__iexact=new_username
        ).exists():

            return Response(
                {
                    "detail": "This username is already taken."
                },
                status=400
            )

        user.username = new_username

    # PASSWORD VALIDATION

    if new_password:

        try:

            validate_password(
                new_password,
                user=user
            )

        except ValidationError as exc:

            return Response(
                {
                    "detail": list(exc.messages)
                },
                status=400
            )

        user.set_password(new_password)

    # SAVE CHANGES

    user.save()

    return Response({
        "detail": "Admin account updated successfully.",
        "username": user.username,
        "password_changed": bool(new_password),
    })


# =========================================================
# ADMIN PRODUCT MANAGEMENT
# =========================================================

class AdminProductListCreateView(generics.ListCreateAPIView):

    serializer_class = ProductSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):

        # Admin can see active AND inactive products
        return Product.objects.all().order_by("-created_at")


class AdminProductDetailView(generics.RetrieveUpdateDestroyAPIView):

    serializer_class = ProductSerializer
    permission_classes = [IsAdminUser]
    lookup_field = "id"

    def get_queryset(self):

        return Product.objects.all()


# =========================================================
# ADMIN CATEGORY LIST
# =========================================================

class AdminCategoryListView(generics.ListAPIView):

    serializer_class = CategorySerializer
    permission_classes = [IsAdminUser]

    queryset = Category.objects.all().order_by("name")


# =========================================================
# ADMIN SKU VALIDATION
# =========================================================

@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_check_sku(request):

    sku = request.query_params.get(
        "sku", ""
    ).strip()

    if not sku:

        return Response(
            {
                "available": False,
                "detail": "SKU is required."
            },
            status=400
        )

    product_id = request.query_params.get(
        "product_id"
    )

    queryset = Product.objects.filter(
        sku__iexact=sku
    )

    if product_id:

        queryset = queryset.exclude(
            id=product_id
        )

    exists = queryset.exists()

    return Response({
        "sku": sku,
        "available": not exists,
        "detail": (
            "SKU is available."
            if not exists
            else "This SKU is already being used."
        )
    })
