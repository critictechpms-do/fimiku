
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView,
    CustomTokenObtainPairView,
    MeView,
    CategoryListView,
    ProductListView,
    ProductDetailView,
    CartView,
    WishlistView,
    CouponValidateView,
    CreateRazorpayOrderView,
    CreateCODOrderView,
    VerifyPaymentView,
    OrderListView,
    OrderDetailView,
    ReviewCreateView,
    AIAssistantView,
    AdminStatsView,
)

# Admin panel views
from .admin_views import (
    AdminTokenObtainPairView,
    admin_dashboard_stats,
    admin_account_settings,

    # Product management
    AdminProductListCreateView,
    AdminProductDetailView,
    AdminCategoryListView,
    admin_check_sku,
)


urlpatterns = [

    # ==========================================
    # CUSTOMER AUTHENTICATION
    # ==========================================

    path(
        'auth/register/',
        RegisterView.as_view(),
        name='register'
    ),

    path(
        'auth/login/',
        CustomTokenObtainPairView.as_view(),
        name='login'
    ),

    path(
        'auth/token/refresh/',
        TokenRefreshView.as_view(),
        name='refresh'
    ),

    path(
        'auth/me/',
        MeView.as_view(),
        name='me'
    ),

    # ==========================================
    # ADMIN AUTHENTICATION
    # ==========================================

    path(
        'admin/token/',
        AdminTokenObtainPairView.as_view(),
        name='admin_token'
    ),

    # ==========================================
    # ADMIN DASHBOARD
    # ==========================================

    path(
        'admin/dashboard/stats/',
        admin_dashboard_stats,
        name='admin_dashboard_stats'
    ),

    # ==========================================
    # ADMIN ACCOUNT SETTINGS
    # ==========================================

    path(
        'admin/account/',
        admin_account_settings,
        name='admin_account_settings'
    ),

    # ==========================================
    # ADMIN PRODUCT MANAGEMENT
    # ==========================================

    # List all products / create product
    path(
        'admin/products/',
        AdminProductListCreateView.as_view(),
        name='admin_products'
    ),

    # Retrieve / update / delete product
    path(
        'admin/products/<str:id>/',
        AdminProductDetailView.as_view(),
        name='admin_product_detail'
    ),

    # Admin category list
    path(
        'admin/categories/',
        AdminCategoryListView.as_view(),
        name='admin_categories'
    ),

    # SKU availability check
    path(
        'admin/products/check-sku/',
        admin_check_sku,
        name='admin_check_sku'
    ),

    # ==========================================
    # EXISTING ADMIN STATISTICS
    # ==========================================

    path(
        'admin-stats/',
        AdminStatsView.as_view(),
        name='admin_stats'
    ),

    # ==========================================
    # PUBLIC PRODUCT CATALOG
    # ==========================================

    path(
        'categories/',
        CategoryListView.as_view(),
        name='categories'
    ),

    path(
        'products/',
        ProductListView.as_view(),
        name='products'
    ),

    path(
        'products/<str:id>/',
        ProductDetailView.as_view(),
        name='product_detail'
    ),

    # ==========================================
    # CART & WISHLIST
    # ==========================================

    path(
        'cart/',
        CartView.as_view(),
        name='cart'
    ),

    path(
        'wishlist/',
        WishlistView.as_view(),
        name='wishlist'
    ),

    path(
        'coupons/validate/',
        CouponValidateView.as_view(),
        name='coupon_validate'
    ),

    # ==========================================
    # PAYMENTS
    # ==========================================

    path(
        'payment/create-order/',
        CreateRazorpayOrderView.as_view(),
        name='create_order'
    ),

    path(
        'payment/create-cod-order/',
        CreateCODOrderView.as_view(),
        name='create_cod_order'
    ),

    path(
        'payment/verify/',
        VerifyPaymentView.as_view(),
        name='verify_payment'
    ),

    # ==========================================
    # ORDERS
    # ==========================================

    path(
        'orders/',
        OrderListView.as_view(),
        name='orders_list'
    ),

    path(
        'orders/<str:id>/',
        OrderDetailView.as_view(),
        name='order_detail'
    ),

    # ==========================================
    # REVIEWS & AI
    # ==========================================

    path(
        'reviews/',
        ReviewCreateView.as_view(),
        name='create_review'
    ),

    path(
        'ai/assistant/',
        AIAssistantView.as_view(),
        name='ai_assistant'
    ),
]
