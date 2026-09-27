from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, CustomTokenObtainPairView, MeView, CategoryListView, ProductListView,
    ProductDetailView, CartView, WishlistView, CouponValidateView,
    CreateRazorpayOrderView, VerifyPaymentView, OrderListView,
    OrderDetailView, ReviewCreateView, AIAssistantView, AdminStatsView
)

urlpatterns = [
    # Auth endpoints
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('auth/me/', MeView.as_view(), name='me'),

    # Catalog endpoints
    path('categories/', CategoryListView.as_view(), name='categories'),
    path('products/', ProductListView.as_view(), name='products'),
    path('products/<int:id>/', ProductDetailView.as_view(), name='product_detail'),

    # Cart & Wishlist
    path('cart/', CartView.as_view(), name='cart'),
    path('wishlist/', WishlistView.as_view(), name='wishlist'),
    path('coupons/validate/', CouponValidateView.as_view(), name='coupon_validate'),

    # Orders & Payments
    path('payment/create-order/', CreateRazorpayOrderView.as_view(), name='create_order'),
    path('payment/verify/', VerifyPaymentView.as_view(), name='verify_payment'),
    path('orders/', OrderListView.as_view(), name='orders_list'),
    path('orders/<int:id>/', OrderDetailView.as_view(), name='order_detail'),

    # Reviews & AI
    path('reviews/', ReviewCreateView.as_view(), name='create_review'),
    path('ai/assistant/', AIAssistantView.as_view(), name='ai_assistant'),

    # Admin Stats
    path('admin-stats/', AdminStatsView.as_view(), name='admin_stats'),
]
