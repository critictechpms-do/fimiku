from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from django.db.models import Sum

from .models import Order, Product, Category


class AdminTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        if not user.is_staff and not user.is_superuser:
            raise AuthenticationFailed(
                "Unauthorized. Administrator privileges required."
            )

        token["username"] = user.username
        token["is_staff"] = user.is_staff

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        if not self.user.is_staff and not self.user.is_superuser:
            raise AuthenticationFailed(
                "Unauthorized. Administrator privileges required."
            )

        return data


class AdminTokenObtainPairView(TokenObtainPairView):
    serializer_class = AdminTokenObtainPairSerializer


@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_dashboard_stats(request):

    total_orders = Order.objects.count()

    paid_orders = Order.objects.filter(
        payment_status="PAID"
    )

    total_revenue = paid_orders.aggregate(
        total=Sum("total_amount")
    )["total"] or 0

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

    active_products = Product.objects.filter(
        is_active=True
    ).count()

    total_categories = Category.objects.count()

    low_stock_products = Product.objects.filter(
        stock__lte=10,
        is_active=True
    ).count()

    out_of_stock_products = Product.objects.filter(
        stock=0,
        is_active=True
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
            "cancelled": cancelled_orders
        },
        "inventory": {
            "total_products": total_products,
            "active_products": active_products,
            "total_categories": total_categories,
            "low_stock": low_stock_products,
            "out_of_stock": out_of_stock_products
        }
    })